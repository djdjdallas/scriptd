import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ServerCreditManager } from '@/lib/credits/server-manager';
import { apiLogger } from '@/lib/monitoring/logger';
import { WORKFLOW_MODEL } from '@/lib/constants';

// Helper function to generate fallback titles
function generateFallbackTitles(topic) {
  // Extract a short topic name from the full summary blob
  const shortTopic = extractShortTopic(topic);

  const templates = [
    { text: `The Real Reason ${shortTopic} Happened`, emotion: 'curiosity', ctrEstimate: 'High', archetype: 'hidden-truth' },
    { text: `I Investigated ${shortTopic} — Here's What I Found`, emotion: 'curiosity', ctrEstimate: 'High', archetype: 'challenge' },
    { text: `${shortTopic} Explained in 10 Minutes`, emotion: 'efficiency', ctrEstimate: 'Medium', archetype: 'explainer' },
    { text: `How ${shortTopic} Affects You (And What To Do)`, emotion: 'personal', ctrEstimate: 'High', archetype: 'personal-stakes' },
    { text: `${shortTopic}: What Nobody Is Telling You`, emotion: 'exclusivity', ctrEstimate: 'High', archetype: 'hidden-truth' },
    { text: `Why ${shortTopic} Changes Everything`, emotion: 'urgency', ctrEstimate: 'Medium', archetype: 'contrarian' },
    { text: `${shortTopic} — The Complete Breakdown`, emotion: 'authority', ctrEstimate: 'Medium', archetype: 'explainer' },
    { text: `I Can't Believe What Happened With ${shortTopic}`, emotion: 'shock', ctrEstimate: 'High', archetype: 'emotional-hook' },
    { text: `5 Things You Need to Know About ${shortTopic}`, emotion: 'curiosity', ctrEstimate: 'Medium', archetype: 'numbered-list' },
    { text: `${shortTopic} Is Worse Than You Think`, emotion: 'fear', ctrEstimate: 'High', archetype: 'contrarian' }
  ];

  return templates.map(t => ({
    ...t,
    text: t.text.substring(0, 70)
  }));
}

// Extract a clean short topic from the full summary blob
function extractShortTopic(topic) {
  if (!topic) return 'This Topic';

  // If topic starts with "Title:", extract just that line
  const titleMatch = topic.match(/^Title:\s*(.+?)(?:\n|$)/i);
  if (titleMatch) {
    // Strip common prefixes from the extracted title
    let title = titleMatch[1].trim();
    // Remove the title if it's too long — take first meaningful phrase
    if (title.length > 50) {
      // Take text before first dash or colon
      const shortMatch = title.match(/^(.{15,50?})[\s]*[-–—:]/) || title.match(/^(.{15,50?})\s/);
      if (shortMatch) title = shortMatch[1].trim();
    }
    return title;
  }

  // Fallback: take first 50 chars
  return topic.length > 50 ? topic.substring(0, 50).trim() : topic;
}

// Extract key facts from research sources for the prompt
function extractResearchFacts(researchSources) {
  if (!researchSources || researchSources.length === 0) return '';

  const allContent = researchSources
    .filter(s => s.source_content && s.source_content.length > 100)
    .map(s => s.source_content)
    .join(' ')
    .substring(0, 50000); // Cap at 50k to avoid huge regex scans

  const facts = [];

  const amounts = allContent.match(/\$[\d,.]+(?: million| billion| M| B)?/gi);
  if (amounts) facts.push(`Dollar amounts found: ${[...new Set(amounts.slice(0, 5))].join(', ')}`);

  const percentages = allContent.match(/\d+(?:\.\d+)?%/g);
  if (percentages) facts.push(`Percentages found: ${[...new Set(percentages.slice(0, 5))].join(', ')}`);

  const dates = allContent.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi);
  if (dates) facts.push(`Key dates: ${[...new Set(dates.slice(0, 3))].join(', ')}`);

  const companies = allContent.match(/\b(?:Google|Apple|Microsoft|Amazon|Meta|Tesla|Netflix|Whole Foods|UNFI|FBI|SEC|DOJ|FTC|FDA|WHO|NATO)\b/gi);
  if (companies) facts.push(`Organizations mentioned: ${[...new Set(companies.slice(0, 5))].join(', ')}`);

  const outcomes = allContent.match(/\b(?:fine|fined|settlement|resignation|arrest|convicted|sentenced|fired|lawsuit|breach|hack|attack|shutdown|outage)\b/gi);
  if (outcomes) facts.push(`Key outcomes: ${[...new Set(outcomes.slice(0, 5))].join(', ')}`);

  if (facts.length === 0) return '';
  return `\nRESEARCH FACTS (use these real details in titles — do NOT invent numbers):\n${facts.join('\n')}\n`;
}

export async function POST(request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      topic, keywords, audience, tone, voiceProfile,
      researchSources, contentIdeaInfo, niche
    } = await request.json();

    // Deduct credits BEFORE generation so we fail fast if insufficient
    const creditResult = await ServerCreditManager.deductCredits(
      supabase,
      user.id,
      'TITLE_GENERATION',
      { workflowId: topic }
    );

    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || 'Insufficient credits' },
        { status: 402 }
      );
    }

    let titles = [];
    let creditsUsed = 1;

    // Build context sections
    const researchFacts = extractResearchFacts(researchSources);

    const voiceContext = voiceProfile
      ? `Voice/Style: ${voiceProfile.name || ''}${voiceProfile.tone?.length ? ` | Tone: ${Array.isArray(voiceProfile.tone) ? voiceProfile.tone.join(', ') : voiceProfile.tone}` : ''}${voiceProfile.style?.length ? ` | Style: ${Array.isArray(voiceProfile.style) ? voiceProfile.style.join(', ') : voiceProfile.style}` : ''}`
      : '';

    const nicheContext = niche ? `Niche: ${niche}` : '';

    const contentIdeaContext = contentIdeaInfo?.title
      ? `Based on trending event: ${contentIdeaInfo.title}`
      : '';

    // Use Claude API to generate titles
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: WORKFLOW_MODEL,
            max_tokens: 2048,
            temperature: 0.6,
            system: `You are a YouTube title strategist who studies viral titles from top creators like MrBeast, Veritasium, Johnny Harris, and MKBHD. You create titles that generate curiosity and clicks — NOT news headlines or blog post titles. Every title must sound like something a real YouTuber would publish. Return ONLY valid JSON with no markdown formatting.`,
            messages: [
              {
                role: 'user',
                content: `Generate 10 YouTube video titles for:

Topic: ${topic}
${keywords?.length > 0 ? `Keywords: ${keywords.join(', ')}` : ''}
Target Audience: ${audience || 'General audience'}
Tone: ${tone || 'Engaging'}
${voiceContext}
${nicheContext}
${contentIdeaContext}
${researchFacts}
TITLE ARCHETYPES — Generate one title for EACH of these 10 YouTube-proven patterns:

1. **PATTERN INTERRUPT** — Start with unexpected action or result
   "I Lived on $1 a Day for 30 Days" / "I Let AI Run My Business for a Week"

2. **HIDDEN TRUTH** — Reveal something the audience doesn't know
   "The Real Reason Airlines Overbook Flights" / "What They Don't Tell You About Solar Panels"

3. **PERSONAL STAKES** — Make the viewer the subject, use "you/your"
   "This Hack Affected YOUR Grocery Store" / "Your Phone Is Doing This Without You Knowing"

4. **NUMBERED LIST** — Specific number + strong promise
   "7 Signs Your Bank Is About to Fail" / "3 Lies the Food Industry Tells You"

5. **HOW/WHY EXPLAINER** — Clear educational promise
   "How One Email Took Down a $50B Company" / "Why Japan's Trains Are Never Late"

6. **INVESTIGATION/DEEP DIVE** — Creator as detective
   "I Investigated the Company Poisoning Our Water" / "I Tracked Down the Hacker Who Stole $600M"

7. **VS / COMPARISON** — Two forces in tension
   "Hackers vs Hospitals: The War Nobody Sees" / "China vs USA: The Chip War Explained"

8. **EMOTIONAL HOOK** — Lead with feeling, reveal comes after
   "This Changed How I Think About Money Forever" / "I Was Wrong About Electric Cars"

9. **AUTHORITY/EXPERT** — Leverage credibility
   "A Former FBI Agent Explains How Hackers Actually Work" / "NASA Engineer Reveals What's Really on Mars"

10. **CONTRARIAN** — Challenge conventional wisdom
    "Why the Biggest Cyber Attack Was Actually a Good Thing" / "Everyone Is Wrong About AI Taking Your Job"

RULES:
- Aim for 55-70 characters per title. Longer titles perform better on YouTube — use the full space to add specifics, emotional detail, or a second hook. Titles under 50 chars are too short.
- Use "you", "your", "I" to make titles personal and conversational
- Include REAL specifics from research (numbers, company names, dates) — never invent facts
- Each title must create a specific curiosity gap (viewer needs to click to resolve it)
- Titles should feel like YouTube, not CNN or a blog post
- Add parenthetical hooks like "(Nobody's Talking About This)" or "— And It's Getting Worse" to fill space

DO NOT:
- Write generic news headlines like "Company X Hit by Cyber Attack"
- Use ALL CAPS for entire titles (one emphasis word is ok: "THIS", "NEVER")
- Write vague teasers with no specifics
- Start multiple titles with the same word

Return ONLY a JSON array of exactly 10 objects:
[
  {
    "text": "The title text (aim for 55-70 chars)",
    "emotion": "Primary emotional hook (curiosity/fear/excitement/urgency/shock/personal/authority)",
    "ctrEstimate": "High/Medium/Low",
    "archetype": "pattern-interrupt/hidden-truth/personal-stakes/numbered-list/explainer/investigation/comparison/emotional-hook/authority/contrarian"
  }
]`
              }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();

          try {
            const content = claudeData.content?.[0]?.text || '';
            // Strip markdown code blocks if present
            const jsonContent = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
            titles = JSON.parse(jsonContent);

            // Validate the structure
            if (!Array.isArray(titles) || titles.length === 0) {
              throw new Error('Invalid response format');
            }
          } catch (parseError) {
            apiLogger.error('Title parse error', parseError, { content: claudeData.content?.[0]?.text?.substring(0, 200) });
            titles = generateFallbackTitles(topic);
          }
        } else {
          const errorBody = await claudeResponse.text().catch(() => 'unknown');
          apiLogger.error('Claude API error for titles', { status: claudeResponse.status, body: errorBody.substring(0, 200) });
          titles = generateFallbackTitles(topic);
        }
      } catch (fetchError) {
        apiLogger.error('Claude API fetch error for titles', fetchError);
        titles = generateFallbackTitles(topic);
      }
    } else {
      titles = generateFallbackTitles(topic);
    }

    return NextResponse.json({
      titles,
      creditsUsed
    });
  } catch (error) {
    apiLogger.error('Title generation error', error);
    return NextResponse.json(
      { error: 'Failed to generate titles' },
      { status: 500 }
    );
  }
}

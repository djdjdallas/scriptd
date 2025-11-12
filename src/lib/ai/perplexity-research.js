// Perplexity API integration for factual research
// This service fetches real, documented events for content ideas

export async function searchRecentCrimes(topic, options = {}) {
  const {
    dateRange = 'past year',
    maxResults = 10,
    category = 'financial fraud'
  } = options;

  try {
    const searchQuery = `recent ${topic} ${category} cases ${dateRange} documented real events with sources`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant that ONLY provides factual, documented cases with verifiable sources. Each case must be real and have news coverage.'
          },
          {
            role: 'user',
            content: `Find ${maxResults} real, documented ${searchQuery}. For each case provide:
            1. Case name and main perpetrator(s)
            2. Date (month/year)
            3. Amount stolen/affected
            4. Brief description (2-3 sentences)
            5. Current status (arrested/convicted/fugitive/etc)
            6. 2-3 credible news sources (URLs)

            Format as JSON array. Only include REAL, VERIFIABLE cases.`
          }
        ],
        temperature: 0.2, // Low temperature for factual accuracy
        max_tokens: 2000,
        return_citations: true,
        return_related_questions: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error response:', errorText);
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Perplexity API response structure:', data);
      throw new Error('Invalid API response structure');
    }

    const content = data.choices[0].message.content;

    // Extract JSON from response
    let cases;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      cases = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (e) {
      console.error('Failed to parse Perplexity response:', e);
      cases = [];
    }

    // Add citations if available
    if (data.citations) {
      cases = cases.map((caseItem, index) => ({
        ...caseItem,
        perplexityCitations: data.citations.slice(index * 2, (index + 1) * 2)
      }));
    }

    return {
      success: true,
      cases,
      searchQuery,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Perplexity search error:', error);
    return {
      success: false,
      error: error.message,
      cases: []
    };
  }
}

export async function verifyEvent(eventTitle, eventDetails = '') {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: `Verify if this is a real event: "${eventTitle}". ${eventDetails}

            Search for credible sources and return:
            {
              "isReal": true/false,
              "confidence": 0-100,
              "realEventName": "actual name if different",
              "date": "when it happened",
              "sources": ["url1", "url2"],
              "summary": "brief factual summary if real"
            }`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
        return_citations: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error response:', errorText);
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Perplexity API response structure:', data);
      throw new Error('Invalid API response structure');
    }

    const content = data.choices[0].message.content;

    let verification;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      verification = jsonMatch ? JSON.parse(jsonMatch[0]) : { isReal: false, confidence: 0 };
    } catch (e) {
      verification = { isReal: false, confidence: 0, error: 'Parse error' };
    }

    return {
      success: true,
      verification,
      citations: data.citations || []
    };

  } catch (error) {
    console.error('Verification error:', error);
    return {
      success: false,
      verification: { isReal: false, confidence: 0 },
      error: error.message
    };
  }
}

export async function getEventDetails(eventName, options = {}) {
  const { includeTimeline = true, includeVictims = false } = options;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: `Research the real case: "${eventName}"

            Provide detailed information:
            {
              "fullName": "complete case name",
              "perpetrators": ["list of main people involved"],
              "dateRange": "start to end dates",
              "amountStolen": "total amount if applicable",
              "victimCount": "number of victims",
              "method": "how the crime was committed",
              "discovery": "how it was discovered",
              "currentStatus": "arrests/trials/sentences",
              ${includeTimeline ? '"timeline": ["key events in order"],' : ''}
              "keyFacts": ["5-7 most important facts"],
              "sources": [
                {
                  "title": "article title",
                  "publisher": "news source",
                  "url": "link",
                  "date": "publication date"
                }
              ]
            }

            Only use verified, factual information from credible sources.`
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        return_citations: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error response:', errorText);
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Perplexity API response structure:', data);
      throw new Error('Invalid API response structure');
    }

    const content = data.choices[0].message.content;

    let details;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      details = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('Failed to parse event details:', e);
      details = {};
    }

    return {
      success: true,
      details,
      citations: data.citations || [],
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Get event details error:', error);
    return {
      success: false,
      details: {},
      error: error.message
    };
  }
}

export async function searchTrendingCases(options = {}) {
  const {
    timeframe = 'past month',
    minViralScore = 70,
    topic = 'newsworthy events',
    category = 'general news'
  } = options;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: `Find trending ${topic} related to ${category} from the ${timeframe} that are getting significant media attention.

            For each case, rate its "viral potential" (0-100) based on:
            - How shocking/unusual it is
            - Media coverage volume
            - Public interest
            - Storytelling potential

            Return 10 cases with viral score >= ${minViralScore} as JSON:
            {
              "cases": [
                {
                  "title": "case name",
                  "headline": "attention-grabbing summary",
                  "viralScore": 0-100,
                  "trendingReason": "why it's viral",
                  "uniqueAngle": "what makes it special",
                  "date": "when it happened",
                  "sources": ["urls"]
                }
              ]
            }`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        return_citations: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error response:', errorText);
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Perplexity API response structure:', data);
      throw new Error('Invalid API response structure');
    }

    const content = data.choices[0].message.content;

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { cases: [] };
    } catch (e) {
      result = { cases: [] };
    }

    return {
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Search trending cases error:', error);
    return {
      success: false,
      cases: [],
      error: error.message
    };
  }
}

// Helper function to format Perplexity results for Claude
export function formatResearchForClaude(perplexityData) {
  if (!perplexityData.success || !perplexityData.cases) {
    return [];
  }

  return perplexityData.cases.map(caseItem => ({
    realEvent: {
      name: caseItem.title || caseItem.caseName,
      date: caseItem.date,
      amount: caseItem.amountStolen || caseItem.amount,
      status: caseItem.currentStatus || caseItem.status,
      description: caseItem.description || caseItem.summary,
      sources: caseItem.sources || []
    },
    contentPotential: {
      viralScore: caseItem.viralScore || 75,
      uniqueAngle: caseItem.uniqueAngle || caseItem.trendingReason,
      audienceHook: caseItem.headline || `The shocking story of ${caseItem.title}`
    }
  }));
}

export default {
  searchRecentCrimes,
  verifyEvent,
  getEventDetails,
  searchTrendingCases,
  formatResearchForClaude
};
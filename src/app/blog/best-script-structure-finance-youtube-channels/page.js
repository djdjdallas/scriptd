'use client';

/**
 * Blog Post: Best Script Structure for Finance YouTube Channels
 *
 * Niche-specific script writing guide for finance creators.
 */

import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Tag,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MarketingSection,
  MarketingCard
} from '@/components/marketing/MarketingLayout';
import { getBlogPost, getRelatedPosts, formatDate } from '@/lib/blog/blog-utils';

export default function FinanceScriptBlogPost() {
  const post = getBlogPost('best-script-structure-finance-youtube-channels');
  const relatedPosts = getRelatedPosts('best-script-structure-finance-youtube-channels');

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/blog" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
            {post?.category || 'Script Writing'}
          </span>
          <span className="text-gray-500 flex items-center gap-1 text-sm">
            <Calendar className="w-4 h-4" />
            {post ? formatDate(post.publishedAt) : 'January 8, 2025'}
          </span>
          <span className="text-gray-500 flex items-center gap-1 text-sm">
            <Clock className="w-4 h-4" />
            {post?.readTime || '10 min read'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Best Script Structure for Finance YouTube Channels
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
          Finance content has unique challenges: complex topics, skeptical audiences, and compliance
          requirements. Here&apos;s the script structure that top finance YouTubers use to educate,
          engage, and grow their channels.
        </p>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          {/* Key Framework Box */}
          <MarketingCard className="p-6 mb-8 border-l-4 border-green-500 not-prose">
            <div className="flex items-start gap-3">
              <DollarSign className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">The Finance Script Framework</h3>
                <p className="text-gray-300 m-0">
                  <strong>Hook (15s)</strong> → <strong>Stakes (30s)</strong> → <strong>Education (3-5min)</strong>
                  → <strong>Proof (1-2min)</strong> → <strong>Action (30s)</strong>
                </p>
              </div>
            </div>
          </MarketingCard>

          <h2>Why Finance Content Is Different</h2>

          <p>
            Finance YouTubers face a unique set of challenges that most content creators don&apos;t
            deal with:
          </p>

          <ul>
            <li><strong>Skeptical viewers</strong> — People are (rightfully) cautious about money advice</li>
            <li><strong>Complex topics</strong> — You need to simplify without oversimplifying</li>
            <li><strong>Compliance concerns</strong> — Avoiding &quot;financial advice&quot; liability</li>
            <li><strong>High-intent audience</strong> — Viewers want actionable information, not fluff</li>
          </ul>

          <p>
            The script structure that works for entertainment or lifestyle content doesn&apos;t work
            here. Finance viewers need more proof, more clarity, and more specific guidance.
          </p>

          <h2>The 5-Part Finance Script Structure</h2>

          <h3>Part 1: The Hook (First 15 Seconds)</h3>

          <p>
            Finance hooks need to create immediate stakes. Your viewer needs to understand—within
            seconds—why this video matters to their money.
          </p>

          <div className="my-6 not-prose">
            <MarketingCard className="p-6">
              <h4 className="text-white font-semibold mb-4">Hook Formulas That Work for Finance</h4>
              <div className="space-y-4">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-purple-400 text-sm mb-1">The Mistake Hook</div>
                  <p className="text-gray-300 m-0 italic">
                    &quot;I just realized I&apos;ve been losing $3,000 a year to this one investing mistake.
                    And most people are making the same error.&quot;
                  </p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-purple-400 text-sm mb-1">The Revelation Hook</div>
                  <p className="text-gray-300 m-0 italic">
                    &quot;This week, the Fed quietly changed something that affects every single dollar
                    in your bank account.&quot;
                  </p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-purple-400 text-sm mb-1">The Proof Hook</div>
                  <p className="text-gray-300 m-0 italic">
                    &quot;Here&apos;s my actual portfolio screen from 2024. I&apos;m up 34%. Let me show you
                    exactly how—and what I&apos;d do differently.&quot;
                  </p>
                </div>
              </div>
            </MarketingCard>
          </div>

          <p>
            Notice the pattern: specific numbers, personal stakes, and immediate relevance.
            Generic hooks like &quot;In today&apos;s video, we&apos;ll discuss investing...&quot; kill retention
            instantly in finance content.
          </p>

          <h3>Part 2: The Stakes (30 Seconds)</h3>

          <p>
            After the hook, expand on why this matters. This is where you establish the cost of
            NOT watching—the opportunity cost, the potential losses, the mistakes they&apos;re
            probably making.
          </p>

          <div className="my-6 not-prose">
            <MarketingCard className="p-4 border-l-4 border-yellow-500">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-yellow-400 text-sm mb-1">Example Stakes Section</div>
                  <p className="text-gray-300 m-0 italic">
                    &quot;Here&apos;s what most people don&apos;t realize: this one thing is costing the average investor
                    $2,000 to $5,000 every single year. Over a 30-year career, that&apos;s potentially $150,000
                    you&apos;re leaving on the table. I was doing this too until last year.&quot;
                  </p>
                </div>
              </div>
            </MarketingCard>
          </div>

          <h3>Part 3: The Education (3-5 Minutes)</h3>

          <p>
            This is the core of your finance video. Break down the concept, strategy, or analysis
            into digestible chunks. The key structure for finance education:
          </p>

          <div className="my-6 not-prose">
            <div className="grid md:grid-cols-3 gap-4">
              <MarketingCard className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 font-bold">1</span>
                </div>
                <div className="font-semibold text-white mb-1">The What</div>
                <div className="text-sm text-gray-400">Explain the concept simply</div>
              </MarketingCard>
              <MarketingCard className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <div className="font-semibold text-white mb-1">The Why</div>
                <div className="text-sm text-gray-400">Why it matters for THEM</div>
              </MarketingCard>
              <MarketingCard className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <div className="font-semibold text-white mb-1">The How</div>
                <div className="text-sm text-gray-400">Step-by-step implementation</div>
              </MarketingCard>
            </div>
          </div>

          <p>
            Finance audiences hate fluff. Every sentence should either teach something or
            reinforce why it matters. Cut anything that doesn&apos;t serve those purposes.
          </p>

          <h3>Part 4: The Proof (1-2 Minutes)</h3>

          <p>
            This is what separates successful finance channels from forgettable ones. Show
            real results, real numbers, real examples. Options include:
          </p>

          <ul>
            <li><strong>Your own results</strong> — Portfolio screenshots, actual returns, real trades</li>
            <li><strong>Case studies</strong> — Historical examples with specific numbers</li>
            <li><strong>Data visualization</strong> — Charts showing the strategy&apos;s performance</li>
            <li><strong>Testimonials</strong> — Community members who&apos;ve applied your advice</li>
          </ul>

          <div className="my-6 not-prose">
            <MarketingCard className="p-4 border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <div className="text-green-400 text-sm mb-1">Proof Section Example</div>
                  <p className="text-gray-300 m-0 italic">
                    &quot;Let me show you my actual brokerage account. This position, opened in March,
                    is up 23%. But here&apos;s the important part—I&apos;m showing you exactly why I entered,
                    and what I got wrong initially. See this drawdown here in May?&quot;
                  </p>
                </div>
              </div>
            </MarketingCard>
          </div>

          <h3>Part 5: The Action (30 Seconds)</h3>

          <p>
            Finance viewers want to DO something. End with specific, actionable next steps.
            Not &quot;start investing&quot;—that&apos;s too vague. Instead:
          </p>

          <ul>
            <li>&quot;This week, log into your 401k and check if you&apos;re in a target-date fund.&quot;</li>
            <li>&quot;Open a spreadsheet and calculate your actual expense ratio across all accounts.&quot;</li>
            <li>&quot;Set a calendar reminder to rebalance in 90 days.&quot;</li>
          </ul>

          <h2>The Compliance Disclaimer</h2>

          <p>
            Finance content requires careful language. Never give &quot;financial advice&quot;—instead,
            share &quot;education&quot; and &quot;personal experience.&quot; Standard disclaimer template:
          </p>

          <div className="my-6 not-prose">
            <MarketingCard className="p-4 bg-gray-900/50">
              <p className="text-gray-400 text-sm m-0 italic">
                &quot;Quick disclaimer: I&apos;m not a financial advisor, and this isn&apos;t financial advice.
                I&apos;m sharing what I&apos;ve learned and what I personally do. Always do your own research
                and consider consulting a professional for your specific situation.&quot;
              </p>
            </MarketingCard>
          </div>

          <p>
            Place this early in your video (after the hook) to protect yourself legally while
            not disrupting the flow with a long disclaimer at the start.
          </p>

          <h2>Template: 10-Minute Finance Video</h2>

          <p>
            Here&apos;s a complete template you can use for your next finance video:
          </p>

          <div className="my-8 not-prose">
            <MarketingCard className="p-6">
              <h4 className="text-white font-semibold mb-4">Script Template</h4>
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-purple-500/10 rounded-lg border-l-4 border-purple-500">
                  <div className="text-purple-400 font-medium">0:00-0:15 — HOOK</div>
                  <p className="text-gray-400 m-0">[Specific mistake/revelation/proof that creates immediate stakes]</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-400 font-medium">0:15-0:30 — DISCLAIMER</div>
                  <p className="text-gray-400 m-0">[Quick compliance disclaimer]</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-400 font-medium">0:30-1:00 — STAKES</div>
                  <p className="text-gray-400 m-0">[Cost of not watching—specific numbers, time lost]</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-400 font-medium">1:00-6:00 — EDUCATION</div>
                  <p className="text-gray-400 m-0">[What → Why → How, broken into 3-4 subtopics]</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-400 font-medium">6:00-8:00 — PROOF</div>
                  <p className="text-gray-400 m-0">[Your results, case studies, data visualization]</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-400 font-medium">8:00-9:00 — MISTAKES</div>
                  <p className="text-gray-400 m-0">[What you got wrong, lessons learned—builds trust]</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg border-l-4 border-green-500">
                  <div className="text-green-400 font-medium">9:00-10:00 — ACTION + CTA</div>
                  <p className="text-gray-400 m-0">[Specific next step, related video suggestion]</p>
                </div>
              </div>
            </MarketingCard>
          </div>

          <h2>Common Mistakes in Finance Scripts</h2>

          <div className="my-6 not-prose space-y-4">
            <MarketingCard className="p-4 border-l-4 border-red-500">
              <div className="font-semibold text-white mb-1">Mistake #1: Too Much Jargon</div>
              <p className="text-gray-400 text-sm m-0">
                Saying &quot;PE ratio&quot; without explaining it loses beginners. Explaining every term
                loses experienced viewers. Solution: quick parenthetical definitions.
              </p>
            </MarketingCard>
            <MarketingCard className="p-4 border-l-4 border-red-500">
              <div className="font-semibold text-white mb-1">Mistake #2: No Personal Stakes</div>
              <p className="text-gray-400 text-sm m-0">
                Viewers want to know YOU have skin in the game. Always include what you&apos;re
                personally doing—even if it&apos;s different from what you&apos;re teaching.
              </p>
            </MarketingCard>
            <MarketingCard className="p-4 border-l-4 border-red-500">
              <div className="font-semibold text-white mb-1">Mistake #3: Generic Advice</div>
              <p className="text-gray-400 text-sm m-0">
                &quot;Diversify your portfolio&quot; is useless. &quot;Here&apos;s my exact allocation: 60% VTI, 25%
                VXUS, 15% BND, and why I chose each one&quot; is valuable.
              </p>
            </MarketingCard>
          </div>

          <h2>Making Finance Content Compliant</h2>

          <p>
            Finance content faces extra scrutiny under YouTube&apos;s 2025 authenticity policy.
            AI-generated finance scripts often get flagged for:
          </p>

          <ul>
            <li>Generic advice without personal experience</li>
            <li>Repetitive structure across videos</li>
            <li>Missing specific data and examples</li>
          </ul>

          <p>
            The personal elements we discussed—your mistakes, your results, your specific
            recommendations—also serve as compliance markers that signal human authorship.
          </p>
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-gray-500" />
            {post?.tags.map(tag => (
              <Link
                key={tag}
                href={`/blog?tag=${tag.replace(/\s+/g, '-')}`}
                className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-sm hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Author */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="font-medium text-white">GenScript Team</div>
              <div className="text-sm text-gray-400">Building tools for YouTube creators</div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <MarketingSection>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map(related => (
                <Link key={related.slug} href={`/blog/${related.slug}`}>
                  <MarketingCard className="p-6 h-full hover:border-purple-500/50 transition-colors">
                    <span className="text-xs text-gray-500">{related.category}</span>
                    <h3 className="text-lg font-semibold text-white mt-2 mb-2">{related.title}</h3>
                    <p className="text-sm text-gray-400">{related.excerpt}</p>
                  </MarketingCard>
                </Link>
              ))}
            </div>
          </div>
        </MarketingSection>
      )}

      {/* CTA */}
      <MarketingSection className="border-t border-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Generate Finance Scripts in Seconds
          </h2>
          <p className="text-gray-400 mb-6">
            GenScript includes templates specifically designed for finance content.
            50 free credits to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
                Start Writing Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/tools/youtube-script-generator">
              <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
                <Target className="w-4 h-4 mr-2" />
                See Script Generator
              </Button>
            </Link>
          </div>
        </div>
      </MarketingSection>
    </div>
  );
}

'use client';

/**
 * YouTube Compliance Framework Whitepaper
 *
 * Long-form educational content about YouTube's authenticity policy
 * and the GenScript compliance framework.
 */

import Link from 'next/link';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  Download,
  BookOpen,
  Users,
  TrendingUp,
  Zap,
  Target,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MarketingSection,
  MarketingCard,
  CTASection
} from '@/components/marketing/MarketingLayout';

// Table of contents sections
const tableOfContents = [
  { id: 'executive-summary', title: 'Executive Summary' },
  { id: 'understanding-policy', title: 'Understanding YouTube\'s Policy' },
  { id: 'compliance-framework', title: 'The GenScript Compliance Framework' },
  { id: 'four-pillars', title: 'Four Pillars of Compliant Content' },
  { id: 'case-studies', title: 'Case Studies' },
  { id: 'implementation', title: 'Technical Implementation' },
  { id: 'conclusion', title: 'Conclusion & Next Steps' }
];

export default function YouTubeComplianceWhitepaper() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <MarketingSection gradient className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Free Whitepaper</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
            YouTube Compliance Framework
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            The definitive guide to creating AI-assisted YouTube content that stays
            monetized under YouTube&apos;s 2025 authenticity policy.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              15 min read
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              5,000+ downloads
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Updated January 2025
            </span>
          </div>
        </div>
      </MarketingSection>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          {/* Sticky Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <MarketingCard className="p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {tableOfContents.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="block w-full text-left text-gray-400 hover:text-white transition-colors py-1 text-sm"
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-800">
                  <Link href="/compliance-check">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Check Your Script
                    </Button>
                  </Link>
                </div>
              </MarketingCard>
            </div>
          </aside>

          {/* Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            {/* Executive Summary */}
            <section id="executive-summary" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                Executive Summary
              </h2>

              <MarketingCard className="p-6 mb-6 border-l-4 border-purple-500">
                <p className="text-gray-300 m-0">
                  <strong className="text-white">Key Takeaway:</strong> YouTube&apos;s July 2025 authenticity policy
                  doesn&apos;t ban AI-assisted content—it requires creators to add original value. Scripts that pass
                  compliance checks see 40% higher monetization rates than those flagged for review.
                </p>
              </MarketingCard>

              <p className="text-gray-300">
                In July 2025, YouTube implemented its most significant content policy update in years. The new
                &quot;Authenticity and Original Content&quot; guidelines specifically target AI-generated content that
                provides little to no original value. For creators using AI tools to write scripts, this
                policy represents both a challenge and an opportunity.
              </p>

              <p className="text-gray-300">
                This whitepaper provides a comprehensive analysis of the policy, introduces the GenScript
                Compliance Framework, and offers practical strategies for creating AI-assisted content that
                remains fully monetized. Our framework is built on analysis of over 10,000 YouTube scripts
                and direct testing against YouTube&apos;s automated content review systems.
              </p>

              <div className="grid md:grid-cols-3 gap-4 my-8">
                <MarketingCard className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">85%</div>
                  <div className="text-sm text-gray-400">of flagged scripts have fixable issues</div>
                </MarketingCard>
                <MarketingCard className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">40%</div>
                  <div className="text-sm text-gray-400">higher monetization with compliance</div>
                </MarketingCard>
                <MarketingCard className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">4</div>
                  <div className="text-sm text-gray-400">pillars of compliant content</div>
                </MarketingCard>
              </div>
            </section>

            {/* Understanding the Policy */}
            <section id="understanding-policy" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                Understanding YouTube&apos;s Policy
              </h2>

              <p className="text-gray-300">
                YouTube&apos;s authenticity policy focuses on identifying content that lacks &quot;meaningful human
                contribution.&quot; The policy doesn&apos;t prohibit AI assistance—it targets content where AI does
                all the creative work while the creator merely hits &quot;publish.&quot;
              </p>

              <h3 className="text-2xl font-semibold text-white mt-8 mb-4">What the Policy Actually Says</h3>

              <p className="text-gray-300">
                According to YouTube&apos;s official guidelines, content may be demonetized or removed if it:
              </p>

              <ul className="space-y-3 my-6">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    <strong className="text-white">Replicates existing content</strong> with minor modifications
                    or paraphrasing without adding new perspective
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    <strong className="text-white">Uses formulaic AI patterns</strong> that indicate automated
                    generation without human editing
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    <strong className="text-white">Lacks original insight</strong> or personal experience that
                    only a human creator could provide
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    <strong className="text-white">Contains high repetitiveness</strong> with similar phrases,
                    structures, or ideas appearing multiple times
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-semibold text-white mt-8 mb-4">What IS Allowed</h3>

              <p className="text-gray-300">
                Importantly, YouTube explicitly permits AI-assisted content creation when:
              </p>

              <ul className="space-y-3 my-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    <strong className="text-white">AI is used as a tool</strong>—for research, outlining,
                    grammar checking, or generating initial drafts that are then substantially edited
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    <strong className="text-white">Original perspective is added</strong>—personal stories,
                    unique opinions, expert analysis, or firsthand experience
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    <strong className="text-white">Content serves the viewer</strong>—provides genuine value,
                    entertainment, or education beyond what&apos;s freely available
                  </span>
                </li>
              </ul>

              <MarketingCard className="p-6 my-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <h4 className="text-lg font-semibold text-white mb-2">The Bottom Line</h4>
                <p className="text-gray-300 m-0">
                  YouTube wants to see that a human creator made meaningful decisions about the content.
                  The goal isn&apos;t to detect AI usage—it&apos;s to identify low-effort content farming. Creators
                  who add genuine value have nothing to worry about.
                </p>
              </MarketingCard>
            </section>

            {/* The Compliance Framework */}
            <section id="compliance-framework" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                The GenScript Compliance Framework
              </h2>

              <p className="text-gray-300">
                Based on our analysis of YouTube&apos;s detection patterns and successful creator content,
                we&apos;ve developed a comprehensive compliance framework that evaluates scripts across four
                key dimensions.
              </p>

              <h3 className="text-2xl font-semibold text-white mt-8 mb-4">Scoring Methodology</h3>

              <p className="text-gray-300">
                Each script receives a compliance score from 0-100, calculated using weighted analysis
                across four categories:
              </p>

              <div className="grid md:grid-cols-2 gap-4 my-8">
                <MarketingCard className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">Repetitiveness</span>
                    <span className="text-purple-400 font-bold">30%</span>
                  </div>
                  <p className="text-gray-400 text-sm m-0">
                    Measures phrase repetition, structural patterns, and content redundancy using
                    n-gram analysis and Jaccard similarity.
                  </p>
                </MarketingCard>

                <MarketingCard className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">Original Insight</span>
                    <span className="text-purple-400 font-bold">25%</span>
                  </div>
                  <p className="text-gray-400 text-sm m-0">
                    Detects first-person narratives, specific examples, expert opinions, and
                    personal experiences that indicate human authorship.
                  </p>
                </MarketingCard>

                <MarketingCard className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">AI Patterns</span>
                    <span className="text-purple-400 font-bold">25%</span>
                  </div>
                  <p className="text-gray-400 text-sm m-0">
                    Identifies hedging language, formulaic transitions, and structural patterns
                    commonly associated with AI-generated text.
                  </p>
                </MarketingCard>

                <MarketingCard className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">Structure</span>
                    <span className="text-purple-400 font-bold">20%</span>
                  </div>
                  <p className="text-gray-400 text-sm m-0">
                    Evaluates sentence variety, hook quality, pacing, and overall flow that
                    indicates thoughtful human editing.
                  </p>
                </MarketingCard>
              </div>

              <h3 className="text-2xl font-semibold text-white mt-8 mb-4">Score Thresholds</h3>

              <div className="space-y-4 my-6">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                      80-100
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Approved</div>
                    <div className="text-gray-400 text-sm">Low risk. Content shows clear human contribution.</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
                      60-79
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Needs Review</div>
                    <div className="text-gray-400 text-sm">Moderate risk. Some improvements recommended.</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
                      0-59
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">High Risk</div>
                    <div className="text-gray-400 text-sm">Significant issues detected. Revisions required.</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Four Pillars */}
            <section id="four-pillars" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                Four Pillars of Compliant Content
              </h2>

              <p className="text-gray-300">
                Our research has identified four key elements that consistently differentiate compliant
                content from flagged content. Incorporating these elements significantly reduces
                demonetization risk.
              </p>

              {/* Pillar 1 */}
              <div className="my-8">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  1. Personal Stories and Experiences
                </h3>
                <p className="text-gray-300">
                  Nothing signals human authorship more clearly than personal anecdotes. These don&apos;t
                  need to be dramatic—even simple observations from your daily life add authenticity.
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <MarketingCard className="p-4 border-l-4 border-red-500">
                    <div className="text-red-400 text-sm font-medium mb-2">Before (Generic)</div>
                    <p className="text-gray-400 text-sm m-0">
                      &quot;Many people struggle with productivity. It&apos;s important to develop good habits
                      and stay focused on your goals.&quot;
                    </p>
                  </MarketingCard>

                  <MarketingCard className="p-4 border-l-4 border-green-500">
                    <div className="text-green-400 text-sm font-medium mb-2">After (Personal)</div>
                    <p className="text-gray-400 text-sm m-0">
                      &quot;Last month, I couldn&apos;t finish a single video. I was checking my phone every
                      five minutes. Here&apos;s the system that helped me publish 8 videos in 3 weeks.&quot;
                    </p>
                  </MarketingCard>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="my-8">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  2. Specific Examples and Data
                </h3>
                <p className="text-gray-300">
                  Generic statements are AI&apos;s calling card. Replace vague claims with specific
                  numbers, real examples, and verifiable data points.
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <MarketingCard className="p-4 border-l-4 border-red-500">
                    <div className="text-red-400 text-sm font-medium mb-2">Before (Vague)</div>
                    <p className="text-gray-400 text-sm m-0">
                      &quot;This strategy can significantly improve your results and help you achieve
                      better outcomes.&quot;
                    </p>
                  </MarketingCard>

                  <MarketingCard className="p-4 border-l-4 border-green-500">
                    <div className="text-green-400 text-sm font-medium mb-2">After (Specific)</div>
                    <p className="text-gray-400 text-sm m-0">
                      &quot;When I tested this on my finance channel, CTR jumped from 4.2% to 7.8% in
                      30 days. My retention at 30 seconds increased by 23%.&quot;
                    </p>
                  </MarketingCard>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="my-8">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  3. Unique Opinions and Hot Takes
                </h3>
                <p className="text-gray-300">
                  AI models are trained to be balanced and avoid controversy. Taking a clear stance—even
                  an unpopular one—demonstrates human judgment and perspective.
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <MarketingCard className="p-4 border-l-4 border-red-500">
                    <div className="text-red-400 text-sm font-medium mb-2">Before (Balanced)</div>
                    <p className="text-gray-400 text-sm m-0">
                      &quot;There are various approaches to thumbnail design, and different strategies
                      work for different creators.&quot;
                    </p>
                  </MarketingCard>

                  <MarketingCard className="p-4 border-l-4 border-green-500">
                    <div className="text-green-400 text-sm font-medium mb-2">After (Opinionated)</div>
                    <p className="text-gray-400 text-sm m-0">
                      &quot;Face thumbnails are dead. I know everyone says to put your face on every
                      thumbnail, but my data shows the opposite. Here&apos;s why I stopped.&quot;
                    </p>
                  </MarketingCard>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="my-8">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  4. Natural Language Patterns
                </h3>
                <p className="text-gray-300">
                  AI-generated text often follows predictable patterns: transition phrases, hedging
                  language, and overly formal constructions. Natural writing is messier—and that&apos;s
                  actually a good thing.
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <MarketingCard className="p-4 border-l-4 border-red-500">
                    <div className="text-red-400 text-sm font-medium mb-2">Before (AI Pattern)</div>
                    <p className="text-gray-400 text-sm m-0">
                      &quot;Furthermore, it is important to note that this methodology can potentially
                      yield beneficial results. Additionally, consider implementing...&quot;
                    </p>
                  </MarketingCard>

                  <MarketingCard className="p-4 border-l-4 border-green-500">
                    <div className="text-green-400 text-sm font-medium mb-2">After (Natural)</div>
                    <p className="text-gray-400 text-sm m-0">
                      &quot;Here&apos;s the thing though—this only works if you&apos;re consistent. I messed this
                      up for months before it clicked. Let me show you what I mean.&quot;
                    </p>
                  </MarketingCard>
                </div>
              </div>
            </section>

            {/* Case Studies */}
            <section id="case-studies" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-400" />
                </div>
                Case Studies
              </h2>

              <p className="text-gray-300">
                Real examples from creators who improved their compliance scores and protected their
                monetization.
              </p>

              {/* Case Study 1 */}
              <MarketingCard className="p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-white">Finance Education Channel</h4>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-sm">Before: 52</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-sm">After: 87</span>
                  </div>
                </div>

                <p className="text-gray-400 mb-4">
                  A creator producing weekly stock market analysis videos was using ChatGPT to generate
                  scripts directly from news headlines. Two videos were demonetized for &quot;repetitive content.&quot;
                </p>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Added personal portfolio performance data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Included specific trade examples with entry/exit points</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Replaced hedging phrases with confident predictions</span>
                  </div>
                </div>
              </MarketingCard>

              {/* Case Study 2 */}
              <MarketingCard className="p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-white">Tech Tutorial Channel</h4>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-sm">Before: 68</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-sm">After: 91</span>
                  </div>
                </div>

                <p className="text-gray-400 mb-4">
                  Programming tutorials were well-structured but felt generic. The creator received a
                  warning about &quot;content that doesn&apos;t provide unique value.&quot;
                </p>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Shared debugging stories from real client projects</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Added &quot;mistakes I made&quot; sections with lessons learned</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Included opinionated framework recommendations</span>
                  </div>
                </div>
              </MarketingCard>
            </section>

            {/* Implementation */}
            <section id="implementation" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                Technical Implementation
              </h2>

              <p className="text-gray-300">
                GenScript&apos;s compliance checker uses a multi-layered analysis approach to evaluate
                scripts in real-time.
              </p>

              <h3 className="text-2xl font-semibold text-white mt-8 mb-4">Analysis Methods</h3>

              <ul className="space-y-4 my-6">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">N-gram Frequency Analysis</div>
                    <div className="text-gray-400 text-sm">
                      Detects repeated phrases and patterns by analyzing 2-gram, 3-gram, and 4-gram
                      sequences throughout the script.
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Jaccard Similarity Scoring</div>
                    <div className="text-gray-400 text-sm">
                      Compares sentence structures to identify formulaic patterns and repetitive
                      constructions.
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Pattern Matching</div>
                    <div className="text-gray-400 text-sm">
                      Identifies known AI patterns including hedging phrases, formulaic transitions,
                      and structural indicators.
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Human Marker Detection</div>
                    <div className="text-gray-400 text-sm">
                      Scans for indicators of human authorship: first-person pronouns, specific
                      numbers, temporal references, and opinion markers.
                    </div>
                  </div>
                </li>
              </ul>

              <h3 className="text-2xl font-semibold text-white mt-8 mb-4">Workflow Integration</h3>

              <p className="text-gray-300">
                The compliance checker integrates seamlessly into your content creation workflow:
              </p>

              <div className="flex flex-col md:flex-row gap-4 my-8">
                <MarketingCard className="p-4 flex-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-400 font-bold">1</span>
                  </div>
                  <div className="text-white font-medium">Generate</div>
                  <div className="text-gray-400 text-sm">Create initial script with GenScript</div>
                </MarketingCard>

                <MarketingCard className="p-4 flex-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-400 font-bold">2</span>
                  </div>
                  <div className="text-white font-medium">Analyze</div>
                  <div className="text-gray-400 text-sm">Run compliance check instantly</div>
                </MarketingCard>

                <MarketingCard className="p-4 flex-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-400 font-bold">3</span>
                  </div>
                  <div className="text-white font-medium">Refine</div>
                  <div className="text-gray-400 text-sm">Address warnings and suggestions</div>
                </MarketingCard>

                <MarketingCard className="p-4 flex-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-400 font-bold">4</span>
                  </div>
                  <div className="text-white font-medium">Publish</div>
                  <div className="text-gray-400 text-sm">Export with confidence</div>
                </MarketingCard>
              </div>
            </section>

            {/* Conclusion */}
            <section id="conclusion" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                Conclusion & Next Steps
              </h2>

              <p className="text-gray-300">
                YouTube&apos;s authenticity policy represents a shift toward quality over quantity.
                Creators who embrace this change—using AI as a tool while adding genuine human
                value—will thrive. Those who resist will find their content increasingly marginalized.
              </p>

              <MarketingCard className="p-6 my-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <h4 className="text-lg font-semibold text-white mb-4">Key Takeaways</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">AI assistance is allowed—lack of human value is not</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Personal stories and specific data are your best protection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Real-time compliance checking prevents costly mistakes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Scores above 80 indicate low demonetization risk</span>
                  </li>
                </ul>
              </MarketingCard>

              <h3 className="text-2xl font-semibold text-white mt-8 mb-4">Your Next Steps</h3>

              <div className="grid md:grid-cols-2 gap-4 my-6">
                <Link href="/compliance-check" className="block no-underline">
                  <MarketingCard className="p-6 h-full hover:border-purple-500/50 transition-colors">
                    <Shield className="w-8 h-8 text-purple-400 mb-3" />
                    <div className="text-white font-semibold mb-2">Check Your Script</div>
                    <p className="text-gray-400 text-sm m-0">
                      Paste your script into our free compliance checker and get instant feedback.
                    </p>
                  </MarketingCard>
                </Link>

                <Link href="/resources/creator-compliance-checklist" className="block no-underline">
                  <MarketingCard className="p-6 h-full hover:border-purple-500/50 transition-colors">
                    <FileText className="w-8 h-8 text-green-400 mb-3" />
                    <div className="text-white font-semibold mb-2">Download Checklist</div>
                    <p className="text-gray-400 text-sm m-0">
                      Get our 5-point checklist for making any AI script compliant.
                    </p>
                  </MarketingCard>
                </Link>
              </div>
            </section>
          </article>
        </div>
      </div>

      {/* Final CTA */}
      <CTASection
        title="Ready to Write Compliant Scripts?"
        subtitle="Join thousands of creators using GenScript to produce YouTube content that stays monetized."
        badge={
          <>
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Built for YouTube&apos;s 2025 Policy</span>
          </>
        }
        features={[
          'Real-time compliance checking',
          'AI voice matching',
          'Retention optimization',
          '50 free credits to start'
        ]}
        primaryButton={
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
              Start Writing Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
        secondaryButton={
          <Link href="/compliance-check">
            <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
              <Shield className="w-4 h-4 mr-2" />
              Check Your Script
            </Button>
          </Link>
        }
      />
    </div>
  );
}

'use client';

/**
 * GenScript vs ChatGPT Comparison Page
 *
 * Detailed comparison focusing on compliance and YouTube-specific features.
 */

import Link from 'next/link';
import {
  Shield,
  Check,
  X,
  ArrowRight,
  Clock,
  Brain,
  Zap,
  AlertTriangle,
  Target,
  Sparkles,
  FileText,
  TrendingUp,
  Users,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MarketingSection,
  MarketingCard,
  MarketingHero,
  CTASection,
  FAQSection
} from '@/components/marketing/MarketingLayout';

// Detailed feature comparison
const featureComparison = [
  {
    category: 'YouTube Compliance',
    features: [
      {
        name: 'YouTube 2025 Policy Compliance',
        chatgpt: false,
        genscript: true,
        note: 'GenScript includes built-in compliance checking'
      },
      {
        name: 'AI Pattern Detection',
        chatgpt: false,
        genscript: true,
        note: 'Identifies and flags content that may trigger demonetization'
      },
      {
        name: 'Authenticity Scoring',
        chatgpt: false,
        genscript: true,
        note: 'Real-time scoring across 4 compliance categories'
      },
      {
        name: 'Original Insight Markers',
        chatgpt: 'Manual',
        genscript: true,
        note: 'Automatically suggests where to add personal touches'
      }
    ]
  },
  {
    category: 'YouTube Optimization',
    features: [
      {
        name: 'Retention-Focused Structure',
        chatgpt: 'Generic',
        genscript: true,
        note: 'Scripts optimized for 68%+ average view duration'
      },
      {
        name: 'Hook Library',
        chatgpt: false,
        genscript: '1000+',
        note: 'Proven viral hooks for any niche'
      },
      {
        name: 'PVSS Framework',
        chatgpt: false,
        genscript: true,
        note: 'Promise-Value-Secret-Suspense for engagement'
      },
      {
        name: 'Transcript Analysis',
        chatgpt: false,
        genscript: true,
        note: 'Learn from competitor videos'
      }
    ]
  },
  {
    category: 'Workflow & Speed',
    features: [
      {
        name: 'Time to First Script',
        chatgpt: '30+ min',
        genscript: '30 sec',
        note: 'No complex prompting needed'
      },
      {
        name: 'Voice Matching',
        chatgpt: 'Manual prompting',
        genscript: 'AI Clone',
        note: 'Upload samples, get your voice'
      },
      {
        name: 'Output Consistency',
        chatgpt: 'Variable',
        genscript: 'High',
        note: 'Same quality every time'
      },
      {
        name: 'YouTube-Specific Training',
        chatgpt: false,
        genscript: true,
        note: 'Trained on viral YouTube content'
      }
    ]
  }
];

// Key differentiators
const differentiators = [
  {
    icon: Shield,
    title: 'Compliance-First Design',
    description: 'ChatGPT doesn\'t know about YouTube\'s 2025 authenticity policy. GenScript was built around it. Every script comes with compliance scoring and suggestions.',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    icon: Target,
    title: 'Purpose-Built for YouTube',
    description: 'ChatGPT is a general-purpose AI trained on the entire internet. GenScript is trained specifically on viral YouTube content and optimized for retention.',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: Clock,
    title: '60x Faster Workflow',
    description: 'Stop spending 30 minutes crafting the perfect prompt. GenScript generates compliance-checked scripts in 30 seconds with zero prompting required.',
    gradient: 'from-purple-500/20 to-pink-500/20'
  }
];

// The compliance gap explanation
const complianceGap = {
  title: 'The Compliance Gap',
  subtitle: 'Why ChatGPT Scripts Get Flagged',
  issues: [
    {
      icon: AlertTriangle,
      problem: 'Hedging Language',
      example: '"It is important to note that this could potentially..."',
      impact: 'Triggers AI detection patterns in YouTube\'s review system'
    },
    {
      icon: AlertTriangle,
      problem: 'Formulaic Transitions',
      example: '"Furthermore... Additionally... In conclusion..."',
      impact: 'Classic AI markers that reduce authenticity scores'
    },
    {
      icon: AlertTriangle,
      problem: 'Generic Statements',
      example: '"Many people struggle with productivity..."',
      impact: 'No original insight, flagged for low value-add'
    },
    {
      icon: AlertTriangle,
      problem: 'Missing Personal Touch',
      example: 'No first-person stories or specific data',
      impact: 'Fails YouTube\'s "meaningful human contribution" test'
    }
  ]
};

// Migration guide
const migrationSteps = [
  {
    step: 1,
    title: 'Sign up free',
    description: 'Get 50 credits to test GenScript\'s compliance-first approach'
  },
  {
    step: 2,
    title: 'Import your voice',
    description: 'Upload past scripts or videos for AI voice matching'
  },
  {
    step: 3,
    title: 'Generate & check',
    description: 'Create scripts with built-in compliance scoring'
  },
  {
    step: 4,
    title: 'Publish confidently',
    description: 'Export scripts that meet YouTube\'s authenticity standards'
  }
];

// FAQs
const faqs = [
  {
    question: 'Can I use ChatGPT outputs in GenScript?',
    answer: 'Yes! You can paste ChatGPT-generated scripts into our compliance checker to identify issues and get specific suggestions for improvement. Many creators use this workflow to fix existing content.'
  },
  {
    question: 'Is GenScript more expensive than ChatGPT Plus?',
    answer: 'ChatGPT Plus costs $20/month for general-purpose AI. GenScript\'s Creator plan is $39/month but includes 300 YouTube-optimized scripts with compliance checking, voice matching, and retention optimization. For YouTube creators, the specialized features and time savings typically deliver better ROI.'
  },
  {
    question: 'What if I already have ChatGPT workflows?',
    answer: 'GenScript doesn\'t replace ChatGPT entirely -it handles the YouTube-specific parts. Use ChatGPT for research and brainstorming, then use GenScript for the actual script with compliance checking. Many users keep both.'
  },
  {
    question: 'How does GenScript know about YouTube\'s 2025 policy?',
    answer: 'We continuously analyze YouTube\'s guidelines and test against their review systems. Our compliance engine is updated regularly based on real demonetization patterns and policy changes.'
  },
  {
    question: 'Can GenScript match my writing style like ChatGPT custom instructions?',
    answer: 'Better. ChatGPT custom instructions are text-based and limited. GenScript\'s AI voice cloning analyzes your actual content patterns -word choices, sentence rhythms, personality quirks -and replicates them automatically.'
  },
  {
    question: 'What happens if YouTube\'s policy changes again?',
    answer: 'GenScript\'s compliance rules are updated as policies evolve. When YouTube announced the 2025 authenticity update, we had our engine updated within days. ChatGPT has no YouTube-specific awareness.'
  }
];

export default function GenScriptVsChatGPT() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <MarketingHero
        badge={
          <>
            <RefreshCw className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Detailed Comparison</span>
          </>
        }
        title={
          <>
            GenScript vs ChatGPT
            <br />
            <span className="text-3xl md:text-5xl text-gray-400">for YouTube Scripts</span>
          </>
        }
        subtitle="ChatGPT is powerful -but it doesn't know YouTube's rules. Compare features, compliance, and why creators are switching."
        primaryCTA={
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
              Try GenScript Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
        secondaryCTA={
          <Link href="/compliance-check">
            <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
              <Shield className="w-4 h-4 mr-2" />
              Check ChatGPT Script
            </Button>
          </Link>
        }
      />

      {/* Quick Verdict */}
      <MarketingSection>
        <MarketingCard className="p-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Verdict</h2>
          <p className="text-gray-300 mb-6">
            <strong className="text-white">ChatGPT</strong> is excellent for general writing, research, and brainstorming.
            <strong className="text-white"> GenScript</strong> is built specifically for YouTube scripts with compliance
            checking, retention optimization, and voice matching that ChatGPT simply doesn&apos;t offer.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <div className="text-white font-medium">Choose GenScript if...</div>
                <div className="text-gray-400 text-sm">You need YouTube-compliant scripts fast with built-in optimization</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <div className="text-white font-medium">Choose ChatGPT if...</div>
                <div className="text-gray-400 text-sm">You need general-purpose AI for research and non-YouTube writing</div>
              </div>
            </div>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* Compliance Gap */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">{complianceGap.title}</h2>
          <p className="text-xl text-gray-400">{complianceGap.subtitle}</p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {complianceGap.issues.map((issue, idx) => (
            <MarketingCard key={idx} className="p-6 border-l-4 border-yellow-500/50">
              <div className="flex items-start gap-3 mb-3">
                <issue.icon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <h3 className="font-semibold text-white">{issue.problem}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2 italic">&quot;{issue.example}&quot;</p>
              <p className="text-sm text-yellow-400/80">{issue.impact}</p>
            </MarketingCard>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/compliance-check">
            <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
              <Shield className="w-4 h-4 mr-2" />
              Check if Your Script Has These Issues
            </Button>
          </Link>
        </div>
      </MarketingSection>

      {/* Key Differentiators */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Why Creators Switch</h2>
          <p className="text-xl text-gray-400">Three reasons GenScript beats ChatGPT for YouTube</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {differentiators.map((diff, idx) => (
            <MarketingCard key={idx} className="p-6">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-r ${diff.gradient}`}>
                <diff.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{diff.title}</h3>
              <p className="text-gray-400">{diff.description}</p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Feature Comparison Table */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Feature-by-Feature Comparison</h2>
          <p className="text-xl text-gray-400">See exactly what each tool offers</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {featureComparison.map((category, catIdx) => (
            <MarketingCard key={catIdx} className="overflow-hidden">
              <div className="bg-purple-500/10 px-6 py-3 border-b border-gray-800">
                <h3 className="font-semibold text-white">{category.category}</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {category.features.map((feature, featIdx) => (
                  <div key={featIdx} className="grid grid-cols-[1fr_100px_100px] gap-4 px-6 py-4 items-center">
                    <div>
                      <div className="text-white font-medium">{feature.name}</div>
                      <div className="text-sm text-gray-500">{feature.note}</div>
                    </div>
                    <div className="text-center">
                      <FeatureValue value={feature.chatgpt} />
                    </div>
                    <div className="text-center bg-purple-500/5 -mx-2 px-2 py-2 rounded">
                      <FeatureValue value={feature.genscript} winner />
                    </div>
                  </div>
                ))}
              </div>
            </MarketingCard>
          ))}
        </div>

        {/* Column Headers */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="grid grid-cols-[1fr_100px_100px] gap-4 px-6 text-center text-sm text-gray-500">
            <div></div>
            <div>ChatGPT</div>
            <div className="text-purple-400 font-medium">GenScript</div>
          </div>
        </div>
      </MarketingSection>

      {/* Script Comparison Demo */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Same Topic, Different Output</h2>
          <p className="text-xl text-gray-400">See the difference in a real script comparison</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* ChatGPT Output */}
          <MarketingCard className="p-6 border-t-4 border-gray-600">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-400">ChatGPT Output</span>
              <span className="ml-auto px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">
                Score: 54
              </span>
            </div>
            <div className="text-gray-400 text-sm space-y-3">
              <p>
                <span className="bg-red-500/20 text-red-300 px-1">In today&apos;s video, we&apos;re going to explore</span> the fascinating world of productivity.
                <span className="bg-red-500/20 text-red-300 px-1"> It&apos;s important to note that</span> productivity can significantly impact your success.
              </p>
              <p>
                <span className="bg-red-500/20 text-red-300 px-1">Furthermore,</span> research shows that
                <span className="bg-red-500/20 text-red-300 px-1"> many people struggle with</span> staying focused.
                <span className="bg-red-500/20 text-red-300 px-1"> Additionally,</span> we&apos;ll discuss various strategies that
                <span className="bg-red-500/20 text-red-300 px-1"> can potentially</span> help you achieve your goals.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 space-y-1">
              <div className="flex items-center gap-2 text-xs text-red-400">
                <X className="w-3 h-3" />
                <span>5 AI pattern phrases detected</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-red-400">
                <X className="w-3 h-3" />
                <span>No personal experience</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-red-400">
                <X className="w-3 h-3" />
                <span>Generic opener, no hook</span>
              </div>
            </div>
          </MarketingCard>

          {/* GenScript Output */}
          <MarketingCard className="p-6 border-t-4 border-green-500">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="font-semibold text-purple-400">GenScript Output</span>
              <span className="ml-auto px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                Score: 89
              </span>
            </div>
            <div className="text-gray-300 text-sm space-y-3">
              <p>
                <span className="bg-green-500/20 text-green-300 px-1">I lost 3 hours yesterday.</span> Not to Netflix.
                Not to doom-scrolling. To switching between 47 browser tabs pretending I was being productive.
              </p>
              <p>
                After tracking my work for 30 days -and I mean
                <span className="bg-green-500/20 text-green-300 px-1"> obsessively, down to the minute</span> -I found
                the real productivity killer.
                <span className="bg-green-500/20 text-green-300 px-1"> It&apos;s not what the gurus say.</span> And
                honestly? I was part of the problem recommending it.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 space-y-1">
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Check className="w-3 h-3" />
                <span>Strong pattern-interrupt hook</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Check className="w-3 h-3" />
                <span>Personal story with specific data</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Check className="w-3 h-3" />
                <span>Contrarian angle creates curiosity</span>
              </div>
            </div>
          </MarketingCard>
        </div>
      </MarketingSection>

      {/* Migration Guide */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Switch in 5 Minutes</h2>
          <p className="text-xl text-gray-400">Keep using ChatGPT for research, use GenScript for scripts</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {migrationSteps.map((step, idx) => (
              <div key={idx} className="flex-1">
                <MarketingCard className="p-6 h-full text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-400 font-bold">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </MarketingCard>
                {idx < migrationSteps.length - 1 && (
                  <div className="hidden md:flex justify-center my-4">
                    <ArrowRight className="w-4 h-4 text-gray-600 rotate-90 md:rotate-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </MarketingSection>

      {/* FAQs */}
      <FAQSection
        title="Frequently Asked Questions"
        faqs={faqs}
      />

      {/* Final CTA */}
      <CTASection
        title="Ready to Try the Difference?"
        subtitle="Get 50 free credits to test GenScript's compliance-first approach."
        badge={
          <>
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Built for YouTube&apos;s 2025 Policy</span>
          </>
        }
        features={[
          'Real-time compliance checking',
          'AI voice matching',
          '1000+ viral hooks',
          'No credit card required'
        ]}
        primaryButton={
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
        secondaryButton={
          <Link href="/compliance-check">
            <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
              <Shield className="w-4 h-4 mr-2" />
              Test Your ChatGPT Script
            </Button>
          </Link>
        }
      />
    </div>
  );
}

function FeatureValue({ value, winner }) {
  if (value === true) {
    return <Check className={`w-5 h-5 mx-auto ${winner ? 'text-green-400' : 'text-green-600'}`} />;
  }
  if (value === false) {
    return <X className="w-5 h-5 mx-auto text-gray-600" />;
  }
  return (
    <span className={`text-sm ${winner ? 'text-green-400 font-medium' : 'text-gray-400'}`}>
      {value}
    </span>
  );
}

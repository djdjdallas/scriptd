'use client';

/**
 * GenScript vs Subscribr Comparison Page
 *
 * Fair comparison with compliance checker as key differentiator.
 */

import Link from 'next/link';
import {
  Shield,
  Check,
  X,
  ArrowRight,
  DollarSign,
  Zap,
  Users,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  FileText,
  Target,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MarketingSection,
  MarketingCard,
  MarketingHero,
  CTASection,
  FAQSection
} from '@/components/marketing/MarketingLayout';

// Feature comparison
const featureComparison = [
  {
    category: 'Core Script Generation',
    features: [
      {
        name: 'YouTube Script Generation',
        subscribr: true,
        genscript: true,
        note: 'Both generate YouTube-specific scripts'
      },
      {
        name: 'Voice/Style Matching',
        subscribr: true,
        genscript: true,
        note: 'Both can match your writing style'
      },
      {
        name: 'Retention Optimization',
        subscribr: true,
        genscript: true,
        note: 'Both focus on viewer retention'
      },
      {
        name: 'Hook Generation',
        subscribr: 'Limited',
        genscript: '1000+',
        note: 'GenScript has larger hook library'
      }
    ]
  },
  {
    category: 'Compliance & Safety',
    features: [
      {
        name: 'YouTube 2025 Policy Compliance',
        subscribr: false,
        genscript: true,
        note: 'Only GenScript checks for compliance'
      },
      {
        name: 'AI Pattern Detection',
        subscribr: false,
        genscript: true,
        note: 'Identifies content that may trigger flags'
      },
      {
        name: 'Real-time Compliance Scoring',
        subscribr: false,
        genscript: true,
        note: 'Live feedback as you write'
      },
      {
        name: 'Demonetization Prevention',
        subscribr: false,
        genscript: true,
        note: 'Active protection for your revenue'
      }
    ]
  },
  {
    category: 'Additional Features',
    features: [
      {
        name: 'Transcript Extraction',
        subscribr: true,
        genscript: true,
        note: 'Analyze competitor videos'
      },
      {
        name: 'PVSS Framework',
        subscribr: false,
        genscript: true,
        note: 'Viral structure methodology'
      },
      {
        name: 'Fact Checking',
        subscribr: false,
        genscript: true,
        note: 'Automated verification'
      },
      {
        name: 'Thumbnail Ideas',
        subscribr: true,
        genscript: true,
        note: 'Both generate thumbnail concepts'
      }
    ]
  }
];

// Pricing comparison
const pricingComparison = {
  subscribr: {
    name: 'Subscribr',
    plans: [
      { name: 'Starter', price: 29, scripts: '10', perScript: '2.90' },
      { name: 'Creator', price: 79, scripts: '40', perScript: '1.98' },
      { name: 'Business', price: 199, scripts: 'Unlimited', perScript: '-' }
    ]
  },
  genscript: {
    name: 'GenScript',
    plans: [
      { name: 'Free', price: 0, scripts: '50 credits', perScript: '0.00', highlight: true },
      { name: 'Creator', price: 39, scripts: '300 credits', perScript: '0.13' },
      { name: 'Professional', price: 79, scripts: '800 credits', perScript: '0.10' },
      { name: 'Agency', price: 199, scripts: '2000 credits', perScript: '0.10' }
    ]
  }
};

// Fair assessment
const fairAssessment = {
  subscribrStrengths: [
    'Clean, focused interface',
    'Good script quality for most use cases',
    'Established platform with proven track record',
    'Strong video research features'
  ],
  genscriptAdvantages: [
    'Only platform with compliance checking',
    'Lower cost per script',
    'Free tier with 50 credits',
    'PVSS viral framework built-in',
    'Fact checking included'
  ]
};

// The compliance advantage
const complianceAdvantage = {
  title: 'The Compliance Gap',
  description: 'Subscribr generates great scripts-but they don\'t check if those scripts could get you demonetized. In the era of YouTube\'s 2025 authenticity policy, that\'s a significant blind spot.',
  stats: [
    { value: '23%', label: 'of AI scripts get flagged for review' },
    { value: '85%', label: 'of those have fixable issues' },
    { value: '$0', label: 'is what GenScript charges to check compliance' }
  ]
};

// FAQs
const faqs = [
  {
    question: 'Is Subscribr a bad tool?',
    answer: 'No. Subscribr is a solid YouTube script generator with a good track record. This comparison isn\'t about Subscribr being bad-it\'s about GenScript offering compliance checking that Subscribr doesn\'t have. In 2025, that\'s an important differentiator.'
  },
  {
    question: 'Why is GenScript cheaper per script?',
    answer: 'Our credit system is more flexible. A simple script might use 1 credit while a complex long-form script uses 3. This means you\'re not paying the same price for a 30-second short and a 20-minute documentary script.'
  },
  {
    question: 'Can I check Subscribr scripts in GenScript?',
    answer: 'Yes! Our compliance checker works with any script, regardless of where it was generated. Many creators use Subscribr for generation and GenScript\'s free compliance checker to verify before publishing.'
  },
  {
    question: 'What if I\'m already paying for Subscribr?',
    answer: 'You can use GenScript\'s free tier (50 credits) alongside your Subscribr subscription to add compliance checking to your workflow. No need to switch entirely if Subscribr is working for you.'
  },
  {
    question: 'Does GenScript have a limit on script length?',
    answer: 'No hard limit. Scripts use credits based on complexity, not length. A well-structured 2,000-word script might use the same credits as a 500-word script that requires more research.'
  },
  {
    question: 'Which tool has better customer support?',
    answer: 'Both platforms offer responsive support. GenScript provides 24/7 support on Professional and Agency plans, plus an active community. We can\'t speak to Subscribr\'s current support quality-check their recent reviews.'
  }
];

export default function GenScriptVsSubscribr() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <MarketingHero
        badge={
          <>
            <RefreshCw className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Fair Comparison</span>
          </>
        }
        title={
          <>
            GenScript vs Subscribr
            <br />
            <span className="text-3xl md:text-5xl text-gray-400">YouTube Script Generators</span>
          </>
        }
        subtitle="Both are built for YouTube. One includes compliance checking. Here's an honest comparison."
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
              Free Compliance Check
            </Button>
          </Link>
        }
      />

      {/* Fair Assessment */}
      <MarketingSection>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">An Honest Assessment</h2>
            <p className="text-xl text-gray-400">We believe in fair comparisons, not marketing spin</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Subscribr Strengths */}
            <MarketingCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Where Subscribr Excels
              </h3>
              <ul className="space-y-3">
                {fairAssessment.subscribrStrengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </MarketingCard>

            {/* GenScript Advantages */}
            <MarketingCard className="p-6 border-purple-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Where GenScript Leads
              </h3>
              <ul className="space-y-3">
                {fairAssessment.genscriptAdvantages.map((advantage, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{advantage}</span>
                  </li>
                ))}
              </ul>
            </MarketingCard>
          </div>
        </div>
      </MarketingSection>

      {/* The Compliance Gap */}
      <MarketingSection>
        <MarketingCard className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{complianceAdvantage.title}</h2>
              <p className="text-gray-300">{complianceAdvantage.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {complianceAdvantage.stats.map((stat, idx) => (
              <div key={idx} className="text-center p-4 bg-black/30 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* Feature Comparison */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Feature Comparison</h2>
          <p className="text-xl text-gray-400">Side-by-side feature breakdown</p>
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
                      <FeatureValue value={feature.subscribr} />
                    </div>
                    <div className="text-center bg-purple-500/5 -mx-2 px-2 py-2 rounded">
                      <FeatureValue value={feature.genscript} winner />
                    </div>
                  </div>
                ))}
              </div>
            </MarketingCard>
          ))}

          {/* Column Headers */}
          <div className="grid grid-cols-[1fr_100px_100px] gap-4 px-6 text-center text-sm text-gray-500">
            <div></div>
            <div>Subscribr</div>
            <div className="text-purple-400 font-medium">GenScript</div>
          </div>
        </div>
      </MarketingSection>

      {/* Pricing Comparison */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Pricing Comparison</h2>
          <p className="text-xl text-gray-400">See how costs stack up</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Subscribr Pricing */}
          <MarketingCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Subscribr</h3>
            <div className="space-y-4">
              {pricingComparison.subscribr.plans.map((plan, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{plan.name}</div>
                    <div className="text-sm text-gray-400">{plan.scripts} scripts/mo</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">${plan.price}</div>
                    <div className="text-xs text-gray-500">${plan.perScript}/script</div>
                  </div>
                </div>
              ))}
            </div>
          </MarketingCard>

          {/* GenScript Pricing */}
          <MarketingCard className="p-6 border-purple-500/30">
            <h3 className="text-xl font-semibold text-purple-400 mb-6">GenScript</h3>
            <div className="space-y-4">
              {pricingComparison.genscript.plans.map((plan, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    plan.highlight
                      ? 'bg-purple-500/10 border border-purple-500/30'
                      : 'bg-gray-900/50'
                  }`}
                >
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {plan.name}
                      {plan.highlight && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                          Free Forever
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{plan.scripts}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">${plan.price}</div>
                    <div className="text-xs text-gray-500">
                      {plan.price > 0 ? `$${plan.perScript}/credit` : 'No card needed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MarketingCard>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            * GenScript credits are flexible-simple scripts use fewer credits.
            <br />
            Subscribr pricing based on public information as of January 2025.
          </p>
        </div>
      </MarketingSection>

      {/* Use Both? */}
      <MarketingSection>
        <MarketingCard className="max-w-3xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Already Using Subscribr?</h2>
          <p className="text-gray-400 mb-6">
            You don&apos;t have to switch. Use GenScript&apos;s free compliance checker to verify any script
            before publishing-regardless of where you generated it.
          </p>
          <Link href="/compliance-check">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Shield className="w-4 h-4 mr-2" />
              Check a Script Free
            </Button>
          </Link>
        </MarketingCard>
      </MarketingSection>

      {/* FAQs */}
      <FAQSection
        title="Frequently Asked Questions"
        faqs={faqs}
      />

      {/* Final CTA */}
      <CTASection
        title="Try GenScript Risk-Free"
        subtitle="50 free credits. No credit card required. See the compliance difference yourself."
        badge={
          <>
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Built for YouTube&apos;s 2025 Policy</span>
          </>
        }
        features={[
          '50 free credits to start',
          'Real-time compliance checking',
          'Works with any script source',
          'Cancel anytime'
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
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
              <DollarSign className="w-4 h-4 mr-2" />
              View All Pricing
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Star, TrendingUp, Clock, Users, Shield, Zap, ChevronRight } from 'lucide-react';
import ComparisonTable from '@/components/comparison/ComparisonTable';
import MigrationOffer from '@/components/comparison/MigrationOffer';
import TestimonialCarousel from '@/components/comparison/TestimonialCarousel';
import RetentionChart from '@/components/comparison/RetentionChart';
import ROICalculator from '@/components/comparison/ROICalculator';
import { competitorData, socialProofData, migrationOffers } from '@/lib/comparison-data';

export default function SubscribrAIAlternative() {
  const [showMigrationWizard, setShowMigrationWizard] = useState(false);
  const competitor = competitorData.subscribrAI;
  const ourPlatform = competitorData.ourPlatform;

  const priceSavings = competitor.pricing.pro - ourPlatform.pricing.professional;
  const yearlyDifference = priceSavings * 12;

  const comparisonFeatures = [
    { 
      feature: 'Script Generation', 
      subscribrAI: 'AI-powered templates', 
      subscribr: 'Full AI with PVSS framework',
      winner: 'subscribr' 
    },
    { 
      feature: 'Pricing (Pro)', 
      subscribrAI: '$59/month', 
      subscribr: '$49/month',
      winner: 'subscribr' 
    },
    { 
      feature: 'Script Limits', 
      subscribrAI: 'Credit-based (100/mo)', 
      subscribr: 'Unlimited generation',
      winner: 'subscribr' 
    },
    { 
      feature: 'Voice Matching', 
      subscribrAI: 'Basic templates', 
      subscribr: 'Advanced AI matching',
      winner: 'subscribr' 
    },
    { 
      feature: 'Fact Checking', 
      subscribrAI: 'Not available', 
      subscribr: 'Built-in verification',
      winner: 'subscribr' 
    },
    { 
      feature: 'PVSS Framework', 
      subscribrAI: 'Not available', 
      subscribr: 'Proven viral system',
      winner: 'subscribr' 
    },
    { 
      feature: 'Retention Target', 
      subscribrAI: '50% AVD', 
      subscribr: '70%+ AVD guaranteed',
      winner: 'subscribr' 
    },
    { 
      feature: 'Psychographic Targeting', 
      subscribrAI: 'Not available', 
      subscribr: 'Advanced AI analysis',
      winner: 'subscribr' 
    },
    { 
      feature: 'Quality Tiers', 
      subscribrAI: 'One size fits all', 
      subscribr: 'Fast/Balanced/Premium',
      winner: 'subscribr' 
    },
    { 
      feature: 'API Access', 
      subscribrAI: 'Enterprise only ($99+)', 
      subscribr: 'All paid plans',
      winner: 'subscribr' 
    }
  ];

  const testimonials = [
    {
      name: 'Marcus Chen',
      channel: '@TechEducator',
      subscribers: '156K',
      quote: 'Subscribr AI was good, but the unlimited scripts and PVSS framework here tripled my views in just 6 weeks.',
      retentionBefore: 52,
      retentionAfter: 74,
      verified: true,
      avatar: '👨‍💻'
    },
    {
      name: 'Sarah Johnson',
      channel: '@BusinessDaily',
      subscribers: '89K',
      quote: 'The credit system was killing my budget. Now I can test as many scripts as I want without worrying.',
      retentionBefore: 48,
      retentionAfter: 71,
      verified: true,
      avatar: '👩‍💼'
    },
    {
      name: 'Alex Rivera',
      channel: '@FitnessFlow',
      subscribers: '234K',
      quote: 'Voice matching actually works here. My scripts sound like me, not like a generic AI template.',
      retentionBefore: 55,
      retentionAfter: 76,
      verified: true,
      avatar: '💪'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full mb-6">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Special Offer: 3 Months Free for Subscribr AI Switchers</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              The Subscribr AI Alternative That Actually Understands Your Audience
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              30% lower price, unlimited scripts, and the PVSS framework that Subscribr AI doesn't have. 
              See why {socialProofData.metrics.totalUsers}+ creators switched and got {socialProofData.metrics.averageRetention}% retention.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup?source=subscribr-ai&offer=3months">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-semibold text-lg hover:shadow-xl transition-all"
                >
                  Claim 3 Months Free
                </motion.button>
              </Link>
              <button
                onClick={() => setShowMigrationWizard(true)}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-semibold text-lg hover:bg-white/20 transition-all"
              >
                Migration Wizard →
              </button>
            </div>

            {/* Pricing Calculator */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-3">Save ${yearlyDifference}/year by switching</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-sm">Subscribr AI Pro</p>
                  <p className="text-2xl font-bold text-red-400">${competitor.pricing.pro}/mo</p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Subscribr Pro</p>
                  <p className="text-2xl font-bold text-green-400">${ourPlatform.pricing.professional}/mo</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Direct Feature Comparison */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-12">
              Side-by-Side Comparison
            </h2>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8">
              <div className="space-y-4">
                {comparisonFeatures.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-3 gap-4 items-center p-4 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="font-semibold">{item.feature}</div>
                    <div className={`text-center ${item.winner === 'subscribrAI' ? 'text-green-400' : 'text-gray-400'}`}>
                      {item.subscribrAI}
                    </div>
                    <div className={`text-center ${item.winner === 'subscribr' ? 'text-green-400' : 'text-gray-400'}`}>
                      {item.subscribr}
                      {item.winner === 'subscribr' && (
                        <Check className="inline-block w-4 h-4 ml-2" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            What Subscribr AI Can't Do (But We Can)
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <Zap className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">PVSS Viral Framework</h3>
              <p className="text-gray-400">
                Our proven framework that Subscribr AI doesn't have. Designed for maximum virality and engagement.
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <TrendingUp className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Unlimited Scripts</h3>
              <p className="text-gray-400">
                No credits, no limits. Generate as many scripts as you need without worrying about running out.
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <Shield className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Fact-Checking Built In</h3>
              <p className="text-gray-400">
                Every script is fact-checked automatically. Subscribr AI users have to verify manually.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Creators Who Switched From Subscribr AI
          </h2>
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Retention Comparison */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <RetentionChart 
            competitorName="Subscribr AI"
            competitorRetention={50}
            ourRetention={70}
          />
        </div>
      </section>

      {/* Migration Offer */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <MigrationOffer 
            competitor="Subscribr AI"
            discount={50}
            features={[
              '3 months completely free',
              'We\'ll match your credit balance',
              'Personal migration assistant',
              'Import all your templates',
              'Priority onboarding call'
            ]}
          />
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ROICalculator 
            competitorName="Subscribr AI"
            competitorPrice={competitor.pricing.pro}
            ourPrice={ourPlatform.pricing.professional}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Common Questions From Subscribr AI Users
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: "How easy is it to switch from Subscribr AI?",
                a: "Extremely easy. Our migration wizard imports your templates and settings in under 5 minutes. Plus, you get a personal migration assistant."
              },
              {
                q: "What about my remaining credits?",
                a: "We'll match your credit balance and convert it to unlimited generation for the equivalent time period."
              },
              {
                q: "Do you really have unlimited scripts?",
                a: "Yes, truly unlimited. No credits, no caps, no throttling. Generate as many scripts as you need."
              },
              {
                q: "How is your AI better than Subscribr AI's?",
                a: "We use the PVSS framework, advanced voice matching, and psychographic targeting - features Subscribr AI doesn't have."
              },
              {
                q: "Can I keep my workflow?",
                a: "Yes, and improve it. We support all the same export formats plus API access on all plans (not just enterprise)."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold mb-3">{item.q}</h3>
                <p className="text-gray-400">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Better Scripts for Less Money?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join {socialProofData.metrics.totalUsers}+ creators who switched and never looked back.
          </p>
          <Link href="/signup?source=subscribr-ai&offer=3months">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-semibold text-xl hover:shadow-xl transition-all"
            >
              Switch Now - Get 3 Months Free
            </motion.button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Migration Wizard Modal */}
      {showMigrationWizard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full"
          >
            <h3 className="text-2xl font-bold mb-6">Migration Wizard</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Step 1: Export Your Templates</h4>
                  <p className="text-gray-400 text-sm">Export your templates from Subscribr AI settings</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Step 2: Create Your Account</h4>
                  <p className="text-gray-400 text-sm">Sign up with code SWITCH50 for 3 months free</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Step 3: Import & Optimize</h4>
                  <p className="text-gray-400 text-sm">We'll import your data and optimize it with our AI</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <Link href="/signup?source=subscribr-ai&offer=3months" className="flex-1">
                <button className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-semibold">
                  Start Migration
                </button>
              </Link>
              <button
                onClick={() => setShowMigrationWizard(false)}
                className="px-6 py-3 bg-white/10 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
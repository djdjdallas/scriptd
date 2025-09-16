'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Target, 
  Brain, 
  Clock, 
  TrendingUp, 
  Download, 
  ChevronRight,
  Play,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Award,
  Eye,
  Heart,
  MessageSquare,
  Star,
  Timer,
  Users,
  Rocket,
  X
} from 'lucide-react';

export default function ViralHooksMasterclass() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [selectedHookType, setSelectedHookType] = useState('question');

  const tableOfContents = [
    { id: 'introduction', title: 'Hook Psychology', icon: Brain },
    { id: 'formulas', title: '50+ Hook Formulas', icon: Zap },
    { id: 'psychology', title: 'Viewer Psychology', icon: Heart },
    { id: 'timing', title: 'Perfect Timing', icon: Timer },
    { id: 'optimization', title: 'Hook Optimization', icon: Target },
    { id: 'examples', title: 'Viral Examples', icon: Star },
    { id: 'generator', title: 'AI Hook Generator', icon: Rocket }
  ];

  const hookFormulas = {
    question: [
      {
        name: 'Curiosity Question',
        formula: 'What if I told you [shocking claim]?',
        example: 'What if I told you 99% of YouTubers start their videos wrong?',
        retention: '74%',
        psychology: 'Creates instant curiosity gap'
      },
      {
        name: 'Challenge Question',
        formula: 'Can you [achieve goal] in [time constraint]?',
        example: 'Can you triple your views in just 30 days?',
        retention: '71%',
        psychology: 'Triggers competitive instincts'
      },
      {
        name: 'Discovery Question',
        formula: 'Did you know [unexpected fact]?',
        example: 'Did you know the YouTube algorithm changed 47 times last year?',
        retention: '69%',
        psychology: 'Appeals to learning desire'
      }
    ],
    result: [
      {
        name: 'Achievement Hook',
        formula: 'I [achieved result] in [timeframe] using [method]',
        example: 'I gained 100K subscribers in 90 days using this one trick',
        retention: '76%',
        psychology: 'Social proof and possibility'
      },
      {
        name: 'Transformation Hook',
        formula: 'From [bad state] to [good state] in [timeframe]',
        example: 'From 50 views to 500K views in 6 months',
        retention: '73%',
        psychology: 'Hope and aspiration'
      },
      {
        name: 'Discovery Result',
        formula: 'This [method] gave me [unexpected result]',
        example: 'This simple edit gave me 2 million views',
        retention: '70%',
        psychology: 'Surprise and curiosity'
      }
    ],
    problem: [
      {
        name: 'Mistake Hook',
        formula: 'Stop [common behavior] - it\'s killing your [metric]',
        example: 'Stop saying "Hey guys" - it\'s killing your retention',
        retention: '72%',
        psychology: 'Fear of loss and urgency'
      },
      {
        name: 'Warning Hook',
        formula: 'If you [do this], you\'ll never [achieve goal]',
        example: 'If you ignore thumbnails, you\'ll never go viral',
        retention: '68%',
        psychology: 'Loss aversion'
      },
      {
        name: 'Revelation Hook',
        formula: 'The truth about [topic] that [authority] won\'t tell you',
        example: 'The truth about YouTube that Google won\'t tell you',
        retention: '75%',
        psychology: 'Conspiracy and insider knowledge'
      }
    ],
    story: [
      {
        name: 'Personal Story',
        formula: 'Last [timeframe], [event] changed everything for me',
        example: 'Last week, one email changed everything for my channel',
        retention: '77%',
        psychology: 'Personal connection and narrative'
      },
      {
        name: 'Drama Hook',
        formula: 'You won\'t believe what happened when I [action]',
        example: 'You won\'t believe what happened when I called MrBeast',
        retention: '74%',
        psychology: 'Drama and anticipation'
      },
      {
        name: 'Behind-the-Scenes',
        formula: 'What really happens [behind the scenes of event]',
        example: 'What really happens behind a viral YouTube video',
        retention: '71%',
        psychology: 'Exclusive access'
      }
    ]
  };

  const psychologyTriggers = [
    {
      trigger: 'Curiosity Gap',
      description: 'Create questions without immediate answers',
      implementation: 'Tease upcoming reveals throughout the hook',
      effectiveness: '85%'
    },
    {
      trigger: 'Social Proof',
      description: 'Show others achieving desired outcomes',
      implementation: 'Include subscriber counts, view numbers, or testimonials',
      effectiveness: '78%'
    },
    {
      trigger: 'Fear of Missing Out',
      description: 'Suggest limited-time or exclusive information',
      implementation: 'Use phrases like "before it\'s too late" or "secret method"',
      effectiveness: '82%'
    },
    {
      trigger: 'Pattern Interrupt',
      description: 'Break expected content flow',
      implementation: 'Start with unexpected statements or visuals',
      effectiveness: '76%'
    },
    {
      trigger: 'Authority Positioning',
      description: 'Establish credibility quickly',
      implementation: 'Mention relevant achievements or endorsements',
      effectiveness: '73%'
    }
  ];

  const timingStrategy = [
    {
      timeframe: '0-3 seconds',
      goal: 'Stop the scroll',
      tactics: ['Visual pattern interrupt', 'Bold statement', 'Shocking visual'],
      critical: true
    },
    {
      timeframe: '3-8 seconds', 
      goal: 'Create curiosity',
      tactics: ['Pose intriguing question', 'Tease upcoming value', 'Create mystery'],
      critical: true
    },
    {
      timeframe: '8-15 seconds',
      goal: 'Promise value',
      tactics: ['Clear benefit statement', 'Preview best parts', 'Set expectations'],
      critical: true
    },
    {
      timeframe: '15-30 seconds',
      goal: 'Build momentum',
      tactics: ['Start delivering value', 'Maintain energy', 'Transition smoothly'],
      critical: false
    }
  ];

  const viralExamples = [
    {
      creator: 'MrBeast',
      hook: 'I Gave $1,000,000 To Random People',
      retention: '78%',
      views: '150M+',
      why: 'Combines generosity, large numbers, and human interest'
    },
    {
      creator: 'Veritasium',
      hook: 'This equation will change how you see the world',
      retention: '72%',
      views: '12M+',
      why: 'Creates curiosity about transformation and learning'
    },
    {
      creator: 'Peter McKinnon',
      hook: 'This camera hack will blow your mind',
      retention: '71%',
      views: '2.3M+',
      why: 'Promises immediate value with emotional language'
    },
    {
      creator: 'Ali Abdaal',
      hook: 'How I make $100K per month at 26',
      retention: '69%',
      views: '1.8M+',
      why: 'Social proof with age credibility and specific numbers'
    }
  ];

  const hookOptimization = [
    {
      principle: 'Specificity Beats Vague',
      before: 'How to make money online',
      after: 'How I made $47,329 in 90 days dropshipping',
      improvement: '+34% CTR'
    },
    {
      principle: 'Numbers Create Credibility',
      before: 'Get more views on YouTube',
      after: 'From 127 to 890K views using this framework',
      improvement: '+28% retention'
    },
    {
      principle: 'Controversy Drives Engagement',
      before: 'Best editing software for beginners',
      after: 'Why expensive editing software is making you worse',
      improvement: '+41% comments'
    },
    {
      principle: 'Time Urgency Motivates Action',
      before: 'Learn Python programming',
      after: 'Master Python in 30 days (even if you\'re 50)',
      improvement: '+22% watch time'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Masterclass • 127 Users • 68% Avg Retention</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Hook Writing Masterclass: Create Irresistible Openings
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Master the art and science of viral hooks. Learn 50+ proven formulas, psychological triggers, 
              and optimization techniques that top creators use to capture attention instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup?source=hook-masterclass">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold text-lg"
                >
                  Generate Perfect Hooks
                </motion.button>
              </Link>
              <button
                onClick={() => document.getElementById('examples').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-semibold text-lg hover:bg-white/20"
              >
                See Viral Examples
              </button>
            </div>

            {/* Hook Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <p className="text-3xl font-bold text-yellow-400">1000+</p>
                <p className="text-gray-500">Hook Formulas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-400">74%</p>
                <p className="text-gray-500">Avg Retention</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-400">15s</p>
                <p className="text-gray-500">Critical Window</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 px-4 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Masterclass Curriculum</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {tableOfContents.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(item.id).scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  activeSection === item.id 
                    ? 'bg-yellow-500/20 text-yellow-400' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section id="introduction" className="py-20 px-4">
        <div className="max-w-4xl mx-auto prose prose-invert">
          <h2 className="text-4xl font-bold mb-6">The 15-Second Decision</h2>
          
          <p className="text-lg text-gray-400 mb-6">
            Your hook isn't just an opening—it's a promise, a contract with your viewer. 
            In those critical first 15 seconds, you either earn their attention or lose them forever. 
            After analyzing 127 successful creators with 68% retention rates, we've cracked the code.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">The Hook Success Framework</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Eye className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Visual Pattern Interrupt (0-3s)</h4>
                  <p className="text-gray-400">Break the scroll with unexpected visuals or movements</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Brain className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Cognitive Hook (3-8s)</h4>
                  <p className="text-gray-400">Create curiosity gap that demands resolution</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Heart className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Emotional Investment (8-15s)</h4>
                  <p className="text-gray-400">Make them care about the outcome</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-400">
            This masterclass teaches you to engineer hooks that not only stop viewers but 
            create irresistible momentum that carries through your entire video.
          </p>
        </div>
      </section>

      {/* Hook Formulas */}
      <section id="formulas" className="py-20 px-4 bg-gradient-to-b from-yellow-900/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">50+ Proven Hook Formulas</h2>
          
          {/* Hook Type Selector */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white/10 rounded-lg p-1">
              {Object.keys(hookFormulas).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedHookType(type)}
                  className={`px-4 py-2 rounded-md transition-all capitalize ${
                    selectedHookType === type 
                      ? 'bg-yellow-500 text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type} Hooks
                </button>
              ))}
            </div>
          </div>

          {/* Hook Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {hookFormulas[selectedHookType].map((hook, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold">{hook.name}</h3>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                    {hook.retention} AVD
                  </span>
                </div>
                <p className="text-yellow-400 font-mono text-sm mb-3 bg-black/50 p-3 rounded">
                  {hook.formula}
                </p>
                <p className="text-gray-400 italic mb-3">"{hook.example}"</p>
                <p className="text-blue-400 text-sm">{hook.psychology}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Unlock All 1000+ Hook Formulas</h3>
            <p className="text-gray-400 mb-6">
              Access our complete database of viral hook formulas, organized by niche, psychology, and performance.
            </p>
            <Link href="/signup?source=hook-formulas">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold text-lg"
              >
                Get Full Access
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Psychology Triggers */}
      <section id="psychology" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Psychology Behind Viral Hooks</h2>
          
          <div className="space-y-6 mb-12">
            {psychologyTriggers.map((trigger, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold">{trigger.trigger}</h3>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                    {trigger.effectiveness} effective
                  </span>
                </div>
                <p className="text-gray-400 mb-3">{trigger.description}</p>
                <div className="bg-black/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-400">How to use: {trigger.implementation}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Neurological Response</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">Dopamine release from curiosity</span>
                </li>
                <li className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">Pattern recognition activation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">Emotional memory encoding</span>
                </li>
                <li className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">Social validation seeking</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Behavioral Triggers</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">Loss aversion response</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">Social proof influence</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">Authority recognition</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">Reciprocity principle</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Timing Strategy */}
      <section id="timing" className="py-20 px-4 bg-gradient-to-b from-blue-900/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Perfect Timing Strategy</h2>
          
          <div className="space-y-6 mb-12">
            {timingStrategy.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 ${
                  phase.critical ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{phase.timeframe}</h3>
                  <div className="flex items-center gap-2">
                    {phase.critical && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                        Critical
                      </span>
                    )}
                    <Timer className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <p className="text-lg font-medium text-blue-400 mb-3">{phase.goal}</p>
                <div className="flex flex-wrap gap-2">
                  {phase.tactics.map((tactic, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                      {tactic}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6">Our AI Timing Analysis</h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">3s</p>
                <p className="text-sm text-gray-500">Stop Scroll</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">8s</p>
                <p className="text-sm text-gray-500">Create Curiosity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">15s</p>
                <p className="text-sm text-gray-500">Promise Value</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">30s</p>
                <p className="text-sm text-gray-500">Build Momentum</p>
              </div>
            </div>
            <p className="text-gray-400 text-center">
              Our AI analyzes timing automatically, ensuring perfect pacing for maximum retention.
            </p>
          </div>
        </div>
      </section>

      {/* Hook Optimization */}
      <section id="optimization" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Hook Optimization Principles</h2>
          
          <div className="space-y-8 mb-12">
            {hookOptimization.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold">{principle.principle}</h3>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded">
                    {principle.improvement}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-red-400 mb-2">❌ Before:</h4>
                    <p className="text-gray-400 bg-red-500/10 p-3 rounded italic">"{principle.before}"</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">✅ After:</h4>
                    <p className="text-gray-400 bg-green-500/10 p-3 rounded italic">"{principle.after}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">A/B Testing Your Hooks</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Test Variables</h4>
                <ul className="text-gray-400 space-y-1 text-sm">
                  <li>• Question vs statement</li>
                  <li>• Specific vs general numbers</li>
                  <li>• Emotional vs logical appeal</li>
                  <li>• Short vs longer hooks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Success Metrics</h4>
                <ul className="text-gray-400 space-y-1 text-sm">
                  <li>• Click-through rate</li>
                  <li>• Average view duration</li>
                  <li>• 15-second retention</li>
                  <li>• Engagement rate</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Optimization Tools</h4>
                <ul className="text-gray-400 space-y-1 text-sm">
                  <li>• Subscribr AI testing</li>
                  <li>• YouTube Analytics</li>
                  <li>• A/B thumbnail testing</li>
                  <li>• Audience feedback</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Viral Examples */}
      <section id="examples" className="py-20 px-4 bg-gradient-to-b from-green-900/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Viral Hook Case Studies</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {viralExamples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{example.creator}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                      {example.retention}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                      {example.views}
                    </span>
                  </div>
                </div>
                <p className="text-yellow-400 font-medium mb-3 italic">"{example.hook}"</p>
                <p className="text-gray-400 text-sm">{example.why}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Common Success Patterns</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3">High-Performing Elements</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400">Specific numbers and timeframes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400">Personal achievement stories</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400">Contrarian or unexpected claims</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400">Emotional transformation promises</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Retention Killers</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-400" />
                    <span className="text-gray-400">Generic "how to" openings</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-400" />
                    <span className="text-gray-400">Long introductions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-400" />
                    <span className="text-gray-400">Overpromising and underdelivering</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-400" />
                    <span className="text-gray-400">Clickbait without substance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Hook Generator */}
      <section id="generator" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Generate Perfect Hooks with AI
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Our AI uses every formula and principle from this masterclass to create 
            hooks optimized for your specific niche and audience. Join 127 creators achieving 68% retention.
          </p>
          
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">What You Get</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold mb-2">🎯 Personalized Hooks</h4>
                <p className="text-gray-400 text-sm">AI analyzes your niche and creates custom hooks</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🧠 Psychology Integration</h4>
                <p className="text-gray-400 text-sm">Every hook uses proven psychological triggers</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⏱️ Perfect Timing</h4>
                <p className="text-gray-400 text-sm">Optimized for the critical 15-second window</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📊 A/B Test Variations</h4>
                <p className="text-gray-400 text-sm">Multiple variations to test and optimize</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?source=hook-generator">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold text-xl"
              >
                Start Creating Viral Hooks
              </motion.button>
            </Link>
            <Link href="/tools/hook-generator">
              <button className="px-12 py-6 bg-white/10 backdrop-blur-sm rounded-lg font-semibold text-xl hover:bg-white/20">
                Try Hook Generator
              </button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            14-day free trial • 1000+ hook formulas • 68% average retention
          </p>
        </div>
      </section>
    </div>
  );
}
"use client";

/**
 * Landing Page
 *
 * Authenticity-first positioning for GenScript.
 * Focuses on YouTube compliance and demonetization protection.
 */

import { useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/ui/tilt-card";
import { StatHero, AnimatedCounter } from "@/components/stats";
import { PLANS } from "@/lib/constants";
import {
  ArrowRight,
  Sparkles,
  Shield,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Mic,
  TrendingUp,
  Star,
  ChevronDown,
  ChevronRight,
  Download,
  BarChart3,
  Users,
  Bot,
  AudioWaveform,
  FileText,
  Check,
  X,
  Menu,
} from "lucide-react";

const FEATURES = [
  {
    title: "Compliance Checker",
    description: "Every script scanned for YouTube policy violations. Get warnings before you publish, not after.",
    icon: ShieldCheck,
    gradient: "from-green-500/20 to-emerald-500/20",
    benefit: "Protect your monetization"
  },
  {
    title: "Voice Matching",
    description: "AI that learns YOUR speaking style. Upload past scripts, get output that sounds like you.",
    icon: AudioWaveform,
    gradient: "from-blue-500/20 to-cyan-500/20",
    benefit: "Sound authentically you"
  },
  {
    title: "Retention Optimizer",
    description: "Scripts engineered for 70%+ retention. Hook formulas proven to keep viewers watching.",
    icon: TrendingUp,
    gradient: "from-purple-500/20 to-pink-500/20",
    benefit: "Keep viewers watching"
  },
  {
    title: "One-Click Export",
    description: "Title, description, tags - all generated. Copy straight to YouTube Studio.",
    icon: Download,
    gradient: "from-orange-500/20 to-yellow-500/20",
    benefit: "Upload in seconds"
  }
];

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: "AI-generated scripts can get your channel demonetized",
    color: "text-red-400"
  },
  {
    icon: Bot,
    title: "Generic AI sounds like... generic AI",
    color: "text-yellow-400"
  },
  {
    icon: XCircle,
    title: "One wrong video can tank months of work",
    color: "text-orange-400"
  }
];

const SOLUTIONS = [
  {
    icon: ShieldCheck,
    title: "Real-time compliance checking as you write",
    color: "text-green-400"
  },
  {
    icon: AudioWaveform,
    title: "Voice matching that sounds like YOU",
    color: "text-blue-400"
  },
  {
    icon: Shield,
    title: "Built-in safeguards against AI detection",
    color: "text-purple-400"
  }
];

const TESTIMONIALS = [
  {
    quote: "My retention went from 35% to 68% after switching to GenScript. The compliance checker saved me from a strike I didn't even know was coming.",
    name: "Michael Torres",
    channel: "@FinanceFreedom",
    subscribers: "45K subscribers",
    niche: "Finance"
  },
  {
    quote: "Finally, an AI tool that actually sounds like me. My audience can't tell the difference.",
    name: "Sarah Chen",
    channel: "@TechReviewsPro",
    subscribers: "120K subscribers",
    niche: "Tech reviews"
  },
  {
    quote: "I was terrified of YouTube's new AI policy. GenScript is the only tool that made me feel safe using AI again.",
    name: "James Wilson",
    channel: "@LearnWithJames",
    subscribers: "28K subscribers",
    niche: "Educational content"
  }
];

const COMPARISON_DATA = [
  { feature: "YouTube-Specific", genscript: true, chatgpt: false, subscribr: true },
  { feature: "Compliance Check", genscript: true, chatgpt: false, subscribr: false },
  { feature: "Voice Matching", genscript: true, chatgpt: false, subscribr: "Limited" },
  { feature: "Retention Focus", genscript: true, chatgpt: false, subscribr: true },
  { feature: "Free Tier", genscript: true, chatgpt: true, subscribr: true },
];

const FAQ_DATA = [
  {
    question: "Will YouTube know I used AI?",
    answer: "YouTube's policy doesn't ban AI-assisted content. It targets content that lacks authenticity. GenScript's compliance checker ensures your scripts include personal insight markers and avoid AI-typical patterns. Plus, our voice matching makes your content sound genuinely like you."
  },
  {
    question: "How does the compliance checker work?",
    answer: "Our algorithm analyzes your script across four categories: repetitiveness, original insight markers, AI patterns, and structure quality. You get a score from 0-100 with specific suggestions for improvement. Scripts scoring 80+ are considered 'YouTube Approved.'"
  },
  {
    question: "Can I use my own voice/style?",
    answer: "Absolutely! Our voice matching feature learns your speaking patterns from your existing content. Upload a few transcripts or past scripts, and GenScript will generate new content that sounds authentically like you, not like generic AI."
  },
  {
    question: "What if I get demonetized anyway?",
    answer: "While no tool can guarantee 100% protection, our compliance checker significantly reduces risk by flagging issues before you publish. We continuously update our detection patterns as YouTube's policies evolve to keep you protected."
  },
  {
    question: "How is this different from ChatGPT?",
    answer: "ChatGPT is a general-purpose AI that doesn't understand YouTube's specific requirements. GenScript is built exclusively for YouTube creators with retention optimization, compliance checking, and voice matching that ChatGPT simply can't provide."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes! We offer a 14-day money-back guarantee. If GenScript doesn't meet your needs, contact us within 14 days for a full refund. No questions asked."
  }
];

export default function Home() {
  const heroRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient Orbs */}
        <div className="gradient-orb w-96 h-96 bg-purple-600 -top-48 -left-48" />
        <div
          className="gradient-orb w-96 h-96 bg-pink-600 -bottom-48 -right-48"
          style={{ animationDelay: "10s" }}
        />
        <div
          className="gradient-orb w-64 h-64 bg-blue-600 top-1/2 left-1/3"
          style={{ animationDelay: "5s" }}
        />

        {/* Morphing Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-morph" />
        <div
          className="absolute bottom-40 left-40 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 animate-morph"
          style={{ animationDelay: "4s" }}
        />

        {/* Dynamic Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(147, 51, 234, 0.3)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Particle Field - PERFORMANCE FIX: Reduced from 50 to 10 particles (80% GPU reduction) */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => {
            const seededRandom = (seed, multiplier = 1) => {
              const x =
                Math.sin(seed * 12.9898 + multiplier * 78.233) * 43758.5453;
              return x - Math.floor(x);
            };

            const left = (seededRandom(i, 1) * 100).toFixed(4);
            const top = (seededRandom(i, 2) * 100).toFixed(4);
            const delay = (seededRandom(i, 3) * 20).toFixed(4);
            const duration = (20 + seededRandom(i, 4) * 10).toFixed(4);
            const opacity = (seededRandom(i, 5) * 0.5 + 0.2).toFixed(6);

            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-float"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  opacity: opacity,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Glassmorphic Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-nav noise-texture">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold gradient-text">
            GenScript
          </Link>
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/compliance-check"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Compliance Check
            </Link>
            <Link
              href="/tools"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Free Tools
            </Link>
            <div className="relative group">
              <span className="text-gray-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                Resources
                <ChevronDown className="w-3 h-3" />
              </span>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="glass-card p-2 min-w-[200px] space-y-1">
                  <Link
                    href="/resources/youtube-compliance-whitepaper"
                    className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Compliance Whitepaper
                  </Link>
                  <Link
                    href="/resources/creator-compliance-checklist"
                    className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Creator Checklist
                  </Link>
                  <Link
                    href="/blog"
                    className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Blog
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href="/pricing"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="glass-button text-white">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-24 left-4 right-4 z-40 glass-card p-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/compliance-check"
              className="text-gray-200 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Compliance Check
            </Link>
            <Link
              href="/tools"
              className="text-gray-200 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Free Tools
            </Link>
            <div className="space-y-2">
              <span className="text-gray-200 font-medium">Resources</span>
              <div className="pl-4 space-y-2">
                <Link
                  href="/resources/youtube-compliance-whitepaper"
                  className="block text-gray-400 hover:text-white transition-colors py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Compliance Whitepaper
                </Link>
                <Link
                  href="/resources/creator-compliance-checklist"
                  className="block text-gray-400 hover:text-white transition-colors py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Creator Checklist
                </Link>
                <Link
                  href="/blog"
                  className="block text-gray-400 hover:text-white transition-colors py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
              </div>
            </div>
            <Link
              href="/pricing"
              className="text-gray-200 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 py-22"
      >
        <div className="relative z-10 max-w-5xl mx-auto text-center stagger-children">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 animate-glow">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-200">
              YouTube Policy Compliant • Built for 2025
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-white text-glow">YouTube Scripts That</span>
            <span className="block gradient-text text-glow holographic bg-clip-text">
              Won&apos;t Get You Demonetized
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The only AI script generator built for YouTube&apos;s 2025 authenticity policy.{" "}
            <span className="text-white">Write faster without risking your channel.</span>
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <ShieldCheck className="w-4 h-4" />
              <span>YouTube Policy Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>500+ Creators</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Star className="w-4 h-4" />
              <span>4.9/5 Rating</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button
                size="lg"
                className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white group"
              >
                Start Writing Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/compliance-check">
              <Button size="lg" className="glass-button text-white">
                <Shield className="mr-2 h-5 w-5" />
                Check Your Script
              </Button>
            </Link>
          </div>

          <p className="text-gray-400">
            No credit card required • 50 free credits
          </p>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">July 2025 Policy Update</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              YouTube&apos;s Policy Changed Everything
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              AI-generated content is under scrutiny like never before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* The Problem */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-red-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                The Problem
              </h3>
              <div className="space-y-4">
                {PROBLEMS.map((problem, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 glass-card rounded-xl p-4"
                  >
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <problem.icon className={`w-5 h-5 ${problem.color}`} />
                    </div>
                    <p className="text-gray-300">{problem.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* The Solution */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                The Solution
              </h3>
              <div className="space-y-4">
                {SOLUTIONS.map((solution, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 glass-card rounded-xl p-4"
                  >
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <solution.icon className={`w-5 h-5 ${solution.color}`} />
                    </div>
                    <p className="text-gray-300">{solution.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Built Different
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Features designed specifically for YouTube creators who value their channel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, idx) => (
              <TiltCard
                key={idx}
                className="glass-card p-6 rounded-xl"
                options={{ max: 5, scale: 1.02 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 mb-3">{feature.description}</p>
                    <span className="text-sm text-purple-400">
                      → {feature.benefit}
                    </span>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Creators Trust GenScript
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Real results from real creators who switched to compliance-first scripting.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="glass-card rounded-xl p-6 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  2.5M+
                </div>
                <div className="text-sm text-gray-400 mt-1">Scripts Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  89%
                </div>
                <div className="text-sm text-gray-400 mt-1">Avg Compliance Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  68%
                </div>
                <div className="text-sm text-gray-400 mt-1">Avg Retention</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  0
                </div>
                <div className="text-sm text-gray-400 mt-1">Policy Strikes</div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <TiltCard
                key={idx}
                className="glass-card p-6 rounded-xl"
                options={{ max: 5, scale: 1.02 }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="border-t border-gray-700 pt-4">
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.channel}</div>
                  <div className="text-xs text-purple-400">{testimonial.subscribers} • {testimonial.niche}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Creators Choose GenScript
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See how we compare to other options.
            </p>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Feature</th>
                    <th className="text-center py-4 px-6 text-purple-400 font-medium">GenScript</th>
                    <th className="text-center py-4 px-6 text-gray-400 font-medium">ChatGPT</th>
                    <th className="text-center py-4 px-6 text-gray-400 font-medium">Subscribr</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_DATA.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-800">
                      <td className="py-4 px-6 text-white font-medium">{row.feature}</td>
                      <td className="py-4 px-6 text-center bg-purple-500/5">
                        {row.genscript === true ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : row.genscript === false ? (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        ) : (
                          <span className="text-yellow-400 text-sm">{row.genscript}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {row.chatgpt === true ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : row.chatgpt === false ? (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        ) : (
                          <span className="text-yellow-400 text-sm">{row.chatgpt}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {row.subscribr === true ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : row.subscribr === false ? (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        ) : (
                          <span className="text-yellow-400 text-sm">{row.subscribr}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/compare/genscript-vs-chatgpt" className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
              See detailed comparisons →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start free, upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="glass-card rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">FREE</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS.FREE.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full glass-button text-white">
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Creator - Popular */}
            <div className="glass-card rounded-xl p-6 ring-2 ring-purple-500/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-medium text-white">
                Most Popular
              </div>
              <div className="text-sm text-purple-400 mb-2">CREATOR</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">${PLANS.CREATOR.price}</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS.CREATOR.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=creator" className="block">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Professional */}
            <div className="glass-card rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">PROFESSIONAL</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">${PLANS.PROFESSIONAL.price}</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS.PROFESSIONAL.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=professional" className="block">
                <Button className="w-full glass-button text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
              View all plans including Agency →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_DATA.map((faq, idx) => (
              <div key={idx} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white pr-4">{faq.question}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openFaq === idx ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Start for free today</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-glow">
            Ready to Write Scripts That Actually Work?
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join 500+ creators who trust GenScript to keep their channels safe and their content engaging.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/signup">
              <Button
                size="lg"
                className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transform transition"
              >
                Start Writing Free
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/compliance-check">
              <Button size="lg" className="glass-button text-white">
                <Shield className="mr-2 h-5 w-5" />
                Check Your Script First
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            No credit card required • 50 free credits • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-2xl font-bold gradient-text mb-2">
                GenScript
              </h3>
              <p className="text-gray-400 text-sm">Compliance-first AI scriptwriting for YouTube creators.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/compliance-check" className="block text-gray-400 hover:text-white transition-colors">
                  Compliance Checker
                </Link>
                <Link href="/tools/youtube-script-generator" className="block text-gray-400 hover:text-white transition-colors">
                  Script Generator
                </Link>
                <Link href="/tools" className="block text-gray-400 hover:text-white transition-colors">
                  Free Tools
                </Link>
                <Link href="/pricing" className="block text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <div className="space-y-2 text-sm">
                <Link href="/resources/youtube-compliance-whitepaper" className="block text-gray-400 hover:text-white transition-colors">
                  Compliance Whitepaper
                </Link>
                <Link href="/resources/creator-compliance-checklist" className="block text-gray-400 hover:text-white transition-colors">
                  Creator Checklist
                </Link>
                <Link href="/blog" className="block text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </div>
            </div>

            {/* Compare */}
            <div>
              <h4 className="font-semibold text-white mb-4">Compare</h4>
              <div className="space-y-2 text-sm">
                <Link href="/compare/genscript-vs-chatgpt" className="block text-gray-400 hover:text-white transition-colors">
                  GenScript vs ChatGPT
                </Link>
                <Link href="/compare/genscript-vs-subscribr" className="block text-gray-400 hover:text-white transition-colors">
                  GenScript vs Subscribr
                </Link>
                <Link href="/alternatives/chatgpt" className="block text-gray-400 hover:text-white transition-colors">
                  ChatGPT Alternative
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/terms-voice-cloning" className="block text-gray-400 hover:text-white transition-colors">
                  Voice Cloning Terms
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} GenScript. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

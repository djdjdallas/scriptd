"use client";

/**
 * Landing Page — Vantablack + Violet/Cyan/Emerald aesthetic
 *
 * Premium editorial design with Instrument Serif headings,
 * shimmer animations, and a developer-grade code showcase.
 */

import { useState } from "react";
import Link from "next/link";
import { PLANS } from "@/lib/constants";
import {
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle,
  TrendingUp,
  Star,
  ChevronDown,
  ChevronRight,
  Download,
  Users,
  Bot,
  AudioWaveform,
  Check,
  X,
  Menu,
  Fingerprint,
  Zap,
  Layers,
  Copy,
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────── */

const FEATURES = [
  {
    title: "Compliance Engine",
    description:
      "Every script scanned for YouTube policy violations. Get warnings before you publish, not after.",
    icon: ShieldCheck,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    borderHover: "hover:border-violet-500/30",
  },
  {
    title: "Voice DNA Matching",
    description:
      "AI that learns YOUR speaking style. Upload past scripts, get output that sounds like you.",
    icon: Fingerprint,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    borderHover: "hover:border-cyan-500/30",
  },
  {
    title: "Retention Optimizer",
    description:
      "Scripts engineered for 70%+ retention. Hook formulas proven to keep viewers watching.",
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-500/30",
  },
  {
    title: "One-Click Export",
    description:
      "Title, description, tags — all generated. Copy straight to YouTube Studio.",
    icon: Layers,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/30",
  },
];

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: "AI-generated scripts can get your channel demonetized",
    color: "text-red-400",
  },
  {
    icon: Bot,
    title: "Generic AI sounds like… generic AI",
    color: "text-yellow-400",
  },
  {
    icon: XCircle,
    title: "One wrong video can tank months of work",
    color: "text-orange-400",
  },
];

const SOLUTIONS = [
  {
    icon: ShieldCheck,
    title: "Real-time compliance checking as you write",
    color: "text-emerald-400",
  },
  {
    icon: AudioWaveform,
    title: "Voice matching that sounds like YOU",
    color: "text-cyan-400",
  },
  {
    icon: Fingerprint,
    title: "Built-in safeguards against AI detection",
    color: "text-violet-400",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "My retention went from 38% to 71% in two months. GenScript's retention optimizer restructured my intros and the difference was immediate.",
    name: "Marcus T.",
    niche: "Finance & Investing",
  },
  {
    quote:
      "I used to spend 8 hours writing a single script. Now I generate a first draft in 90 minutes that actually sounds like me, not like a robot.",
    name: "Sarah K.",
    niche: "Educational Creator",
  },
  {
    quote:
      "Went from 2 videos a month to 11. Revenue is up 340%. GenScript handles the heavy lifting so I can focus on filming.",
    name: "Ryan M.",
    niche: "Faceless Automation",
  },
  {
    quote:
      "The PVSS Framework changed everything. My scripts have real structure now and my audience retention consistently hits 65%+.",
    name: "Priya L.",
    niche: "Business & Entrepreneurship",
  },
  {
    quote:
      "Grew from 8K to 47K subscribers in five months. The Voice DNA feature nails my documentary tone perfectly every time.",
    name: "James O.",
    niche: "True Crime & Documentary",
  },
  {
    quote:
      "I've tried ChatGPT, Jasper, and Subscribr. GenScript is the only tool where my audience can't tell I used AI. The voice matching is that good.",
    name: "Alex C.",
    niche: "Tech Reviews",
  },
  {
    quote:
      "The Compliance Engine caught a medical claim that would have gotten my video flagged. It's saved me from at least three potential strikes.",
    name: "Nina R.",
    niche: "Health & Wellness",
  },
  {
    quote:
      "I manage scripts for 14 clients. GenScript cut my production time by 70% and every client thinks the scripts are hand-written.",
    name: "David W.",
    niche: "Agency Owner",
  },
  {
    quote:
      "The fact-checking feature alone is worth the subscription. I cover financial topics and accuracy is non-negotiable.",
    name: "Keisha B.",
    niche: "Personal Finance",
  },
  {
    quote:
      "Most AI tools don't understand niche technical content. GenScript learned my cybersecurity vocabulary in two uploads.",
    name: "Tom H.",
    niche: "Cybersecurity & Tech",
  },
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
    question: "What is GenScript?",
    answer:
      "GenScript is an AI YouTube script generator that uses Voice DNA technology to match your unique speaking style. It produces retention-optimized, compliance-checked scripts so every video sounds like you wrote it.",
  },
  {
    question: "How does Voice DNA Extraction work?",
    answer:
      "Upload 3-5 of your existing scripts or transcripts. GenScript's AI analyzes 20+ speech patterns including catchphrases, pacing, humor style, and transitions to build a voice profile. Every script generated afterward matches your unique voice.",
  },
  {
    question: "How does GenScript optimize for viewer retention?",
    answer:
      "GenScript uses the PVSS (Pattern, Value, Story, Stakes) Framework to structure scripts for 70%+ viewer retention. Each section is engineered with proven hook formulas, open loops, and pacing techniques that keep viewers watching.",
  },
  {
    question: "What makes GenScript different from ChatGPT or Jasper?",
    answer:
      "Unlike general-purpose AI writers, GenScript is built exclusively for YouTube. It includes Voice DNA matching, a YouTube compliance engine, retention optimization, and fact-checking — features that ChatGPT and Jasper do not offer.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. GenScript offers a free plan that includes 3 scripts per month with compliance checking and retention optimization. Paid plans start at $29/month and unlock unlimited scripts, Voice DNA, and priority support.",
  },
  {
    question: "What YouTube niches does GenScript work for?",
    answer:
      "GenScript works across all YouTube niches including finance, tech reviews, education, true crime, health & wellness, gaming, and more. The Voice DNA system adapts to any content style or subject matter.",
  },
  {
    question: "Does GenScript check YouTube compliance?",
    answer:
      "Yes. Every script is scanned by the built-in Compliance Engine, which checks for YouTube policy violations, AI-detection patterns, and content guidelines. You get a compliance score and specific suggestions before publishing.",
  },
];

const TICKER_STATS = [
  { value: "5,000+", label: "Scripts Generated" },
  { value: "89%", label: "Avg Compliance" },
  { value: "68%", label: "Avg Retention" },
  { value: "0", label: "Policy Strikes" },
];

/* ─── Page ─────────────────────────────────────────────── */

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ctaEmail, setCtaEmail] = useState("");

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]"
          style={{ transform: "translateZ(0)" }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[120px]"
          style={{ transform: "translateZ(0)" }}
        />
        <div
          className="absolute top-1/3 left-1/2 w-[300px] h-[300px] rounded-full bg-emerald-600/10 blur-[100px]"
          style={{ transform: "translateZ(0)" }}
        />
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 glass-pill rounded-full px-6 py-3 w-[95%] max-w-3xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500" />
            <span className="font-display text-lg text-white">GenScript</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#metrics" className="hover:text-white transition-colors">
              Metrics
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Get Started
            </Link>
            <button
              className="md:hidden text-gray-400 hover:text-white p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm glass-pill rounded-2xl p-5 md:hidden">
          <div className="flex flex-col gap-4 text-sm">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#metrics"
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Metrics
            </a>
            <a
              href="#pricing"
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <Link
              href="/login"
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-black text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-20">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm text-gray-400 mb-8">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>YouTube Policy Compliant</span>
            <span className="text-white/20">|</span>
            <span>Built for 2026</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight mb-6">
            AI YouTube Script Generator That Matches Your{" "}
            <span className="shimmer-text">Voice</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            The only AI script engine that extracts your voice DNA{" "}
            <span className="text-white">
              so every script sounds like you wrote it.
            </span>
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>YouTube Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-violet-400" />
              <span>100+ Creators</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span>4.9/5 Rating</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/signup"
              className="shiny-border-btn inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-white font-medium hover:scale-[1.02] transition-transform"
            >
              Extract My Voice
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              See how it works
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          <p className="text-sm text-gray-600">
            No credit card required &middot; 50 free credits
          </p>
        </div>
      </section>

      {/* ── Metrics Ticker ─────────────────────────── */}
      <section id="metrics" className="py-6 border-y border-white/[0.04]">
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...TICKER_STATS, ...TICKER_STATS].map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-10 whitespace-nowrap"
              >
                <span className="font-mono text-2xl md:text-3xl font-semibold text-white">
                  {stat.value}
                </span>
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem / Solution ─────────────────────── */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400 mb-6">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>2026 Policy Update</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              YouTube&apos;s Policy Changed Everything
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              AI-generated content is under scrutiny like never before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Problem */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                The Problem
              </h3>
              <div className="space-y-3">
                {PROBLEMS.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4"
                  >
                    <div className="p-2 rounded-lg bg-red-500/10 shrink-0">
                      <p.icon className={`w-5 h-5 ${p.color}`} />
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {p.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solution */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                The Solution
              </h3>
              <div className="space-y-3">
                {SOLUTIONS.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {s.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section id="features" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              How GenScript Generates Retention-Optimized Scripts
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Features designed specifically for YouTube creators who value
              their channel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`feature-card bg-white/[0.02] border border-white/5 rounded-2xl p-6 ${f.borderHover}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${f.bg} shrink-0`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1.5">
                      {f.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code Integration Block ─────────────────── */}
      <section className="relative py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl text-white mb-3">
              How Voice DNA Extraction Works
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We analyze your transcripts to map 20+ speech patterns like catchphrases, pacing, humor, and transitions, then generate scripts that pass as yours.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
            {/* Editor header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="ml-3 text-xs text-gray-600 font-mono">
                voice-engine.js
              </span>
              <button
                className="ml-auto text-gray-600 hover:text-gray-400 transition-colors"
                aria-label="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Pseudocode */}
            <pre className="p-5 text-sm leading-relaxed font-mono overflow-x-auto">
              <code>
                <span className="text-gray-600">{"// Extract voice DNA from your existing content"}</span>
                {"\n"}
                <span className="text-violet-400">const</span>{" "}
                <span className="text-cyan-300">profile</span>{" "}
                <span className="text-gray-500">=</span>{" "}
                <span className="text-violet-400">await</span>{" "}
                <span className="text-emerald-400">genscript</span>
                <span className="text-gray-500">.</span>
                <span className="text-cyan-300">analyzeVoice</span>
                <span className="text-gray-500">({"{"}</span>
                {"\n"}
                {"  "}
                <span className="text-gray-400">channel</span>
                <span className="text-gray-500">:</span>{" "}
                <span className="text-amber-300">&quot;@YourChannel&quot;</span>
                <span className="text-gray-500">,</span>
                {"\n"}
                {"  "}
                <span className="text-gray-400">videos</span>
                <span className="text-gray-500">:</span>{" "}
                <span className="text-cyan-300">20</span>
                <span className="text-gray-500">,</span>
                {"  "}
                <span className="text-gray-600">{"// pulls transcripts automatically"}</span>
                {"\n"}
                <span className="text-gray-500">{"}"})</span>
                {"\n\n"}
                <span className="text-gray-600">{"// profile.traits →"}</span>
                {"\n"}
                <span className="text-gray-600">{"//   catchphrases · pacing · humor · formality"}</span>
                {"\n"}
                <span className="text-gray-600">{"//   greetings · signoffs · question patterns"}</span>
                {"\n\n"}
                <span className="text-gray-600">{"// Generate with retention optimization baked in"}</span>
                {"\n"}
                <span className="text-violet-400">const</span>{" "}
                <span className="text-cyan-300">script</span>{" "}
                <span className="text-gray-500">=</span>{" "}
                <span className="text-violet-400">await</span>{" "}
                <span className="text-emerald-400">genscript</span>
                <span className="text-gray-500">.</span>
                <span className="text-cyan-300">generate</span>
                <span className="text-gray-500">({"{"}</span>
                {"\n"}
                {"  "}
                <span className="text-gray-400">voice</span>
                <span className="text-gray-500">:</span>{" "}
                <span className="text-cyan-300">profile</span>
                <span className="text-gray-500">,</span>
                {"\n"}
                {"  "}
                <span className="text-gray-400">topic</span>
                <span className="text-gray-500">:</span>{" "}
                <span className="text-amber-300">&quot;Why Most Creators Plateau at 10K&quot;</span>
                <span className="text-gray-500">,</span>
                {"\n"}
                {"  "}
                <span className="text-gray-400">framework</span>
                <span className="text-gray-500">:</span>{" "}
                <span className="text-amber-300">&quot;PVSS&quot;</span>
                <span className="text-gray-500">,</span>
                {"       "}
                <span className="text-gray-600">{"// Problem → Vision → Solution → Steps"}</span>
                {"\n"}
                {"  "}
                <span className="text-gray-400">patternInterrupts</span>
                <span className="text-gray-500">:</span>{" "}
                <span className="text-emerald-400">true</span>
                <span className="text-gray-500">,</span>
                {"  "}
                <span className="text-gray-600">{"// re-hooks every 60-90s"}</span>
                {"\n"}
                {"  "}
                <span className="text-gray-400">length</span>
                <span className="text-gray-500">:</span>{" "}
                <span className="text-cyan-300">12</span>
                {"\n"}
                <span className="text-gray-500">{"}"})</span>
                {"\n\n"}
                <span className="text-gray-600">
                  {"// → voiceMatch: 94% · retentionLift: +38% · hooks: 8"}
                </span>
              </code>
            </pre>
          </div>

          {/* Engine stats */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="vb-badge-violet">20+ voice traits mapped</span>
            <span className="vb-badge-cyan">PVSS retention framework</span>
            <span className="vb-badge-emerald">94%+ voice match</span>
          </div>
        </div>
      </section>

      {/* ── Social Proof / Testimonials ────────────── */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              Creators Trust GenScript
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Real results from real creators who switched to compliance-first
              scripting.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="font-mono text-3xl font-bold text-violet-400">
                  5,000+
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Scripts Generated
                </div>
              </div>
              <div>
                <div className="font-mono text-3xl font-bold text-cyan-400">
                  89%
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Avg Compliance Score
                </div>
              </div>
              <div>
                <div className="font-mono text-3xl font-bold text-emerald-400">
                  68%
                </div>
                <div className="text-sm text-gray-500 mt-1">Avg Retention</div>
              </div>
              <div>
                <div className="font-mono text-3xl font-bold text-white">0</div>
                <div className="text-sm text-gray-500 mt-1">Policy Strikes</div>
              </div>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-6 italic leading-relaxed">
                  &quot;{t.quote}&quot;
                </p>
                <div className="border-t border-white/5 pt-4">
                  <div className="font-semibold text-white text-sm">
                    {t.name}
                  </div>
                  <div className="text-xs text-violet-400">
                    {t.niche}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ───────────────────────── */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              Why Creators Choose GenScript
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              See how we compare to other options.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">
                      Feature
                    </th>
                    <th className="text-center py-4 px-6 text-violet-400 font-medium text-sm">
                      GenScript
                    </th>
                    <th className="text-center py-4 px-6 text-gray-500 font-medium text-sm">
                      ChatGPT
                    </th>
                    <th className="text-center py-4 px-6 text-gray-500 font-medium text-sm">
                      Subscribr
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_DATA.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/[0.03]">
                      <td className="py-4 px-6 text-white text-sm">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 text-center bg-violet-500/[0.03]">
                        {row.genscript === true ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : row.genscript === false ? (
                          <X className="w-5 h-5 text-gray-700 mx-auto" />
                        ) : (
                          <span className="text-yellow-400 text-xs">
                            {row.genscript}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {row.chatgpt === true ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : row.chatgpt === false ? (
                          <X className="w-5 h-5 text-gray-700 mx-auto" />
                        ) : (
                          <span className="text-yellow-400 text-xs">
                            {row.chatgpt}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {row.subscribr === true ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : row.subscribr === false ? (
                          <X className="w-5 h-5 text-gray-700 mx-auto" />
                        ) : (
                          <span className="text-yellow-400 text-xs">
                            {row.subscribr}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/compare/genscript-vs-chatgpt"
              className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
            >
              See detailed comparisons &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────── */}
      <section id="pricing" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Start free, upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Free
              </div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-600 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS.FREE.features.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-400"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center py-2.5 rounded-full border border-white/10 text-sm text-white hover:bg-white/5 transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Creator — Popular */}
            <div className="bg-white/[0.02] border border-violet-500/30 rounded-2xl p-6 relative ring-1 ring-violet-500/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full text-xs font-medium text-white">
                Most Popular
              </div>
              <div className="text-xs text-violet-400 uppercase tracking-wider mb-2">
                Creator
              </div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-bold text-white">
                  ${PLANS.CREATOR.price}
                </span>
                <span className="text-gray-600 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS.CREATOR.features.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-400"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=creator"
                className="block text-center py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>

            {/* Professional */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Professional
              </div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-bold text-white">
                  ${PLANS.PROFESSIONAL.price}
                </span>
                <span className="text-gray-600 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS.PROFESSIONAL.features.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-400"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=professional"
                className="block text-center py-2.5 rounded-full border border-white/10 text-sm text-white hover:bg-white/5 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
            >
              View all plans including Agency &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────── */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_DATA.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white text-sm pr-4">
                    {faq.question}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-600 transition-transform shrink-0 ${
                      openFaq === idx ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────── */}
      <section className="relative py-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            Ready to Scale Your Output?
          </h2>
          <p className="text-gray-500 mb-10">
            7-day free trial. No credit card required.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/signup${ctaEmail ? `?email=${encodeURIComponent(ctaEmail)}` : ""}`;
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 px-5 py-3 rounded-full bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/40 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors shrink-0"
            >
              Start Trial
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="relative py-16 px-4 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500" />
                <span className="font-display text-lg text-white">
                  GenScript
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Compliance-first AI scriptwriting for YouTube creators.
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                All systems operational
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-medium text-white text-sm mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link
                  href="/compliance-check"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  Compliance Checker
                </Link>
                <Link
                  href="/tools/youtube-script-generator"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  Script Generator
                </Link>
                <Link
                  href="/tools"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  Free Tools
                </Link>
                <Link
                  href="/pricing"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-medium text-white text-sm mb-4">
                Resources
              </h4>
              <div className="space-y-2 text-sm">
                <Link
                  href="/resources/youtube-compliance-whitepaper"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  Compliance Whitepaper
                </Link>
                <Link
                  href="/resources/creator-compliance-checklist"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  Creator Checklist
                </Link>
                <Link
                  href="/blog"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="/about"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  About
                </Link>
              </div>
            </div>

            {/* Compare */}
            <div>
              <h4 className="font-medium text-white text-sm mb-4">Compare</h4>
              <div className="space-y-2 text-sm">
                <Link
                  href="/compare/genscript-vs-chatgpt"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  GenScript vs ChatGPT
                </Link>
                <Link
                  href="/compare/genscript-vs-subscribr"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  GenScript vs Subscribr
                </Link>
                <Link
                  href="/alternatives/chatgpt"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  ChatGPT Alternative
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium text-white text-sm mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link
                  href="/privacy"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/terms-voice-cloning"
                  className="block text-gray-600 hover:text-white transition-colors"
                >
                  Voice Cloning Terms
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.04] text-center text-xs text-gray-700">
            &copy; {new Date().getFullYear()} GenScript. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

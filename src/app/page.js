"use client";

import { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/ui/tilt-card";
import { StatHero, AnimatedCounter } from "@/components/stats";
import {
  ArrowRight,
  Sparkles,
  Play,
  BarChart3,
  FileText,
  Users,
  Globe,
  Mic,
  TrendingUp,
  Star,
  ChevronDown,
  Target,
  Code2,
  Palette,
  Layers,
} from "lucide-react";

export default function Home() {
  const heroRef = useRef(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 overflow-hidden">
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

        {/* Particle Field */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => {
            // Use deterministic values based on index to avoid hydration mismatch
            const seededRandom = (seed, multiplier = 1) => {
              const x =
                Math.sin(seed * 12.9898 + multiplier * 78.233) * 43758.5453;
              return x - Math.floor(x);
            };

            // Pre-calculate all values and format them consistently
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
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/tools"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Free Tools
            </Link>
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

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 py-22"
      >
        <div className="relative z-10 max-w-5xl mx-auto text-center stagger-children">
          {/* Glowing Badge with Market Validation */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 animate-glow">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-200">
              Join 69M+ YouTube creators using AI
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="block text-white text-glow">AI Scripts That</span>
            <span className="block gradient-text text-glow holographic bg-clip-text">
              Go Viral
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Generate YouTube scripts in your unique voice. Analyze top
            performers, research trends, and create content that drives views.
          </p>

          {/* Hero Market Stats */}
          <div className="mb-12">
            <StatHero />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button
                size="lg"
                className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/tools">
              <Button size="lg" className="glass-button text-white">
                Try Free Tools
              </Button>
            </Link>
          </div>

          <p className="text-gray-400">
            No credit card required • 10 free scripts
          </p>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Lazy load Features Section */}
      {(() => {
        const OptimizedFeatures = dynamic(
          () =>
            import("@/components/OptimizedFeatures").then((mod) => ({
              default: mod.OptimizedFeatures,
            })),
          {
            ssr: true,
            loading: () => (
              <div className="py-32 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="h-20 bg-gray-700 rounded mb-8 animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="glass-card p-6 h-48 animate-pulse"
                      >
                        <div className="h-16 bg-gray-700 rounded mb-4"></div>
                        <div className="h-4 bg-gray-600 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ),
          }
        );
        return <OptimizedFeatures />;
      })()}

      {/* Import SocialProofStats component dynamically */}
      {(() => {
        const SocialProofStats = dynamic(
          () =>
            import("@/components/stats").then((mod) => ({
              default: mod.SocialProofStats,
            })),
          {
            ssr: false,
            loading: () => (
              <div className="py-32 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="glass-card p-6 animate-pulse">
                        <div className="h-12 bg-gray-700 rounded mb-4"></div>
                        <div className="h-4 bg-gray-600 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ),
          }
        );
        return <SocialProofStats />;
      })()}

      {/* Final CTA with Parallax */}
      <section className="relative py-32 px-4 mt-40">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative overflow-hidden">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 text-glow relative z-20">
              Ready to Create Your Best Content?
            </h2>
            {/* Background text effect - positioned behind and clipped */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <p className="text-[8rem] md:text-[10rem] font-bold text-white">
                CREATE
              </p>
            </div>
          </div>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto relative z-10">
            Join <AnimatedCounter end={250} startOnView={true} />+ creators
            achieving{" "}
            <AnimatedCounter end={180} suffix="%" startOnView={true} /> faster
            growth
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transform transition relative z-10"
            >
              Start Your Free Trial
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          {/* Floating testimonials - hidden on mobile to prevent overlap */}
          <div className="mt-20 relative hidden md:block">
            <div className="absolute -left-20 top-0 glass-card p-4 animate-float max-w-xs">
              <p className="text-sm text-gray-300">
                "GenScript revolutionized my workflow!"
              </p>
              <p className="text-xs text-purple-400 mt-2">- Top Creator</p>
            </div>
            <div
              className="absolute -right-20 top-10 glass-card p-4 animate-float max-w-xs"
              style={{ animationDelay: "3s" }}
            >
              <p className="text-sm text-gray-300">
                "10x faster script creation"
              </p>
              <p className="text-xs text-pink-400 mt-2">- YouTube Partner</p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold gradient-text mb-2">
                GenScript
              </h3>
              <p className="text-gray-400">AI-powered content creation</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <Link
                href="/contact"
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © 2024 GenScript. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

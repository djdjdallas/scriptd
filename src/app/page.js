"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/ui/tilt-card";
import { useMagnetic } from "@/hooks/useMagnetic";
import {
  ArrowRight,
  Sparkles,
  Play,
  BarChart3,
  FileText,
  Users,
  Globe,
  Zap,
  Brain,
  Mic,
  TrendingUp,
  Star,
  ChevronDown,
  Wand2,
  Rocket,
  Target,
  Code2,
  Palette,
  Layers,
} from "lucide-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(null);
  const heroRef = useRef(null);
  const magneticRef1 = useMagnetic(0.3);
  const magneticRef2 = useMagnetic(0.4);
  const magneticRef3 = useMagnetic(0.5);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const parallaxStyle = (speed = 1) => ({
    transform: `translateY(${scrollY * speed}px)`,
  });

  const features = [
    {
      id: "voice",
      icon: Mic,
      title: "Voice Cloning",
      description:
        "AI learns your unique style from samples. Never lose your authentic voice.",
      color: "purple",
      gradient: "from-purple-500/20",
    },
    {
      id: "viral",
      icon: TrendingUp,
      title: "Viral Analysis",
      description:
        "Study what works. Extract patterns from millions of successful videos.",
      color: "pink",
      gradient: "from-pink-500/20",
    },
    {
      id: "research",
      icon: Brain,
      title: "Smart Research",
      description:
        "Pull insights from trending content and your knowledge base instantly.",
      color: "blue",
      gradient: "from-blue-500/20",
    },
    {
      id: "hook",
      icon: Play,
      title: "Hook Generator",
      description:
        "Create attention-grabbing intros that keep viewers watching.",
      color: "green",
      gradient: "from-green-500/20",
    },
    {
      id: "tracking",
      icon: BarChart3,
      title: "Performance Tracking",
      description:
        "Monitor script performance and optimize your content strategy.",
      color: "orange",
      gradient: "from-orange-500/20",
    },
    {
      id: "team",
      icon: Users,
      title: "Team Workspace",
      description: "Collaborate seamlessly with editors and team members.",
      color: "indigo",
      gradient: "from-indigo-500/20",
    },
  ];

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
          <Link
            href="/"
            className="text-2xl font-bold gradient-text"
          >
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
              <Button
                className="glass-button text-white"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
              >
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
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            ref={magneticRef1}
            className="absolute top-20 left-10 animate-float"
          >
            <div className="glass-card w-20 h-20 flex items-center justify-center glitch-hover">
              <Sparkles className="w-10 h-10 text-purple-400 neon-glow" />
            </div>
          </div>
          <div
            ref={magneticRef2}
            className="absolute top-40 right-20 animate-float"
            style={{ animationDelay: "2s" }}
          >
            <div className="glass-card w-24 h-24 flex items-center justify-center">
              <Brain className="w-12 h-12 text-pink-400 neon-glow" />
            </div>
          </div>
          <div
            ref={magneticRef3}
            className="absolute bottom-20 left-1/4 animate-float"
            style={{ animationDelay: "4s" }}
          >
            <div className="glass-card w-16 h-16 flex items-center justify-center">
              <Zap className="w-8 h-8 text-yellow-400 neon-glow" />
            </div>
          </div>
          <div
            className="absolute top-1/3 right-1/4 animate-float"
            style={{ animationDelay: "6s" }}
          >
            <div className="glass-card w-14 h-14 flex items-center justify-center">
              <Wand2 className="w-7 h-7 text-blue-400 neon-glow" />
            </div>
          </div>
          <div
            className="absolute bottom-1/3 left-20 animate-float"
            style={{ animationDelay: "8s" }}
          >
            <div className="glass-card w-18 h-18 flex items-center justify-center">
              <Rocket className="w-9 h-9 text-green-400 neon-glow" />
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center stagger-children">
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 animate-glow">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-200">
              Trusted by 150+ creators
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="block text-white text-glow">AI Scripts That</span>
            <span className="block gradient-text text-glow holographic bg-clip-text">
              Go Viral
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Generate YouTube scripts in your unique voice. Analyze top
            performers, research trends, and create content that drives views.
          </p>

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
              <Button
                size="lg"
                className="glass-button text-white"
              >
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

      {/* Interactive Features Grid */}
      <section className="relative py-32 px-4" style={parallaxStyle(0.3)}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Superpowers for{" "}
              <span className="gradient-text">Content Creators</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Advanced AI tools designed to amplify your creative process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {features.map((feature) => (
              <TiltCard key={feature.id}>
                <div
                  className="glass-card group cursor-pointer glass-hover h-full"
                  onMouseEnter={() => {
                    setActiveFeature(feature.id);
                  }}
                  onMouseLeave={() => {
                    setActiveFeature(null);
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                  />
                  <div className="relative z-10">
                    <div className="w-16 h-16 glass rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon
                        className={`w-8 h-8 text-${feature.color}-400`}
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300">{feature.description}</p>
                    {activeFeature === feature.id && (
                      <div className="mt-4 glass rounded-lg p-3 animate-reveal">
                        <p className="text-sm text-purple-300">
                          Click to explore →
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Stats with Counter Animation */}
      <section className="relative py-32 px-4" style={parallaxStyle(0.2)}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card text-center group">
              <div className="text-5xl font-bold gradient-text mb-2 holographic bg-clip-text">
                2,500+
              </div>
              <p className="text-xl text-gray-300">Scripts Generated</p>
              <div className="mt-4 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-8 glass rounded animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
            <div className="glass-card text-center group">
              <div className="text-5xl font-bold gradient-text mb-2 holographic bg-clip-text">
                1.2M+
              </div>
              <p className="text-xl text-gray-300">Views Generated</p>
              <div className="mt-4 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-8 glass rounded animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
            <div className="glass-card text-center group">
              <div className="text-5xl font-bold gradient-text mb-2 holographic bg-clip-text">
                95%
              </div>
              <p className="text-xl text-gray-300">Creator Satisfaction</p>
              <div className="mt-4 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-8 glass rounded animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
            Join Hundreds of creators who've transformed their content game with
            AI
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
              <Link
                href="/blog"
                className="hover:text-white transition-colors"
              >
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

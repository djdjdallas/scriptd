"use client";

import { useState } from "react";
import { StaticCard } from "@/components/ui/static-card";
import InteractiveFeatureDetail from "./InteractiveFeatureDetail";
import {
  Mic,
  TrendingUp,
  Brain,
  Play,
  BarChart3,
  Users,
  FileText
} from "lucide-react";

export function OptimizedFeatures() {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      id: "voice",
      icon: Mic,
      title: "Voice Cloning",
      description: "AI learns your unique style from samples. Never lose your authentic voice.",
      color: "purple",
      gradient: "from-purple-500/20",
      stats: { improvement: "95% accuracy", users: "1,500+" }
    },
    {
      id: "viral",
      icon: TrendingUp,
      title: "Viral Analysis",
      description: "Study what works. Extract patterns from millions of successful videos.",
      color: "pink",
      gradient: "from-pink-500/20",
      stats: { improvement: "35% CTR boost", analyzed: "10M+ videos" }
    },
    {
      id: "research",
      icon: Brain,
      title: "Smart Research",
      description: "Pull insights from trending content and your knowledge base instantly.",
      color: "blue",
      gradient: "from-blue-500/20",
      stats: { improvement: "5x faster", sources: "1000+ sources" }
    },
    {
      id: "transcript",
      icon: FileText,
      title: "Transcript Extraction",
      description: "Extract and analyze YouTube transcripts. AI-powered hook analysis, topic detection, and competitive research—10x faster.",
      color: "green",
      gradient: "from-green-500/20",
      stats: { speed: "10x faster", success: "90% rate" },
      badge: "New"
    },
    {
      id: "hook",
      icon: Play,
      title: "Hook Generator",
      description: "Create attention-grabbing intros that keep viewers watching.",
      color: "emerald",
      gradient: "from-emerald-500/20",
      stats: { improvement: "60% retention", templates: "500+" }
    },
    {
      id: "tracking",
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Monitor script performance and optimize your content strategy.",
      color: "orange",
      gradient: "from-orange-500/20",
      stats: { metrics: "20+ KPIs", realtime: "Yes" }
    },
    {
      id: "team",
      icon: Users,
      title: "Team Workspace",
      description: "Collaborate seamlessly with editors and team members.",
      color: "indigo",
      gradient: "from-indigo-500/20",
      stats: { teams: "300+", collaboration: "Real-time" }
    }
  ];

  return (
    <section className="relative py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Superpowers for{" "}
            <span className="gradient-text">Content Creators</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Advanced AI tools designed to amplify your creative process
          </p>
          <div className="mt-6 inline-flex items-center gap-2 glass-card px-4 py-2 text-sm text-gray-300">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Used by 71.7% of content marketers for outlining
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {features.map((feature) => (
            <StaticCard key={feature.id}>
              <div
                className="glass-card group cursor-pointer glass-hover h-full"
                onMouseEnter={() => setActiveFeature(feature.id)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                />
                <div className="relative z-10">
                  <div className="w-16 h-16 glass rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className={`w-8 h-8 text-${feature.color}-400`} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-2xl font-bold text-white">
                      {feature.title}
                    </h3>
                    {feature.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300">{feature.description}</p>
                  
                  {feature.stats && (
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      {Object.entries(feature.stats).map(([key, value]) => (
                        <div key={key} className="text-gray-400">
                          <span className="text-purple-400 font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeFeature === feature.id && (
                    <InteractiveFeatureDetail feature={feature} />
                  )}
                </div>
              </div>
            </StaticCard>
          ))}
        </div>
      </div>
    </section>
  );
}
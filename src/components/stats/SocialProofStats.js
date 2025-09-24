"use client";

import { StatGrid } from "./StatGrid";
import { Zap, TrendingUp, MousePointer, Clock, Target, Rocket } from "lucide-react";

export function SocialProofStats() {
  const performanceStats = [
    {
      id: "growth",
      value: 180,
      label: "Faster Channel Growth",
      suffix: "%",
      icon: Rocket,
      gradient: true,
      source: "AI Tool User Study",
      subLabel: "Compared to manual creation"
    },
    {
      id: "uploads",
      value: 34,
      label: "Monthly Uploads",
      prefix: "Up to ",
      icon: TrendingUp,
      source: "Creator Analytics",
      subLabel: "From 12 uploads baseline"
    },
    {
      id: "ctr",
      value: 35,
      label: "Higher Click-Through Rate",
      suffix: "%",
      icon: MousePointer,
      gradient: true,
      source: "Performance Data",
      subLabel: "Average improvement"
    },
    {
      id: "productivity",
      value: 5,
      label: "Productivity Boost",
      suffix: "x",
      icon: Zap,
      source: "YouTube AI Tools",
      subLabel: "Up to 70% with advanced AI"
    },
    {
      id: "automation",
      value: 58,
      label: "Channels Using Automation",
      suffix: "%",
      icon: Clock,
      source: "Industry Forecast 2025",
      subLabel: "Mid-sized creators adopting"
    },
    {
      id: "conversion",
      value: 8,
      label: "Premium Conversion Rate",
      suffix: "%",
      icon: Target,
      gradient: true,
      source: "SaaS Benchmarks",
      subLabel: "Top-tier tool performance"
    }
  ];

  return (
    <section className="relative py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Proven Results for <span className="gradient-text">Ambitious Creators</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of creators achieving extraordinary growth with AI-powered content creation
          </p>
        </div>

        <StatGrid
          stats={performanceStats}
          columns={{ default: 1, sm: 2, lg: 3 }}
          gap={8}
          stagger={true}
        />

        {/* Market Opportunity Callout */}
        <div className="mt-16 glass-card p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              The Creator Economy Opportunity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">$480B</div>
                <p className="text-sm text-gray-400">Creator Economy by 2027</p>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">$20B</div>
                <p className="text-sm text-gray-400">YouTube Creator Payouts 2025</p>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">68%</div>
                <p className="text-sm text-gray-400">Use AI for Content Ideation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
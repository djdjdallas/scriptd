"use client";

import { AnimatedCounter } from "./AnimatedCounter";
import { TrendingUp, DollarSign, Users } from "lucide-react";

export function StatHero() {
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {/* AI Market Growth */}
        <div className="text-center group">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <div className="text-2xl md:text-3xl font-bold text-white">
              $<AnimatedCounter end={1.5} decimals={1} startOnView={false} />B → $<AnimatedCounter end={7.5} decimals={1} startOnView={false} />B
            </div>
          </div>
          <p className="text-sm text-gray-400">AI Video Market by 2033</p>
          <div className="mt-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Source: Market Research
          </div>
        </div>

        {/* Content Marketers Using AI */}
        <div className="text-center group">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-5 h-5 text-pink-400" />
            <div className="text-2xl md:text-3xl font-bold gradient-text">
              <AnimatedCounter end={71.7} decimals={1} suffix="%" startOnView={false} />
            </div>
          </div>
          <p className="text-sm text-gray-400">Marketers Use AI for Outlining</p>
          <div className="mt-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Industry Report 2024
          </div>
        </div>

        {/* YouTube Creators */}
        <div className="text-center group">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <div className="text-2xl md:text-3xl font-bold text-white">
              <AnimatedCounter end={69} suffix="M+" startOnView={false} />
            </div>
          </div>
          <p className="text-sm text-gray-400">YouTube Creators Globally</p>
          <div className="mt-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            YouTube Statistics 2024
          </div>
        </div>
      </div>

      {/* Trust Indicator */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-xs text-gray-300">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Join the <AnimatedCounter end={180} suffix="%" startOnView={false} /> faster growing creators
        </div>
      </div>
    </div>
  );
}
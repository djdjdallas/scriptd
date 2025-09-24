"use client";

import { AnimatedCounter } from "./AnimatedCounter";
import { TrendingUp, Info } from "lucide-react";

export function StatCard({ 
  value,
  label,
  subLabel,
  prefix = "",
  suffix = "",
  decimals = 0,
  trend,
  trendLabel,
  source,
  sourceUrl,
  icon: Icon,
  className = "",
  size = "default",
  gradient = false,
  delay = 0
}) {
  const sizeClasses = {
    small: "p-4",
    default: "p-6",
    large: "p-8"
  };

  const valueSizeClasses = {
    small: "text-2xl md:text-3xl",
    default: "text-3xl md:text-4xl",
    large: "text-4xl md:text-5xl"
  };

  const labelSizeClasses = {
    small: "text-sm",
    default: "text-base",
    large: "text-lg"
  };

  return (
    <div 
      className={`glass-card group hover:scale-105 transition-all duration-300 ${sizeClasses[size]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {Icon && (
            <div className="w-10 h-10 glass rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5 text-purple-400" />
            </div>
          )}
          
          <div className={`font-bold mb-2 ${valueSizeClasses[size]} ${gradient ? 'gradient-text holographic bg-clip-text' : 'text-white'}`}>
            <AnimatedCounter
              end={value}
              duration={2000}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              startOnView={true}
            />
          </div>

          <p className={`text-gray-300 ${labelSizeClasses[size]}`}>
            {label}
          </p>
          
          {subLabel && (
            <p className="text-sm text-gray-400 mt-1">
              {subLabel}
            </p>
          )}
        </div>

        {source && (
          <div className="relative group/tooltip">
            <Info className="w-4 h-4 text-gray-500 cursor-help" />
            <div className="absolute right-0 top-6 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 z-50">
              <div className="glass-card p-2 text-xs text-gray-300 whitespace-nowrap">
                {sourceUrl ? (
                  <a 
                    href={sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-purple-400 transition-colors"
                  >
                    Source: {source}
                  </a>
                ) : (
                  `Source: ${source}`
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          <TrendingUp className={`w-4 h-4 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`} />
          <span className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          {trendLabel && (
            <span className="text-sm text-gray-400">{trendLabel}</span>
          )}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
    </div>
  );
}
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

export default function FeatureTable({ 
  competitorData, 
  ourPlatformData,
  highlightedFeatures = [],
  showPricing = true 
}) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  // Organize features by category
  const featureCategories = {
    'AI & Generation': [
      { key: 'scriptGeneration', label: 'Script Generation', tooltip: 'AI-powered script creation capabilities' },
      { key: 'voiceMatching', label: 'Voice Matching', tooltip: 'Match your unique speaking style' },
      { key: 'customVoiceTraining', label: 'Custom Voice Training', tooltip: 'Train AI on your past content' },
      { key: 'qualityTiers', label: 'Quality Tiers', tooltip: 'Different quality/speed options' }
    ],
    'Optimization': [
      { key: 'retentionOptimization', label: 'Retention Optimization', tooltip: 'Optimize for viewer watch time' },
      { key: 'pvssFramework', label: 'PVSS Framework', tooltip: 'Pattern-Value-Story-Surprise viral structure' },
      { key: 'psychographicTargeting', label: 'Psychographic Targeting', tooltip: 'Deep audience psychology analysis' },
      { key: 'seoOptimization', label: 'SEO Optimization', tooltip: 'Search engine optimization features' }
    ],
    'Content Tools': [
      { key: 'hookLibrary', label: 'Hook Library', tooltip: 'Pre-tested viral hooks and openings' },
      { key: 'thumbnailAnalysis', label: 'Thumbnail Creation', tooltip: 'AI-powered thumbnail generation' },
      { key: 'factChecking', label: 'Fact Checking', tooltip: 'Automated fact verification' },
      { key: 'abTesting', label: 'A/B Testing', tooltip: 'Test different script versions' }
    ],
    'Platform & Support': [
      { key: 'apiAccess', label: 'API Access', tooltip: 'Programmatic access to features' },
      { key: 'support', label: 'Support', tooltip: 'Customer support options' },
      { key: 'wordLimit', label: 'Word/Script Limit', tooltip: 'Monthly usage limits' }
    ]
  };
  
  const renderFeatureValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto" />
      );
    }
    
    if (typeof value === 'number') {
      return <span className="font-medium">{value.toLocaleString()}+</span>;
    }
    
    return <span className="text-sm">{value}</span>;
  };
  
  const isFeatureBetter = (ourValue, competitorValue) => {
    // Check if our feature is better
    if (typeof ourValue === 'boolean' && typeof competitorValue === 'boolean') {
      return ourValue && !competitorValue;
    }
    if (typeof ourValue === 'number' && typeof competitorValue === 'number') {
      return ourValue > competitorValue;
    }
    if (ourValue === 'Unlimited' && competitorValue !== 'Unlimited') {
      return true;
    }
    return false;
  };
  
  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold min-w-[150px]">
                    {competitorData.name}
                  </th>
                  <th className="text-center p-4 font-semibold min-w-[150px] bg-purple-50 dark:bg-purple-950/20">
                    {ourPlatformData.name}
                    <div className="text-xs font-normal text-muted-foreground mt-1">
                      (Your Choice)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Pricing Row */}
                {showPricing && (
                  <tr className="border-t border-b-2 bg-muted/20">
                    <td className="p-4 font-semibold">Pricing</td>
                    <td className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">Starting at</div>
                      <div className="text-xl font-bold">
                        ${competitorData.pricing.starter}/mo
                      </div>
                    </td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-950/20">
                      <div className="text-sm text-muted-foreground">Starting at</div>
                      <div className="text-xl font-bold text-purple-600">
                        ${ourPlatformData.pricing.starter}/mo
                      </div>
                      <div className="text-xs text-green-600 font-medium mt-1">
                        Save {Math.round((1 - ourPlatformData.pricing.starter / competitorData.pricing.starter) * 100)}%
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* Feature Categories */}
                {Object.entries(featureCategories).map(([category, features]) => (
                  <React.Fragment key={category}>
                    {/* Category Header */}
                    <tr 
                      className="border-t bg-muted/30 cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    >
                      <td colSpan={3} className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm uppercase tracking-wider">
                            {category}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {expandedCategory === category ? '−' : '+'}
                          </span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Features in Category */}
                    {(expandedCategory === category || expandedCategory === null) && features.map((feature) => {
                      const competitorValue = competitorData.features[feature.key];
                      const ourValue = ourPlatformData.features[feature.key];
                      const isBetter = isFeatureBetter(ourValue, competitorValue);
                      const isHighlighted = highlightedFeatures.includes(feature.key);
                      
                      return (
                        <tr 
                          key={feature.key} 
                          className={`border-t ${isHighlighted ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`${isHighlighted ? 'font-semibold' : ''}`}>
                                {feature.label}
                              </span>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{feature.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                              {isBetter && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Better
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {renderFeatureValue(competitorValue)}
                          </td>
                          <td className={`p-4 text-center bg-purple-50 dark:bg-purple-950/20 ${isBetter ? 'font-semibold' : ''}`}>
                            <div className={isBetter ? 'text-purple-600' : ''}>
                              {renderFeatureValue(ourValue)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* CTA Below Table */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">
          See the difference yourself with a free 14-day trial
        </p>
        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
          Start Your Free Trial
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </TooltipProvider>
  );
}
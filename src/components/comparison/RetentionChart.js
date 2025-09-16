'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function RetentionChart({ 
  competitorName, 
  competitorRetention = 35, 
  ourRetention = 68 
}) {
  const improvement = Math.round(((ourRetention - competitorRetention) / competitorRetention) * 100);
  
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Retention Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{competitorName}</span>
              <span className="text-sm text-muted-foreground">{competitorRetention}% AVD</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gray-400 dark:bg-gray-500 transition-all duration-1000 ease-out"
                style={{ width: `${competitorRetention}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Subscribr</span>
              <span className="text-sm font-bold text-purple-600">{ourRetention}% AVD</span>
            </div>
            <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                style={{ width: `${ourRetention}%` }}
              />
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Improvement
              </span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{improvement}%
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Average improvement after switching to Subscribr
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
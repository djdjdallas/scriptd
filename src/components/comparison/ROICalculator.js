'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ROICalculator() {
  const [subscribers, setSubscribers] = useState(10000);
  const [avgViews, setAvgViews] = useState(2000);
  const [currentRetention, setCurrentRetention] = useState(35);
  
  // Calculate potential improvements
  const improvedRetention = 68; // Our average
  const retentionIncrease = improvedRetention - currentRetention;
  const viewsIncrease = Math.round(avgViews * (retentionIncrease / 100) * 2.5); // Algorithm boost
  const revenueIncrease = Math.round((viewsIncrease * 0.002) * 30); // Estimated monthly revenue
  const subscribrCost = 49; // Professional plan
  const roi = Math.round(((revenueIncrease - subscribrCost) / subscribrCost) * 100);
  
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          Calculate Your Potential ROI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="subscribers">Current Subscribers</Label>
            <Input
              id="subscribers"
              type="number"
              value={subscribers}
              onChange={(e) => setSubscribers(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="avgViews">Average Views per Video</Label>
            <Input
              id="avgViews"
              type="number"
              value={avgViews}
              onChange={(e) => setAvgViews(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="retention">Current Average Retention (%)</Label>
            <Input
              id="retention"
              type="number"
              value={currentRetention}
              onChange={(e) => setCurrentRetention(Number(e.target.value))}
              min="10"
              max="100"
              className="mt-1"
            />
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Your Potential Results:</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Retention Improvement</span>
                </div>
                <span className="font-bold text-purple-600">+{retentionIncrease}%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Additional Monthly Views</span>
                </div>
                <span className="font-bold text-purple-600">+{viewsIncrease.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Est. Revenue Increase</span>
                </div>
                <span className="font-bold text-green-600">${revenueIncrease}/mo</span>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">ROI with Subscribr</span>
                  <span className="text-2xl font-bold">{roi}%</span>
                </div>
                <p className="text-sm opacity-90">
                  Invest ${subscribrCost}/mo, potentially earn ${revenueIncrease}/mo
                </p>
              </div>
            </div>
          </div>
          
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
            Start Improving Your ROI Today
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
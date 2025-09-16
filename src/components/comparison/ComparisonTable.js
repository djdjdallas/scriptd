'use client';

import { Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ComparisonTable({ competitor, ourPlatform, features }) {
  const renderFeatureValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto" />
      );
    }
    return <span className="text-sm text-muted-foreground">{value}</span>;
  };

  const renderOurValue = (value) => {
    if (typeof value === 'boolean') {
      return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    }
    return <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{value}</span>;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="text-center p-4 font-semibold">{competitor.name}</th>
                <th className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 font-semibold">
                  {ourPlatform.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={idx} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{feature.label}</td>
                  <td className="p-4 text-center">
                    {renderFeatureValue(feature.competitorValue)}
                  </td>
                  <td className="p-4 text-center bg-purple-50/50 dark:bg-purple-950/10">
                    {renderOurValue(feature.ourValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
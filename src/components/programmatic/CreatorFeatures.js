import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Zap, Target, BarChart3 } from 'lucide-react';

const featuresByCreatorType = {
  developers: [
    { icon: CheckCircle2, title: 'Code Syntax Highlighting', description: 'Properly formatted code blocks optimized for readability' },
    { icon: Zap, title: 'Technical Accuracy', description: 'AI trained on programming tutorials and documentation' },
    { icon: Target, title: 'Tutorial Structure', description: 'Step-by-step explanations that developers understand' },
    { icon: BarChart3, title: 'Retention Analytics', description: 'Track which coding concepts keep viewers engaged' }
  ],
  'business-educators': [
    { icon: CheckCircle2, title: 'Case Study Integration', description: 'Real-world examples that build credibility' },
    { icon: Zap, title: 'Data Visualization', description: 'Scripts optimized for charts and infographics' },
    { icon: Target, title: 'Authority Building', description: 'Professional tone that converts viewers to customers' },
    { icon: BarChart3, title: 'Conversion Tracking', description: 'Measure how scripts drive business results' }
  ],
  'faceless-channels': [
    { icon: CheckCircle2, title: 'Bulk Generation', description: 'Create multiple scripts efficiently for automation' },
    { icon: Zap, title: 'Proven Niches', description: 'Templates for high-RPM faceless content' },
    { icon: Target, title: 'Retention Optimization', description: 'Scripts designed for 70%+ retention rates' },
    { icon: BarChart3, title: 'Monetization Focus', description: 'Maximize RPM and ad revenue potential' }
  ],
  'gaming-creators': [
    { icon: CheckCircle2, title: 'Game Terminology', description: 'Accurate game-specific language and slang' },
    { icon: Zap, title: 'Commentary Pacing', description: 'Perfect timing for exciting gameplay moments' },
    { icon: Target, title: 'Community Engagement', description: 'Scripts that build loyal gaming communities' },
    { icon: BarChart3, title: 'Engagement Metrics', description: 'Track what keeps gamers watching' }
  ],
  'lifestyle-vloggers': [
    { icon: CheckCircle2, title: 'Personal Storytelling', description: 'Authentic scripts that feel like you' },
    { icon: Zap, title: 'Brand Integration', description: 'Seamlessly weave in sponsorship content' },
    { icon: Target, title: 'Audience Connection', description: 'Build deeper relationships with viewers' },
    { icon: BarChart3, title: 'Sponsor Metrics', description: 'Prove ROI to attract better brand deals' }
  ]
};

export default function CreatorFeatures({ type }) {
  const features = featuresByCreatorType[type] || featuresByCreatorType['developers'];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Features Built for Your Content
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

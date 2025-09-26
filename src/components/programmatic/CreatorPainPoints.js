import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatCreatorType(type) {
  const formats = {
    'developers': 'Developer',
    'business-educators': 'Business Educator',
    'faceless-channels': 'Faceless Channel',
    'gaming-creators': 'Gaming Creator',
    'lifestyle-vloggers': 'Lifestyle Vlogger'
  };
  return formats[type] || type;
}

export default function CreatorPainPoints({ type }) {
  const painPoints = {
    developers: [
      {
        title: 'Complex Code Explanations',
        description: 'Struggling to explain complex code concepts without losing viewer attention'
      },
      {
        title: 'Technical Accuracy vs Engagement',
        description: 'Balancing technical correctness with entertaining delivery'
      },
      {
        title: 'Tutorial Pacing',
        description: 'Moving too fast for beginners or too slow for experienced developers'
      },
      {
        title: 'Competition with Documentation',
        description: 'Competing with official docs and Stack Overflow for viewer attention'
      }
    ],
    'business-educators': [
      {
        title: 'Converting Free Viewers',
        description: 'Turning YouTube viewers into paying course students or clients'
      },
      {
        title: 'Building Authority',
        description: 'Establishing credibility in a saturated business education market'
      },
      {
        title: 'Engagement with Dry Topics',
        description: 'Making business concepts exciting and binge-worthy'
      },
      {
        title: 'ROI Demonstration',
        description: 'Proving value without giving away all your premium content'
      }
    ],
    'faceless-channels': [
      {
        title: 'Generic Script Quality',
        description: 'AI-generated scripts that sound robotic and hurt retention'
      },
      {
        title: 'Content Scaling',
        description: 'Producing quality scripts at scale for multiple channels'
      },
      {
        title: 'Voice Optimization',
        description: 'Scripts that don't work well with text-to-speech tools'
      },
      {
        title: 'Monetization Challenges',
        description: 'Low retention rates leading to poor RPM and revenue'
      }
    ],
    'gaming-creators': [
      {
        title: 'Commentary Flow',
        description: 'Maintaining engaging commentary during gameplay'
      },
      {
        title: 'Highlight Selection',
        description: 'Choosing which moments deserve script emphasis'
      },
      {
        title: 'Community Building',
        description: 'Creating scripts that foster community engagement'
      },
      {
        title: 'Game-Specific Knowledge',
        description: 'Keeping up with meta changes and game terminology'
      }
    ],
    'lifestyle-vloggers': [
      {
        title: 'Authentic Storytelling',
        description: 'Scripting content that still feels genuine and spontaneous'
      },
      {
        title: 'Brand Integration',
        description: 'Naturally incorporating sponsors without losing authenticity'
      },
      {
        title: 'Personal vs Professional',
        description: 'Balancing personal stories with professional presentation'
      },
      {
        title: 'Audience Connection',
        description: 'Creating parasocial relationships through scripted content'
      }
    ]
  };
  
  const points = painPoints[type] || painPoints.developers;
  
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Challenges Every {formatCreatorType(type)} Faces
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {points.map((point, idx) => (
            <Card key={idx} className="border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <CardTitle className="text-lg">{point.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{point.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Genscript Solves These Challenges
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI is specifically trained on successful {formatCreatorType(type).toLowerCase()} 
              content, understanding exactly what your audience wants and how to deliver it.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
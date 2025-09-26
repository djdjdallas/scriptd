import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

function formatCreatorType(type) {
  const formats = {
    'developers': 'Developer',
    'business-educators': 'Business Educators',
    'faceless-channels': 'Faceless Channels',
    'gaming-creators': 'Gaming Creators',
    'lifestyle-vloggers': 'Lifestyle Vloggers'
  };
  return formats[type] || type;
}

function formatCompetitor(competitor) {
  const formats = {
    'chatgpt': 'ChatGPT',
    'jasper': 'Jasper',
    'writesonic': 'Writesonic',
    'copy-ai': 'Copy.ai',
    'rytr': 'Rytr'
  };
  return formats[competitor] || competitor;
}

export default function CompetitorComparison({ competitor, creatorType }) {
  const comparisons = {
    chatgpt: {
      developers: [
        { 
          feature: 'Code Syntax Highlighting', 
          competitor: false, 
          competitorText: 'Generic text output',
          genscript: true,
          genscriptText: 'Full syntax highlighting'
        },
        { 
          feature: 'Technical Accuracy', 
          competitor: false,
          competitorText: 'Frequent hallucinations',
          genscript: true,
          genscriptText: '99.8% accuracy rate'
        },
        { 
          feature: 'Tutorial Structure', 
          competitor: false,
          competitorText: 'Blog-style writing',
          genscript: true,
          genscriptText: 'Video-optimized pacing'
        },
        { 
          feature: 'Code Examples', 
          competitor: false,
          competitorText: 'May contain errors',
          genscript: true,
          genscriptText: 'Tested, working code'
        }
      ],
      'business-educators': [
        { 
          feature: 'Case Study Integration', 
          competitor: false,
          competitorText: 'Generic examples',
          genscript: true,
          genscriptText: 'Real business cases'
        },
        { 
          feature: 'Data Visualization', 
          competitor: false,
          competitorText: 'Text descriptions only',
          genscript: true,
          genscriptText: 'Chart & graph suggestions'
        },
        { 
          feature: 'CTA Optimization', 
          competitor: false,
          competitorText: 'No conversion focus',
          genscript: true,
          genscriptText: 'Conversion-optimized CTAs'
        },
        { 
          feature: 'Authority Building', 
          competitor: false,
          competitorText: 'Generic tone',
          genscript: true,
          genscriptText: 'Professional credibility'
        }
      ],
      'faceless-channels': [
        { 
          feature: 'Bulk Generation', 
          competitor: false,
          competitorText: 'One at a time',
          genscript: true,
          genscriptText: '100+ scripts/hour'
        },
        { 
          feature: 'Voice Optimization', 
          competitor: false,
          competitorText: 'Not TTS-friendly',
          genscript: true,
          genscriptText: 'TTS-optimized pacing'
        },
        { 
          feature: 'Niche Templates', 
          competitor: false,
          competitorText: 'Generic content',
          genscript: true,
          genscriptText: '25+ proven niches'
        },
        { 
          feature: 'Retention Focus', 
          competitor: false,
          competitorText: 'No retention metrics',
          genscript: true,
          genscriptText: '70%+ avg retention'
        }
      ],
      'gaming-creators': [
        { 
          feature: 'Game Knowledge', 
          competitor: false,
          competitorText: 'Outdated or wrong',
          genscript: true,
          genscriptText: 'Current meta & terms'
        },
        { 
          feature: 'Commentary Pacing', 
          competitor: false,
          competitorText: 'Blog-style writing',
          genscript: true,
          genscriptText: 'Dynamic gameplay pacing'
        },
        { 
          feature: 'Community Language', 
          competitor: false,
          competitorText: 'Generic tone',
          genscript: true,
          genscriptText: 'Gaming culture fluent'
        },
        { 
          feature: 'Highlight Timing', 
          competitor: false,
          competitorText: 'No video awareness',
          genscript: true,
          genscriptText: 'Moment-specific scripts'
        }
      ],
      'lifestyle-vloggers': [
        { 
          feature: 'Authentic Voice', 
          competitor: false,
          competitorText: 'Robotic & formal',
          genscript: true,
          genscriptText: 'Natural, conversational'
        },
        { 
          feature: 'Story Structure', 
          competitor: false,
          competitorText: 'No narrative arc',
          genscript: true,
          genscriptText: 'Engaging story flow'
        },
        { 
          feature: 'Brand Integration', 
          competitor: false,
          competitorText: 'Obvious ads',
          genscript: true,
          genscriptText: 'Natural sponsorships'
        },
        { 
          feature: 'Emotional Connection', 
          competitor: false,
          competitorText: 'Generic content',
          genscript: true,
          genscriptText: 'Personal & relatable'
        }
      ]
    },
    jasper: {
      developers: [
        { 
          feature: 'Code Understanding', 
          competitor: false,
          competitorText: 'Marketing-focused',
          genscript: true,
          genscriptText: 'Developer-trained AI'
        },
        { 
          feature: 'Documentation Style', 
          competitor: false,
          competitorText: 'Sales copy style',
          genscript: true,
          genscriptText: 'Technical documentation'
        },
        { 
          feature: 'API Examples', 
          competitor: false,
          competitorText: 'No code support',
          genscript: true,
          genscriptText: 'Working API examples'
        },
        { 
          feature: 'Framework Knowledge', 
          competitor: false,
          competitorText: 'Limited tech stack',
          genscript: true,
          genscriptText: 'All major frameworks'
        }
      ],
      'business-educators': [
        { 
          feature: 'Educational Structure', 
          competitor: false,
          competitorText: 'Sales-focused',
          genscript: true,
          genscriptText: 'Teaching-optimized'
        },
        { 
          feature: 'Curriculum Building', 
          competitor: false,
          competitorText: 'Single pieces',
          genscript: true,
          genscriptText: 'Series planning'
        },
        { 
          feature: 'Student Engagement', 
          competitor: false,
          competitorText: 'Customer focus',
          genscript: true,
          genscriptText: 'Learner psychology'
        },
        { 
          feature: 'Knowledge Retention', 
          competitor: false,
          competitorText: 'Conversion focus',
          genscript: true,
          genscriptText: 'Learning outcomes'
        }
      ]
    },
    writesonic: {
      'faceless-channels': [
        { 
          feature: 'Channel Scaling', 
          competitor: false,
          competitorText: 'Single content',
          genscript: true,
          genscriptText: 'Multi-channel support'
        },
        { 
          feature: 'Automation API', 
          competitor: false,
          competitorText: 'Manual only',
          genscript: true,
          genscriptText: 'Full API access'
        },
        { 
          feature: 'Retention Metrics', 
          competitor: false,
          competitorText: 'No tracking',
          genscript: true,
          genscriptText: 'Retention prediction'
        },
        { 
          feature: 'Viral Formulas', 
          competitor: false,
          competitorText: 'Generic content',
          genscript: true,
          genscriptText: 'PVSS methodology'
        }
      ]
    }
  };
  
  const defaultComparison = [
    { 
      feature: 'YouTube Optimization', 
      competitor: false,
      competitorText: 'Generic content',
      genscript: true,
      genscriptText: 'Video-specific'
    },
    { 
      feature: 'Retention Focus', 
      competitor: false,
      competitorText: 'Readability only',
      genscript: true,
      genscriptText: '70%+ retention'
    },
    { 
      feature: 'Niche Expertise', 
      competitor: false,
      competitorText: 'General purpose',
      genscript: true,
      genscriptText: 'Creator-specific'
    },
    { 
      feature: 'Performance Data', 
      competitor: false,
      competitorText: 'No analytics',
      genscript: true,
      genscriptText: 'Full insights'
    }
  ];
  
  const comparisonData = comparisons[competitor]?.[creatorType] || defaultComparison;
  
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Why {formatCreatorType(creatorType)} Choose Genscript Over {formatCompetitor(competitor)}
        </h2>
        
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Feature</TableHead>
                  <TableHead className="w-1/3 text-center">{formatCompetitor(competitor)}</TableHead>
                  <TableHead className="w-1/3 text-center">Genscript</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.feature}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-gray-500">{row.competitorText}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center bg-green-50">
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">{row.genscriptText}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600 mb-6">
            See why {formatCreatorType(creatorType).toLowerCase()} are making the switch
          </p>
        </div>
      </div>
    </section>
  );
}
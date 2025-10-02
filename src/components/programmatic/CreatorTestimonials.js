import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonialsByCreatorType = {
  developers: [
    { name: 'Alex Chen', role: 'Software Engineering Tutorials', quote: 'GenScript understands coding tutorials. My retention went from 45% to 72% in one month.', avatar: '👨‍💻' },
    { name: 'Sarah Kim', role: 'Web Development Channel', quote: 'Finally, an AI that formats code properly and explains complex concepts clearly.', avatar: '👩‍💻' }
  ],
  'business-educators': [
    { name: 'Michael Torres', role: 'Business Strategy Coach', quote: 'GenScript helped me convert 12% of viewers into paying customers with better structured content.', avatar: '👨‍💼' },
    { name: 'Jennifer Lee', role: 'Entrepreneurship Channel', quote: 'The case study integration feature transformed how I present business concepts.', avatar: '👩‍💼' }
  ],
  'faceless-channels': [
    { name: 'ContentKing', role: 'Faceless Automation', quote: 'Running 10 faceless channels profitably. GenScript saves me 20+ hours per week.', avatar: '🎭' },
    { name: 'AutomateLife', role: 'Faceless YouTube', quote: 'Increased RPM from $5 to $11 by using their retention-optimized scripts.', avatar: '🤖' }
  ],
  'gaming-creators': [
    { name: 'ProGamer Mike', role: 'Gaming Commentary', quote: 'My viewers say my commentary feels more natural and exciting since switching to GenScript.', avatar: '🎮' },
    { name: 'EsportsDaily', role: 'Gaming News', quote: 'Engagement is up 85%. GenScript nails the pacing for gaming content.', avatar: '👾' }
  ],
  'lifestyle-vloggers': [
    { name: 'Emma Lifestyle', role: 'Daily Vlogs', quote: 'GenScript keeps my authentic voice while making my vlogs more structured and engaging.', avatar: '✨' },
    { name: 'TravelWithDan', role: 'Travel & Lifestyle', quote: 'Landed 3 new sponsorships after showing brands my improved retention metrics.', avatar: '✈️' }
  ]
};

export default function CreatorTestimonials({ type }) {
  const testimonials = testimonialsByCreatorType[type] || testimonialsByCreatorType['developers'];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold mb-12 text-center">
          What Creators Like You Are Saying
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

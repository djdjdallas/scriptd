'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TestimonialCarousel({ testimonials, autoPlay = true }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
                {currentTestimonial.verified && (
                  <Badge variant="secondary" className="ml-2">
                    Verified Switcher
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">{currentTestimonial.name}</CardTitle>
              <CardDescription className="text-base">
                {currentTestimonial.channel} • {currentTestimonial.subscribers} subscribers
              </CardDescription>
            </div>
            <Quote className="w-8 h-8 text-purple-300 dark:text-purple-700" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg italic leading-relaxed">
            "{currentTestimonial.quote}"
          </p>
          
          {currentTestimonial.metrics && (
            <div className="mt-6 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="text-sm font-medium mb-2">Results after switching:</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {currentTestimonial.metrics.retention && (
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {currentTestimonial.metrics.retention}%
                    </div>
                    <div className="text-xs text-muted-foreground">Retention</div>
                  </div>
                )}
                {currentTestimonial.metrics.growth && (
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {currentTestimonial.metrics.growth}x
                    </div>
                    <div className="text-xs text-muted-foreground">Growth</div>
                  </div>
                )}
                {currentTestimonial.metrics.timeframe && (
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {currentTestimonial.metrics.timeframe}
                    </div>
                    <div className="text-xs text-muted-foreground">Timeframe</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {testimonials.length > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevTestimonial}
            className="hover:bg-purple-100 dark:hover:bg-purple-900/20"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'w-8 bg-purple-600' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextTestimonial}
            className="hover:bg-purple-100 dark:hover:bg-purple-900/20"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
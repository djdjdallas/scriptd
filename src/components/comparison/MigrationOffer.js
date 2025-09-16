'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Clock, Gift } from 'lucide-react';

export default function MigrationOffer({ 
  competitor, 
  discount, 
  duration, 
  features, 
  onClaim,
  urgency = true 
}) {
  return (
    <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
      <CardContent className="p-8">
        {urgency && (
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Clock className="w-4 h-4 mr-1" />
            LIMITED TIME OFFER
          </Badge>
        )}
        
        <h3 className="text-2xl font-bold mb-4">
          Switching from {competitor}? Get {discount}% Off for {duration} Months
        </h3>
        
        <p className="text-lg mb-6 opacity-90">
          Plus exclusive migration benefits to make switching seamless
        </p>
        
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Migration Benefits:
              </h4>
              <ul className="space-y-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">Your Savings:</h4>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm opacity-75">Regular Price</div>
                  <div className="text-xl font-bold line-through opacity-50">$49/mo</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm opacity-75">Your Price</div>
                  <div className="text-2xl font-bold text-yellow-300">
                    ${(49 * (1 - discount / 100)).toFixed(2)}/mo
                  </div>
                  <div className="text-xs opacity-75">For {duration} months</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            variant="secondary"
            onClick={onClaim}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            Claim Your {discount}% Discount
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
          >
            Talk to Migration Team
          </Button>
        </div>
        
        {urgency && (
          <p className="text-center text-sm mt-4 opacity-75">
            Offer expires in 48 hours • No credit card required to start
          </p>
        )}
      </CardContent>
    </Card>
  );
}
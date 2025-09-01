import { BetaSignupForm } from '@/components/beta/beta-signup-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Sparkles, 
  Clock, 
  Users, 
  Gift, 
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  Shield
} from 'lucide-react';

export const metadata = {
  title: 'Join the Beta - Subscribr | AI-Powered YouTube Content Creation',
  description: 'Be among the first to experience the future of YouTube content creation. Get 3 months free access and help shape our platform.',
};

export default function BetaPage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-purple-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 px-4 py-1">
            <Sparkles className="mr-2 h-3 w-3" />
            Limited Beta Access
          </Badge>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Join the Subscribr Beta Program
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Be among the first 25 creators to experience AI-powered YouTube content creation. 
            Get exclusive access, shape the product, and save 15+ hours per video.
          </p>

          {/* Key Benefits */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 text-sm">
              <Gift className="h-5 w-5 text-primary" />
              <span className="font-semibold">3 Months Free Access</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">Only 25 Spots Available</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold">Early Access Features</span>
            </div>
          </div>
        </div>

        {/* Beta Benefits Grid */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-12">What Beta Testers Get</h2>
          
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Gift className="h-6 w-6 text-primary-foreground" />
                </div>
                3 Months Free Professional Plan
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Get our $69/month Professional plan absolutely free for 3 months. That&apos;s 900 credits to create amazing content.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                Early Access to New Features
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Be the first to try cutting-edge AI features before public release. Your feedback directly shapes development.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                Direct Access to Founders
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Join exclusive feedback sessions, influence the roadmap, and get priority support from our founding team.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                Lifetime Beta Pricing
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Lock in special beta pricing forever. Even after the beta ends, you&apos;ll keep your discounted rate.
              </dd>
            </div>
          </dl>
        </div>

        {/* Who We're Looking For */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24">
          <div className="rounded-2xl bg-muted/50 p-8">
            <h2 className="text-2xl font-bold mb-6">Perfect for Growing Creators</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">We&apos;re looking for YouTube creators who:</p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Have 50K-200K subscribers and want to scale faster</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Spend 20+ hours per video and need to optimize their workflow</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Create educational, tech, gaming, or lifestyle content</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Are excited about AI and willing to provide feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Want to be part of shaping the future of content creation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24">
          <BetaSignupForm />
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold mb-2">When does the beta program start?</h3>
              <p className="text-muted-foreground">
                We&apos;re launching with our first beta users in the next 7-10 days. Selected creators will receive an email with setup instructions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What happens after the 3-month free period?</h3>
              <p className="text-muted-foreground">
                You&apos;ll have the option to continue at a special beta discount or downgrade to our free plan. No credit card required during beta.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How much time commitment is expected?</h3>
              <p className="text-muted-foreground">
                We ask for just 30 minutes per week for feedback calls and testing new features. Your regular content creation will save you 15+ hours per video.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I share about being in the beta?</h3>
              <p className="text-muted-foreground">
                Absolutely! We encourage you to share your experience. We&apos;ll even provide co-marketing opportunities if you&apos;re interested.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto mt-16 max-w-2xl text-center sm:mt-20 lg:mt-24">
          <div className="rounded-2xl bg-primary/10 p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Content Creation?</h2>
            <p className="text-muted-foreground mb-6">
              Join 25 forward-thinking creators who are embracing AI to create better content, faster.
            </p>
            <Button size="lg" className="font-semibold" asChild>
              <Link href="#beta-form">
                Apply for Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-purple-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  );
}
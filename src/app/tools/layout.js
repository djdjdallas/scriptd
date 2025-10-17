// Tools Layout - Public layout for free tools

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Free YouTube Tools | AI-Powered Creator Tools for YouTube Success',
  description: 'Access 11 free YouTube creator tools: title generator, hook generator, transcript extractor, idea generator, hashtag generator, thumbnail ideas, and more. AI-powered tools to grow your YouTube channel faster.',
  keywords: 'youtube tools, youtube title generator, hook generator, transcript extractor, video idea generator, hashtag generator, youtube creator tools, ai youtube tools, free youtube tools, faceless youtube, retention optimizer, pvss framework, voice matching ai',
  openGraph: {
    title: 'Free YouTube Tools | 11 AI-Powered Creator Tools',
    description: 'Grow your YouTube channel with free AI tools: title generator, hook generator, transcript extractor, and more. Used by 50,000+ creators worldwide.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free YouTube Tools | 11 AI-Powered Creator Tools',
    description: 'Access 11 free YouTube creator tools to grow your channel faster. Title generator, hook generator, and more.',
  }
};

export default function ToolsLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GenScript</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/tools" className="text-sm font-medium hover:text-primary">
              Free Tools
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Button asChild size="sm">
              <Link href="/sign-up">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {children}
      </main>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Amazing YouTube Scripts?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators using GenScript to generate engaging scripts with AI
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/demo">
                Watch Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 GenScript. All rights reserved.
            </p>
            <nav className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
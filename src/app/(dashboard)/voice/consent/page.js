import { VoiceConsentForm } from '@/components/voice/voice-consent-form';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Voice Cloning Consent Form - GenScript',
  description: 'Generate a voice cloning consent agreement for ethical AI voice use',
};

export default function VoiceConsentPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/voice">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Voice Profiles
          </Button>
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Voice Cloning Consent</h1>
        </div>
        
        <p className="text-muted-foreground">
          Ensure ethical use of voice cloning technology by obtaining proper consent. This form generator helps you create 
          a comprehensive agreement that protects both voice owners and content creators.
        </p>
      </div>

      <VoiceConsentForm />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Why Consent Matters</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Protects voice owners&apos; rights and privacy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Ensures compliance with biometric data laws</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Builds trust with collaborators and audience</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Prevents legal disputes and platform violations</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Best Practices</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Always get written consent before cloning any voice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Be transparent about how the voice will be used</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Include clear start and end dates when applicable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Keep signed copies for your records</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-center">
          Need to review our voice cloning policies? Read our{' '}
          <Link href="/terms-voice-cloning" className="text-primary hover:underline">
            Voice Cloning Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export function VoiceConsentForm() {
  const [formData, setFormData] = useState({
    voiceOwnerName: '',
    voiceOwnerEmail: '',
    granteeName: '',
    granteeCompany: '',
    purpose: '',
    startDate: new Date(),
    endDate: null,
    limitations: '',
  });
  const [copied, setCopied] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateConsentText = () => {
    const { voiceOwnerName, granteeName, granteeCompany, purpose, startDate, endDate, limitations } = formData;
    
    return `VOICE CLONING CONSENT AGREEMENT

This agreement is entered into on ${format(new Date(), 'MMMM d, yyyy')} between:

Voice Owner: ${voiceOwnerName || '[Voice Owner Name]'}
Grantee: ${granteeName || '[Your Name]'}${granteeCompany ? ` representing ${granteeCompany}` : ''}

I, ${voiceOwnerName || '[Voice Owner Name]'}, hereby grant ${granteeName || '[Your Name]'}${granteeCompany ? ` of ${granteeCompany}` : ''} permission to create a digital voice profile of my voice using GenScript's voice cloning technology.

PURPOSE OF USE:
${purpose || '[Describe how the voice will be used - e.g., YouTube video narration, educational content, etc.]'}

TERMS:
1. This voice profile will be used exclusively for the purposes stated above.
2. The grantee agrees to clearly disclose the use of AI-generated voice in any content created.
3. The voice profile will not be used for deceptive, harmful, or illegal purposes.
4. The voice owner retains all rights to their voice and vocal characteristics.

DURATION:
This consent is valid from ${format(startDate, 'MMMM d, yyyy')} ${endDate ? `to ${format(endDate, 'MMMM d, yyyy')}` : 'until revoked in writing'}.

${limitations ? `ADDITIONAL LIMITATIONS:
${limitations}

` : ''}REVOCATION:
This consent may be revoked at any time by written notice to the grantee. Upon revocation, the grantee must cease using the voice profile and delete all associated data within 30 days.

ACKNOWLEDGMENT:
By signing below, both parties acknowledge they have read, understood, and agree to the terms of this consent agreement.

_________________________               _________________________
${voiceOwnerName || '[Voice Owner Name]'}                    Date
Voice Owner

_________________________               _________________________
${granteeName || '[Grantee Name]'}                          Date
Grantee`;
  };

  const copyToClipboard = async () => {
    const consentText = generateConsentText();
    try {
      await navigator.clipboard.writeText(consentText);
      setCopied(true);
      toast.success('Consent form copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadAsText = () => {
    const consentText = generateConsentText();
    const blob = new Blob([consentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-consent-${formData.voiceOwnerName || 'form'}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Consent form downloaded!');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Voice Cloning Consent Form Generator</CardTitle>
        <CardDescription>
          Generate a legally compliant consent form for voice cloning. Fill in the details below to create a customized agreement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="voiceOwnerName">Voice Owner Name *</Label>
            <Input
              id="voiceOwnerName"
              value={formData.voiceOwnerName}
              onChange={(e) => handleInputChange('voiceOwnerName', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="voiceOwnerEmail">Voice Owner Email</Label>
            <Input
              id="voiceOwnerEmail"
              type="email"
              value={formData.voiceOwnerEmail}
              onChange={(e) => handleInputChange('voiceOwnerEmail', e.target.value)}
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="granteeName">Your Name *</Label>
            <Input
              id="granteeName"
              value={formData.granteeName}
              onChange={(e) => handleInputChange('granteeName', e.target.value)}
              placeholder="Jane Smith"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="granteeCompany">Your Company (Optional)</Label>
            <Input
              id="granteeCompany"
              value={formData.granteeCompany}
              onChange={(e) => handleInputChange('granteeCompany', e.target.value)}
              placeholder="Creative Studios LLC"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose of Voice Use *</Label>
          <Textarea
            id="purpose"
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            placeholder="Describe how the voice will be used (e.g., YouTube educational videos about technology, podcast narration, etc.)"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => handleInputChange('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? format(formData.endDate, "PPP") : "No end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => handleInputChange('endDate', date)}
                  disabled={(date) => date < formData.startDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="limitations">Additional Limitations (Optional)</Label>
          <Textarea
            id="limitations"
            value={formData.limitations}
            onChange={(e) => handleInputChange('limitations', e.target.value)}
            placeholder="Any specific restrictions or conditions (e.g., Not for commercial use, Only for educational content, etc.)"
            rows={2}
          />
        </div>

        <div className="border-t pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {generateConsentText()}
              </pre>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={copyToClipboard} variant="outline" className="flex-1">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button onClick={downloadAsText} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download as Text
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Important:</strong> This is a template consent form. We recommend having it reviewed by legal counsel 
            before use. Both parties should sign and date the agreement, and keep copies for their records.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
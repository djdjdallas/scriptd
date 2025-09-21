'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Wand2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function FixRemixVoiceProfilesPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/channels/remix/fix-voice-profiles');
      if (!response.ok) throw new Error('Failed to check status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Status check error:', error);
      toast.error('Failed to check status');
    }
  };

  const runFix = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // First check status
      await checkStatus();
      
      // Run the fix
      const response = await fetch('/api/channels/remix/fix-voice-profiles', {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fix voice profiles');
      }
      
      const data = await response.json();
      setResult(data);
      
      if (data.fixed > 0) {
        toast.success(`Successfully created ${data.fixed} voice profile(s)!`);
      } else {
        toast.info('All remix channels already have voice profiles');
      }
      
      // Refresh status
      await checkStatus();
      
    } catch (error) {
      console.error('Fix error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-6">Fix Remix Voice Profiles</h1>
      
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">About this tool</h2>
              <p className="text-gray-400 text-sm">
                This tool creates voice profile entries for existing remix channels. 
                Run this if you created a remix channel but don't see its voice profile 
                in the voice training page or script creation dropdown.
              </p>
            </div>
          </div>

          {status && (
            <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
              <h3 className="text-white font-medium mb-3">Current Status:</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Remix Channels</p>
                  <p className="text-white text-xl font-semibold">{status.remixChannels}</p>
                </div>
                <div>
                  <p className="text-gray-500">Voice Profiles</p>
                  <p className="text-white text-xl font-semibold">{status.voiceProfiles}</p>
                </div>
                <div>
                  <p className="text-gray-500">Need Fix</p>
                  <p className={`text-xl font-semibold ${status.needsFix > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {status.needsFix}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result && result.success && (
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-green-400 font-medium">{result.message}</p>
                  {result.profiles && result.profiles.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Created profiles:</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {result.profiles.map(profile => (
                          <li key={profile.id} className="ml-4">
                            • {profile.profile_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={checkStatus}
              variant="outline"
              disabled={loading}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              Check Status
            </Button>
            
            <Button
              onClick={runFix}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Fix Voice Profiles
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          After running this fix, check your{' '}
          <a href="/voice" className="text-purple-400 hover:text-purple-300 underline">
            Voice Training
          </a>{' '}
          page or create a new{' '}
          <a href="/scripts/create" className="text-purple-400 hover:text-purple-300 underline">
            Script
          </a>{' '}
          to see your remix voice profiles.
        </p>
      </div>
    </div>
  );
}
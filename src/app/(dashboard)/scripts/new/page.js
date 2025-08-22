'use client';

import { useState, useEffect } from 'react';
import { ScriptWizard } from '@/components/script-builder/script-wizard';
import { Loader2 } from 'lucide-react';

export default function NewScriptPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    credits: 0,
    channels: [],
    voiceProfiles: []
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user credits and related data
      const [userResponse, channelsResponse, voiceResponse] = await Promise.all([
        fetch('/api/user/preferences'),
        fetch('/api/channels'),
        fetch('/api/voice/profiles')
      ]);

      const userData = await userResponse.json();
      const channelsData = await channelsResponse.json();
      const voiceData = await voiceResponse.json();

      setUserData({
        credits: userData.credits || 0,
        channels: channelsData.channels || [],
        voiceProfiles: voiceData.profiles || []
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ScriptWizard 
        channels={userData.channels}
        voiceProfiles={userData.voiceProfiles}
        userCredits={userData.credits}
      />
    </div>
  );
}
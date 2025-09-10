'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TeamCreationForm from '@/components/teams/team-creation-form';
import { createClient } from '@/lib/supabase/client';

export default function CreateTeamPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/auth/signin');
        return;
      }
      setUser(user);
      setIsLoading(false);
    };

    getCurrentUser();
  }, [router]);

  const handleCancel = () => {
    router.push('/teams');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={handleCancel}
          className="mb-4 p-0 h-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create a New Team
          </h1>
          <p className="text-gray-600">
            Set up a collaborative workspace for your YouTube scripts
          </p>
        </div>
      </div>

      {/* Team Creation Form */}
      <div className="flex justify-center">
        <TeamCreationForm 
          userId={user?.id} 
          onCancel={handleCancel}
        />
      </div>

      {/* Additional Info */}
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Team Management Features
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Role-Based Access</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Owner: Full team control</li>
                <li>• Admin: Manage members & settings</li>
                <li>• Editor: Create & edit scripts</li>
                <li>• Viewer: Read-only access</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Collaboration Tools</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Email invitations</li>
                <li>• Activity tracking</li>
                <li>• Script sharing</li>
                <li>• Team analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
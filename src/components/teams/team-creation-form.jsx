'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, ArrowLeft } from 'lucide-react';
import { createTeam } from '@/lib/teams/team-service-client';

export default function TeamCreationForm({ userId, onCancel }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    if (formData.name.length < 2) {
      setError('Team name must be at least 2 characters long');
      return;
    }

    if (formData.name.length > 50) {
      setError('Team name must be less than 50 characters');
      return;
    }

    if (formData.description.length > 200) {
      setError('Description must be less than 200 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: team, error: createError } = await createTeam({
        name: formData.name.trim(),
        description: formData.description.trim(),
        ownerId: userId,
        isServerSide: false,
      });

      if (createError) {
        throw new Error(createError);
      }

      // Redirect to the new team's dashboard
      router.push(`/teams/${team.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Create New Team</CardTitle>
        <p className="text-sm text-gray-600">
          Start collaborating with your team members on YouTube scripts
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter team name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={50}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              {formData.name.length}/50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your team's purpose (optional)"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={200}
              rows={3}
              className="w-full resize-none"
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/200 characters
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Team
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            What happens next?
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• You'll become the team owner with full permissions</li>
            <li>• You can invite team members via email</li>
            <li>• Team members can collaborate on scripts</li>
            <li>• You can manage roles and permissions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
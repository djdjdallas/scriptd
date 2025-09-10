'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  User,
  Camera,
  Briefcase,
  Home,
  Building,
  Sparkles,
  Upload
} from 'lucide-react';

export function ProfileStep({ userData, onComplete }) {
  const [profile, setProfile] = useState({
    name: userData?.name || '',
    bio: userData?.bio || '',
    avatar_url: userData?.avatar_url || '',
    user_type: userData?.user_type || '',
    experience_level: userData?.experience_level || ''
  });

  const [loading, setLoading] = useState(false);

  const userTypes = [
    {
      value: 'creator',
      label: 'Content Creator',
      description: 'Individual YouTube creator',
      icon: User
    },
    {
      value: 'agency',
      label: 'Agency',
      description: 'Managing multiple channels',
      icon: Building
    },
    {
      value: 'business',
      label: 'Business',
      description: 'Brand or company channel',
      icon: Briefcase
    },
    {
      value: 'hobbyist',
      label: 'Hobbyist',
      description: 'Creating for fun',
      icon: Home
    }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: '1-2 years experience' },
    { value: 'advanced', label: 'Advanced', description: '3+ years experience' },
    { value: 'expert', label: 'Expert', description: 'Professional creator' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profile.name || !profile.user_type || !profile.experience_level) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onComplete(profile);
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to storage
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);
      setProfile({ ...profile, avatar_url: url });
      toast.success('Avatar updated!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
        <p className="text-gray-400">Tell us about yourself to personalize your experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-purple-500/20 text-purple-400 text-2xl">
                {profile.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors"
            >
              <Camera className="h-4 w-4 text-white" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-400">Upload your profile picture</p>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Full Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="John Doe"
            className="glass-input"
            required
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-white">
            Bio
            <span className="text-sm text-gray-400 ml-2">(Optional)</span>
          </Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell us about your content and goals..."
            className="glass-input min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-gray-500">
            {profile.bio.length}/500 characters
          </p>
        </div>

        {/* User Type */}
        <div className="space-y-3">
          <Label className="text-white">
            I am a <span className="text-red-400">*</span>
          </Label>
          <RadioGroup
            value={profile.user_type}
            onValueChange={(value) => setProfile({ ...profile, user_type: value })}
          >
            <div className="grid grid-cols-2 gap-3">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.value}
                    htmlFor={`type-${type.value}`}
                    className={`
                      glass rounded-lg p-4 cursor-pointer transition-all
                      ${profile.user_type === type.value ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/10'}
                    `}
                  >
                    <RadioGroupItem
                      value={type.value}
                      id={`type-${type.value}`}
                      className="hidden"
                    />
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">{type.label}</p>
                        <p className="text-xs text-gray-400 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <Label className="text-white">
            Experience Level <span className="text-red-400">*</span>
          </Label>
          <RadioGroup
            value={profile.experience_level}
            onValueChange={(value) => setProfile({ ...profile, experience_level: value })}
          >
            <div className="space-y-2">
              {experienceLevels.map((level) => (
                <label
                  key={level.value}
                  htmlFor={`exp-${level.value}`}
                  className={`
                    glass rounded-lg p-3 cursor-pointer transition-all flex items-center
                    ${profile.experience_level === level.value ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/10'}
                  `}
                >
                  <RadioGroupItem
                    value={level.value}
                    id={`exp-${level.value}`}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{level.label}</p>
                    <p className="text-xs text-gray-400">{level.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !profile.name || !profile.user_type || !profile.experience_level}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
        >
          {loading ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Saving Profile...
            </>
          ) : (
            'Save & Continue'
          )}
        </Button>
      </form>
    </div>
  );
}
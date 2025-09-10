'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Heart,
  Award,
  Calendar,
  Clock,
  Zap
} from 'lucide-react';

export function GoalsStep({ userData, onComplete }) {
  const [goals, setGoals] = useState({
    primary_goal: userData?.content_goals?.primary || '',
    secondary_goals: userData?.content_goals?.secondary || [],
    upload_frequency: userData?.upload_frequency || '',
    target_views: userData?.content_goals?.target_views || 10000,
    audience_age: userData?.target_audience?.age || [],
    audience_interests: userData?.target_audience?.interests || []
  });

  const primaryGoals = [
    { value: 'growth', label: 'Grow Subscribers', icon: TrendingUp, color: 'text-green-400' },
    { value: 'monetization', label: 'Increase Revenue', icon: DollarSign, color: 'text-yellow-400' },
    { value: 'engagement', label: 'Boost Engagement', icon: Heart, color: 'text-pink-400' },
    { value: 'brand', label: 'Build Brand', icon: Award, color: 'text-purple-400' }
  ];

  const uploadFrequencies = [
    { value: 'daily', label: 'Daily', description: '7 videos/week' },
    { value: 'weekly', label: 'Weekly', description: '1-2 videos/week' },
    { value: 'biweekly', label: 'Bi-weekly', description: '2-3 videos/month' },
    { value: 'monthly', label: 'Monthly', description: '1 video/month' },
    { value: 'irregular', label: 'Irregular', description: 'When inspired' }
  ];

  const audienceAges = [
    '13-17',
    '18-24',
    '25-34',
    '35-44',
    '45-54',
    '55+'
  ];

  const audienceInterests = [
    'Gaming',
    'Tech',
    'Education',
    'Entertainment',
    'Lifestyle',
    'Business',
    'Music',
    'Sports',
    'Food',
    'Travel',
    'Fashion',
    'Health'
  ];

  const handleSubmit = async () => {
    if (!goals.primary_goal || !goals.upload_frequency || goals.audience_age.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      await onComplete({
        content_goals: {
          primary: goals.primary_goal,
          secondary: goals.secondary_goals,
          target_views: goals.target_views
        },
        upload_frequency: goals.upload_frequency,
        target_audience: {
          age: goals.audience_age,
          interests: goals.audience_interests
        }
      });
    } catch (error) {
      toast.error('Failed to save goals');
    }
  };

  const toggleSecondaryGoal = (goal) => {
    if (goals.secondary_goals.includes(goal)) {
      setGoals({
        ...goals,
        secondary_goals: goals.secondary_goals.filter(g => g !== goal)
      });
    } else {
      setGoals({
        ...goals,
        secondary_goals: [...goals.secondary_goals, goal]
      });
    }
  };

  const toggleAudienceAge = (age) => {
    if (goals.audience_age.includes(age)) {
      setGoals({
        ...goals,
        audience_age: goals.audience_age.filter(a => a !== age)
      });
    } else {
      setGoals({
        ...goals,
        audience_age: [...goals.audience_age, age]
      });
    }
  };

  const toggleInterest = (interest) => {
    if (goals.audience_interests.includes(interest)) {
      setGoals({
        ...goals,
        audience_interests: goals.audience_interests.filter(i => i !== interest)
      });
    } else {
      setGoals({
        ...goals,
        audience_interests: [...goals.audience_interests, interest]
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Define Your Goals</h2>
        <p className="text-gray-400">Help us understand what you want to achieve</p>
      </div>

      {/* Primary Goal */}
      <div className="space-y-3">
        <Label className="text-white">
          Primary Goal <span className="text-red-400">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {primaryGoals.map((goal) => {
            const Icon = goal.icon;
            return (
              <button
                key={goal.value}
                onClick={() => setGoals({ ...goals, primary_goal: goal.value })}
                className={`
                  glass rounded-lg p-4 text-left transition-all
                  ${goals.primary_goal === goal.value ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/10'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${goal.color}`} />
                  <span className="text-white font-medium">{goal.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Goals */}
      <div className="space-y-3">
        <Label className="text-white">
          Secondary Goals
          <span className="text-sm text-gray-400 ml-2">(Select all that apply)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {primaryGoals
            .filter(g => g.value !== goals.primary_goal)
            .map((goal) => (
              <Badge
                key={goal.value}
                variant={goals.secondary_goals.includes(goal.value) ? 'default' : 'outline'}
                className="cursor-pointer py-1.5 px-3"
                onClick={() => toggleSecondaryGoal(goal.value)}
              >
                {goal.label}
              </Badge>
            ))}
        </div>
      </div>

      {/* Upload Frequency */}
      <div className="space-y-3">
        <Label className="text-white">
          Upload Frequency <span className="text-red-400">*</span>
        </Label>
        <RadioGroup
          value={goals.upload_frequency}
          onValueChange={(value) => setGoals({ ...goals, upload_frequency: value })}
        >
          <div className="grid grid-cols-2 gap-2">
            {uploadFrequencies.map((freq) => (
              <label
                key={freq.value}
                htmlFor={`freq-${freq.value}`}
                className={`
                  glass rounded-lg p-3 cursor-pointer transition-all flex items-center
                  ${goals.upload_frequency === freq.value ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/10'}
                `}
              >
                <RadioGroupItem
                  value={freq.value}
                  id={`freq-${freq.value}`}
                  className="mr-3"
                />
                <div>
                  <p className="text-white font-medium">{freq.label}</p>
                  <p className="text-xs text-gray-400">{freq.description}</p>
                </div>
              </label>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Target Views */}
      <div className="space-y-3">
        <Label className="text-white">
          Target Views per Video
        </Label>
        <div className="glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400">Current target:</span>
            <span className="text-2xl font-bold text-white">
              {goals.target_views.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[goals.target_views]}
            onValueChange={([value]) => setGoals({ ...goals, target_views: value })}
            min={1000}
            max={1000000}
            step={1000}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1K</span>
            <span>500K</span>
            <span>1M</span>
          </div>
        </div>
      </div>

      {/* Target Audience Age */}
      <div className="space-y-3">
        <Label className="text-white">
          Target Audience Age <span className="text-red-400">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {audienceAges.map((age) => (
            <Badge
              key={age}
              variant={goals.audience_age.includes(age) ? 'default' : 'outline'}
              className="cursor-pointer py-1.5 px-3"
              onClick={() => toggleAudienceAge(age)}
            >
              {age}
            </Badge>
          ))}
        </div>
      </div>

      {/* Audience Interests */}
      <div className="space-y-3">
        <Label className="text-white">
          Audience Interests
          <span className="text-sm text-gray-400 ml-2">(Select relevant topics)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {audienceInterests.map((interest) => (
            <Badge
              key={interest}
              variant={goals.audience_interests.includes(interest) ? 'default' : 'outline'}
              className="cursor-pointer py-1.5 px-3"
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!goals.primary_goal || !goals.upload_frequency || goals.audience_age.length === 0}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
      >
        Save Goals & Continue
      </Button>
    </div>
  );
}
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
  TrendingUp,
  DollarSign,
  Users,
  Heart,
  Award,
  Calendar,
  Clock,
  Zap,
  ArrowRight,
  AlertCircle
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

  const isFormValid = goals.primary_goal && goals.upload_frequency && goals.audience_age.length > 0;
  const completedFields = [
    !!goals.primary_goal,
    !!goals.upload_frequency,
    goals.audience_age.length > 0
  ].filter(Boolean).length;
  const totalRequiredFields = 3;

  return (
    <div className="space-y-8">
      {/* Header with Progress */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="glass rounded-full px-4 py-2">
            <span className="text-sm text-gray-400">
              {completedFields} of {totalRequiredFields} required fields completed
            </span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white">Define Your Content Goals</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Help us personalize your experience and provide better recommendations for your content strategy
        </p>
      </div>

      {/* Primary Goal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-white text-lg font-semibold">
            Primary Goal <span className="text-red-400">*</span>
          </Label>
          {goals.primary_goal && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Zap className="h-3 w-3 mr-1" />
              Selected
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-400">
          What's your main objective? This will help us tailor AI suggestions to your needs.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {primaryGoals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = goals.primary_goal === goal.value;
            return (
              <button
                key={goal.value}
                onClick={() => setGoals({ ...goals, primary_goal: goal.value })}
                className={`
                  glass rounded-xl p-5 text-left transition-all transform hover:scale-105
                  ${isSelected ? 'ring-2 ring-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20' : 'hover:bg-white/10'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${isSelected ? 'bg-purple-500/20' : 'bg-white/5'} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${goal.color}`} />
                  </div>
                  <div className="flex-1">
                    <span className="text-white font-semibold block mb-1">{goal.label}</span>
                    {isSelected && (
                      <span className="text-xs text-purple-400">Primary goal</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Goals */}
      <div className="space-y-4">
        <Label className="text-white text-lg font-semibold">
          Secondary Goals
          <span className="text-sm text-gray-400 ml-2 font-normal">(Optional - Select all that apply)</span>
        </Label>
        <p className="text-sm text-gray-400">
          Choose additional objectives to help us provide more comprehensive recommendations.
        </p>
        <div className="flex flex-wrap gap-3">
          {primaryGoals
            .filter(g => g.value !== goals.primary_goal)
            .map((goal) => {
              const isSelected = goals.secondary_goals.includes(goal.value);
              return (
                <Badge
                  key={goal.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`
                    cursor-pointer py-2 px-4 transition-all hover:scale-105 text-sm
                    ${isSelected ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'text-gray-300 hover:bg-white/10 hover:text-white'}
                  `}
                  onClick={() => toggleSecondaryGoal(goal.value)}
                >
                  {isSelected && <Zap className="h-3 w-3 mr-1 inline" />}
                  {goal.label}
                </Badge>
              );
            })}
        </div>
      </div>

      {/* Upload Frequency */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-white text-lg font-semibold">
            Upload Frequency <span className="text-red-400">*</span>
          </Label>
          {goals.upload_frequency && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Calendar className="h-3 w-3 mr-1" />
              Selected
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-400">
          How often do you plan to publish content? This helps us pace your content pipeline.
        </p>
        <RadioGroup
          value={goals.upload_frequency}
          onValueChange={(value) => setGoals({ ...goals, upload_frequency: value })}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadFrequencies.map((freq) => {
              const isSelected = goals.upload_frequency === freq.value;
              return (
                <label
                  key={freq.value}
                  htmlFor={`freq-${freq.value}`}
                  className={`
                    glass rounded-xl p-4 cursor-pointer transition-all flex items-start hover:scale-105
                    ${isSelected ? 'ring-2 ring-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20' : 'hover:bg-white/10'}
                  `}
                >
                  <RadioGroupItem
                    value={freq.value}
                    id={`freq-${freq.value}`}
                    className="mr-3 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-0.5">{freq.label}</p>
                    <p className="text-xs text-gray-400">{freq.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Target Views */}
      <div className="space-y-4">
        <Label className="text-white text-lg font-semibold">
          Target Views per Video
          <span className="text-sm text-gray-400 ml-2 font-normal">(Optional)</span>
        </Label>
        <p className="text-sm text-gray-400">
          Set a realistic viewership goal to help us track your progress and suggest optimization strategies.
        </p>
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Your target:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {goals.target_views.toLocaleString()}
              </span>
              <span className="text-gray-400 text-sm">views</span>
            </div>
          </div>
          <Slider
            value={[goals.target_views]}
            onValueChange={([value]) => setGoals({ ...goals, target_views: value })}
            min={1000}
            max={1000000}
            step={5000}
            className="mb-3"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1K</span>
            <span>250K</span>
            <span>500K</span>
            <span>1M</span>
          </div>
        </div>
      </div>

      {/* Target Audience Age */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-white text-lg font-semibold">
            Target Audience Age <span className="text-red-400">*</span>
          </Label>
          {goals.audience_age.length > 0 && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Users className="h-3 w-3 mr-1" />
              {goals.audience_age.length} selected
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-400">
          Select the age groups you want to reach. This helps us tailor content tone and topics.
        </p>
        <div className="flex flex-wrap gap-3">
          {audienceAges.map((age) => {
            const isSelected = goals.audience_age.includes(age);
            return (
              <Badge
                key={age}
                variant={isSelected ? 'default' : 'outline'}
                className={`
                  cursor-pointer py-2 px-4 transition-all hover:scale-105 text-sm
                  ${isSelected ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'text-gray-300 hover:bg-white/10 hover:text-white'}
                `}
                onClick={() => toggleAudienceAge(age)}
              >
                {isSelected && <Zap className="h-3 w-3 mr-1 inline" />}
                {age}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Audience Interests */}
      <div className="space-y-4">
        <Label className="text-white text-lg font-semibold">
          Audience Interests
          <span className="text-sm text-gray-400 ml-2 font-normal">(Optional - Select relevant topics)</span>
        </Label>
        <p className="text-sm text-gray-400">
          What topics interest your audience? This helps us generate more relevant content ideas.
        </p>
        <div className="flex flex-wrap gap-3">
          {audienceInterests.map((interest) => {
            const isSelected = goals.audience_interests.includes(interest);
            return (
              <Badge
                key={interest}
                variant={isSelected ? 'default' : 'outline'}
                className={`
                  cursor-pointer py-2 px-4 transition-all hover:scale-105 text-sm
                  ${isSelected ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'text-gray-300 hover:bg-white/10 hover:text-white'}
                `}
                onClick={() => toggleInterest(interest)}
              >
                {isSelected && <Zap className="h-3 w-3 mr-1 inline" />}
                {interest}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4">
        {!isFormValid && (
          <div className="glass rounded-lg p-3 mb-4 border border-yellow-500/20">
            <p className="text-sm text-yellow-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Please complete all required fields before continuing
            </p>
          </div>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed py-6 text-lg"
        >
          {isFormValid ? (
            <>
              Save Goals & Continue
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          ) : (
            'Complete Required Fields'
          )}
        </Button>
      </div>
    </div>
  );
}
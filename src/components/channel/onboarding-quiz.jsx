'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Target, User, Calendar, Video, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const questions = [
  {
    id: 'goal',
    icon: Target,
    iconColor: 'text-purple-400',
    bgColor: 'from-purple-500/20',
    question: 'What is your primary goal with YouTube?',
    options: [
      { value: 'grow-audience', label: 'Grow my audience and reach' },
      { value: 'monetization', label: 'Increase monetization and revenue' },
      { value: 'engagement', label: 'Improve audience engagement' },
      { value: 'content-quality', label: 'Create better content' },
    ],
  },
  {
    id: 'experience',
    icon: User,
    iconColor: 'text-blue-400',
    bgColor: 'from-blue-500/20',
    question: 'How long have you been creating content?',
    options: [
      { value: 'beginner', label: 'Less than 6 months' },
      { value: 'intermediate', label: '6 months to 2 years' },
      { value: 'experienced', label: '2-5 years' },
      { value: 'veteran', label: 'More than 5 years' },
    ],
  },
  {
    id: 'upload-frequency',
    icon: Calendar,
    iconColor: 'text-green-400',
    bgColor: 'from-green-500/20',
    question: 'How often do you upload videos?',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: '2-3 times per week' },
      { value: 'biweekly', label: 'Once a week' },
      { value: 'monthly', label: 'A few times per month' },
      { value: 'irregular', label: 'Irregularly' },
    ],
  },
  {
    id: 'content-type',
    icon: Video,
    iconColor: 'text-pink-400',
    bgColor: 'from-pink-500/20',
    question: 'What type of content do you primarily create?',
    options: [
      { value: 'educational', label: 'Educational/Tutorial' },
      { value: 'entertainment', label: 'Entertainment/Comedy' },
      { value: 'gaming', label: 'Gaming' },
      { value: 'vlog', label: 'Vlogs/Lifestyle' },
      { value: 'review', label: 'Reviews/Unboxing' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'biggest-challenge',
    icon: HelpCircle,
    iconColor: 'text-yellow-400',
    bgColor: 'from-yellow-500/20',
    question: 'What is your biggest challenge?',
    options: [
      { value: 'ideas', label: 'Coming up with video ideas' },
      { value: 'consistency', label: 'Staying consistent' },
      { value: 'views', label: 'Getting more views' },
      { value: 'retention', label: 'Keeping viewers engaged' },
      { value: 'technical', label: 'Technical aspects (editing, thumbnails)' },
    ],
  },
];

export function OnboardingQuiz({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedValue, setSelectedValue] = useState('');

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = selectedValue !== '';

  const handleNext = () => {
    // Save current answer
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: selectedValue,
    });

    if (isLastQuestion) {
      // Complete quiz
      const finalAnswers = {
        ...answers,
        [questions[currentQuestion].id]: selectedValue,
      };
      onComplete(finalAnswers);
    } else {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
      setSelectedValue(answers[questions[currentQuestion + 1].id] || '');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedValue(answers[questions[currentQuestion - 1].id] || '');
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const Icon = currentQuestionData.icon;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      <div className="glass-card p-8 border border-white/10 backdrop-blur-xl bg-black/40 animate-reveal">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`glass w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${currentQuestionData.bgColor} to-transparent`}>
                <Icon className={`h-6 w-6 ${currentQuestionData.iconColor}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Let's personalize your experience
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="glass rounded-full p-1">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Content */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <span className="glass w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold gradient-text">
                {currentQuestion + 1}
              </span>
              {currentQuestionData.question}
            </h3>
            
            {/* Options */}
            <div className="space-y-3">
              {currentQuestionData.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedValue(option.value)}
                  className={`w-full glass-card p-4 rounded-xl text-left transition-all group hover:bg-white/10 ${
                    selectedValue === option.value
                      ? 'ring-2 ring-purple-400 bg-purple-500/10'
                      : 'hover:ring-1 hover:ring-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedValue === option.value
                        ? 'border-purple-400 bg-purple-400'
                        : 'border-gray-400 group-hover:border-white'
                    }`}>
                      {selectedValue === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className={`text-base ${
                      selectedValue === option.value ? 'text-white font-medium' : 'text-gray-300'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="glass-button text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button 
              onClick={handleNext} 
              disabled={!canProceed}
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white disabled:opacity-50 flex-1 max-w-xs"
            >
              {isLastQuestion ? (
                <>
                  Complete Setup
                  <Sparkles className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
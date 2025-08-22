'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

const questions = [
  {
    id: 'goal',
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="mb-4">
          <Progress value={progress} />
        </div>
        <CardTitle>Let's personalize your experience</CardTitle>
        <CardDescription>
          Question {currentQuestion + 1} of {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestionData.question}</h3>
          <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
            {currentQuestionData.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={!canProceed}>
            {isLastQuestion ? 'Complete' : 'Next'}
            {!isLastQuestion && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
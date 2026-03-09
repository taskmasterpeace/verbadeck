import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import type { WizardStep } from '../types';

interface WizardProgressProps {
  currentStep: WizardStep;
  stepNumber: number;
  progressPercentage: number;
}

const STEP_DESCRIPTIONS: Record<WizardStep, string> = {
  topic: 'Describe your presentation topic',
  questions: 'Answer a few questions',
  slides: 'Choose your preferred slide options',
  'speaker-notes': 'Add speaker notes (optional)',
  review: 'Review and finalize',
};

export function WizardProgress({ currentStep, stepNumber, progressPercentage }: WizardProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Create from Scratch
        </CardTitle>
        <CardDescription>
          Step {stepNumber} of 4: {STEP_DESCRIPTIONS[currentStep]}
        </CardDescription>
        <Progress value={progressPercentage} className="h-2 mt-2" />
      </CardHeader>
    </Card>
  );
}

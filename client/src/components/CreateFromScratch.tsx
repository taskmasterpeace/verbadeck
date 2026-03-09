import { useState } from 'react';
import type { Section } from '@/lib/script-parser';
import { useCreateWizard } from '@/hooks/useCreateWizard';
import { useSlideGeneration } from '@/hooks/useSlideGeneration';
import { usePresentationStore } from '@/stores';
import { WizardProgress } from './create/shared/WizardProgress';
import { ErrorCard } from './create/shared/ErrorCard';
import { TopicInputStep } from './create/steps/TopicInputStep';
import { QuestionsStep } from './create/steps/QuestionsStep';
import { SpeakerNotesStep } from './create/steps/SpeakerNotesStep';
import type { SlideOption } from './create/types';

interface CreateFromScratchProps {
  onSectionsGenerated: (sections: Section[]) => void;
  selectedModel: string;
}

export function CreateFromScratch({ onSectionsGenerated, selectedModel }: CreateFromScratchProps) {
  const wizard = useCreateWizard();
  const generation = useSlideGeneration();
  const { clearPresentation } = usePresentationStore();
  const [showSpeakerNotesPrompt, setShowSpeakerNotesPrompt] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<SlideOption[]>([]);
  const [slideProgress, setSlideProgress] = useState({ current: 0, total: 0 });

  // Step 1: Generate questions from topic
  const handleGenerateQuestions = async () => {
    if (!wizard.data.topic.trim()) {
      return;
    }

    // Clear old presentation data before starting new generation workflow
    clearPresentation();

    try {
      const questions = await generation.generateQuestions(
        wizard.data.topic,
        selectedModel,
        wizard.data.useAISelection ? null : wizard.data.questionPreferences
      );
      wizard.setQuestions(questions);
      wizard.nextStep();
    } catch (err) {
      // Error already set by hook
    }
  };

  // Step 2: Generate slides sequentially (ONE at a time)
  const handleGenerateSlides = async () => {
    const unanswered = wizard.data.questions.filter(q => !wizard.data.answers[q.id]);
    if (unanswered.length > 0) {
      return;
    }

    try {
      // Generate slides sequentially with progress feedback
      const slides = await generation.generateSlideOptions(
        wizard.data.topic,
        wizard.data.questions,
        wizard.data.answers,
        wizard.data.numSlides,
        selectedModel,
        (current, total) => setSlideProgress({ current, total })
      );

      setGeneratedSlides(slides);

      // Skip the slide selection step and go directly to speaker notes prompt
      setShowSpeakerNotesPrompt(true);
    } catch (err) {
      // Error already set by hook
    }
  };

  // Step 3: Generate speaker notes (BATCH - all slides at once)
  const handleGenerateSpeakerNotes = async () => {
    try {
      const speakerNotes = await generation.generateSpeakerNotes(
        generatedSlides,
        wizard.data.topic,
        wizard.data.answers,
        selectedModel
      );

      const sections = generation.createSections(
        generatedSlides,
        speakerNotes
      );

      onSectionsGenerated(sections);
    } catch (err: any) {
      console.error('Error generating speaker notes:', err);
      // Fallback to skip after showing error briefly
      setTimeout(() => handleSkipNotes(), 2000);
    }
  };

  // Skip speaker notes and create sections
  const handleSkipNotes = () => {
    const sections = generation.createSections(generatedSlides);
    onSectionsGenerated(sections);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Progress Bar */}
      <WizardProgress
        currentStep={wizard.currentStep}
        stepNumber={wizard.getStepNumber()}
        progressPercentage={wizard.getProgressPercentage()}
      />

      {/* Error Display */}
      {generation.error && <ErrorCard error={generation.error} />}

      {/* Step 1: Topic Input */}
      {wizard.currentStep === 'topic' && (
        <TopicInputStep
          topic={wizard.data.topic}
          numSlides={wizard.data.numSlides}
          questionPreferences={wizard.data.questionPreferences}
          useAISelection={wizard.data.useAISelection}
          isProcessing={generation.isLoading}
          onTopicChange={wizard.updateTopic}
          onNumSlidesChange={wizard.updateNumSlides}
          onQuestionPreferencesChange={wizard.updateQuestionPreferences}
          onToggleAISelection={wizard.toggleAISelection}
          onContinue={handleGenerateQuestions}
        />
      )}

      {/* Step 2: Questions */}
      {wizard.currentStep === 'questions' && !showSpeakerNotesPrompt && (
        <QuestionsStep
          questions={wizard.data.questions}
          answers={wizard.data.answers}
          isProcessing={generation.isLoading}
          onAnswerChange={wizard.updateAnswer}
          onBack={wizard.prevStep}
          onContinue={handleGenerateSlides}
        />
      )}

      {/* Step 2.5: Sequential Slide Generation Progress */}
      {wizard.currentStep === 'questions' && generation.isLoading && slideProgress.total > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <div className="text-lg font-medium text-white mb-2">
            Generating slide {slideProgress.current} of {slideProgress.total}...
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(slideProgress.current / slideProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 3: Speaker Notes Prompt (NO MORE SLIDE SELECTION) */}
      {wizard.currentStep === 'questions' && showSpeakerNotesPrompt && (
        <SpeakerNotesStep
          numSlides={generatedSlides.length}
          isGenerating={generation.isLoading}
          onGenerate={handleGenerateSpeakerNotes}
          onSkip={handleSkipNotes}
        />
      )}
    </div>
  );
}

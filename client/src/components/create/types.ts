// Type definitions for Create from Scratch wizard

export type Question = {
  id: string;
  type: 'multiple_choice' | 'fill_in_blank' | 'true_false';
  question: string;
  options?: string[];
  placeholder?: string;
  correctAnswer?: string; // For true/false
};

export type QuestionTypePreferences = {
  multiple_choice: number; // 0-100
  true_false: number; // 0-100
  fill_in_blank: number; // 0-100
};

export type SlideOption = {
  // OLD FORMAT (backward compatibility)
  content?: string;
  speakerNotes?: string;
  style?: string;

  // NEW FORMAT - TalkAdvantage Pro
  heading?: string;
  subtext?: string;
  visualElements?: string[];
  recommendedImage?: string;

  // Common fields
  primaryTrigger: string;
  alternativeTriggers: string[];

  // Structured speaker notes (attached after generation)
  structuredSpeakerNotes?: {
    profoundStatement: string;
    talkingPoints: {
      data: string;
      vision: string;
      proof: string;
    };
    highImpactParagraph: string;
  };
};

export type Slide = {
  position: number;
  title: string;
  options: SlideOption[];
};

export type WizardStep = 'topic' | 'questions' | 'slides' | 'speaker-notes' | 'review';

export type WizardData = {
  topic: string;
  numSlides: number;
  questionPreferences: QuestionTypePreferences;
  useAISelection: boolean;
  questions: Question[];
  answers: Record<string, string>;
  slides: Slide[];
  selectedOptions: Record<number, number>; // slidePosition -> optionIndex
};

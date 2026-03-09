export interface OperationCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  operations: string[];
}

export const CATEGORIES: OperationCategory[] = [
  {
    id: 'create-from-scratch',
    name: 'Create from Scratch',
    icon: '✨',
    description: 'AI-powered presentation generation from topic questions',
    operations: ['generateQuestions', 'generateSlideOptions', 'generateSpeakerNotes']
  },
  {
    id: 'qa-mode',
    name: 'Q&A Mode',
    icon: '💬',
    description: 'Live question answering during presentations',
    operations: ['answerQuestion', 'generateFAQs']
  },
  {
    id: 'know-it-all-wall',
    name: 'Know It All Wall',
    icon: '🧠',
    description: 'Knowledge base analysis and question generation',
    operations: ['analyzeKnowledgeBase', 'generateContextQuestions', 'generateFollowupQuestions']
  },
  {
    id: 'editor',
    name: 'Editor Tools',
    icon: '✏️',
    description: 'Content editing and enhancement features',
    operations: ['suggestTriggers', 'generateVariations', 'suggestImagePrompt', 'generateTitles']
  },
  {
    id: 'upload',
    name: 'Upload & Processing',
    icon: '📤',
    description: 'Convert scripts and PowerPoint files',
    operations: ['processScript']
  },
  {
    id: 'vision',
    name: 'Vision & Images',
    icon: '👁️',
    description: 'Image analysis and processing',
    operations: ['processImages']
  }
];

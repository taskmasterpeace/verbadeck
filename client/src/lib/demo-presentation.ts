import type { Section } from './script-parser';

/**
 * A ready-to-run sample presentation — a seed-stage VC pitch, matching VerbaDeck's
 * core audience (solo founders pitching investors). Used by:
 *  - the onboarding "Try a sample" action,
 *  - the testMode bridge (window.__verbadeck.loadDemo) for E2E + agent-native control.
 *
 * Trigger words are chosen to be natural emphasis words a presenter actually says.
 */
export interface DemoPresentation {
  sections: Section[];
  knowledgeBase: { question: string; answer: string }[];
  sharedKnowledgeBase: string;
}

export const DEMO_PRESENTATION: DemoPresentation = {
  sections: [
    {
      id: 'demo-1',
      heading: 'The Problem',
      content:
        'Every founder loses the room the moment they reach for a clicker. You break eye contact, you fumble, momentum dies — right when you need presence most.',
      advanceToken: 'problem',
      selectedTriggers: ['problem', 'momentum'],
      alternativeTriggers: ['clicker', 'presence'],
      speakerNotes:
        'Open with a story: the last time you watched a great pitch fall flat because the speaker was glued to their laptop.',
    },
    {
      id: 'demo-2',
      heading: 'The Solution',
      content:
        'VerbaDeck advances your slides when you speak. Say the word, the slide moves. Your hands stay free, your eyes stay on the investors.',
      advanceToken: 'solution',
      selectedTriggers: ['solution', 'speak'],
      alternativeTriggers: ['advance', 'free'],
      speakerNotes:
        'Demo it live right here — say "solution" and let the slide advance itself. Nothing sells the product like using it.',
    },
    {
      id: 'demo-3',
      heading: 'Traction',
      content:
        'Real-time transcription, AI-prepared answers, and hands-free delivery — shipped and working today across the full create-to-present loop.',
      advanceToken: 'traction',
      selectedTriggers: ['traction', 'shipped'],
      alternativeTriggers: ['working', 'today'],
      speakerNotes:
        'Anchor on what is live now, not the roadmap. Credibility comes from shipped, not promised.',
    },
    {
      id: 'demo-4',
      heading: 'The Ask',
      content:
        'We are raising to bring hands-free presenting to every founder, sales team, and speaker. Let us show you the future of the stage.',
      advanceToken: 'ask',
      selectedTriggers: ['ask', 'future'],
      alternativeTriggers: ['raising', 'stage'],
      speakerNotes:
        'End on the vision and a clear, confident ask. Then stop talking and let them respond.',
    },
  ],
  knowledgeBase: [
    {
      question: 'How does the voice control actually work?',
      answer:
        'VerbaDeck streams your speech to a real-time transcription engine and matches it against trigger words you set per slide. When you say one, the slide advances — with a short debounce so it never double-fires.',
    },
    {
      question: 'What happens if the trigger word does not get recognized?',
      answer:
        'You always keep manual control: arrow keys and on-screen navigation work alongside voice, so a missed word never strands you. You can also set multiple trigger words per slide for resilience.',
    },
    {
      question: 'Does it work without an internet connection?',
      answer:
        'The presentation UI and manual navigation work offline. Live transcription and AI features need a connection, so we recommend testing the venue Wi-Fi beforehand and keeping the keyboard as a backup.',
    },
  ],
  sharedKnowledgeBase:
    'VerbaDeck is a voice-driven presentation studio. Presenters set trigger words per slide; speaking a trigger advances the slide hands-free. It includes AI slide generation, PowerPoint import, live Q&A with prepared answers, and a dual-monitor presenter/audience split.',
};

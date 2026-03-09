// Q&A Response Tone Options
// These define the personality/style presenters can use when answering questions

export interface ToneOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Clear, direct, and credible. Confident and authoritative while approachable.',
    icon: '💼'
  },
  {
    value: 'witty',
    label: 'Witty & Engaging',
    description: 'Clever wordplay and light humor. Entertaining while still informative.',
    icon: '✨'
  },
  {
    value: 'insightful',
    label: 'Deeply Insightful',
    description: 'Analytical and nuanced. Reveals deeper connections and implications.',
    icon: '🧠'
  },
  {
    value: 'conversational',
    label: 'Conversational',
    description: 'Warm and relatable. Like talking to a colleague without corporate jargon.',
    icon: '💬'
  },
  {
    value: 'bold',
    label: 'Bold & Provocative',
    description: 'Challenges assumptions. Strong statements that make people think differently.',
    icon: '🔥'
  },
  {
    value: 'technical',
    label: 'Technical Expert',
    description: 'Precise and data-driven. Specific details and metrics for technical audiences.',
    icon: '🔬'
  },
  {
    value: 'storytelling',
    label: 'Storytelling',
    description: 'Compelling narratives. Uses anecdotes and vivid examples to illustrate points.',
    icon: '📖'
  },
  {
    value: 'sarcastic',
    label: 'Sarcastic & Sharp',
    description: 'Dry wit and subtle jabs. Ironic observations that make memorable points.',
    icon: '😏'
  },
  {
    value: 'interviewee',
    label: 'Interviewee',
    description: 'Answering as a candidate in an interview. Highlights relevant experience, technical depth, and problem-solving approach.',
    icon: '🎯'
  }
];

export const DEFAULT_TONE = 'professional';

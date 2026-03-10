import { create } from 'zustand';

interface VoiceState {
  // Streaming state
  isStreaming: boolean;
  status: 'connecting' | 'connected' | 'disconnected';

  // Transcript data
  transcript: string[];
  lastTranscript: string;
  isLastTranscriptFinal: boolean;

  // Q&A listening mode
  isListeningForQuestions: boolean;

  // Actions
  setIsStreaming: (streaming: boolean) => void;
  setStatus: (status: 'connecting' | 'connected' | 'disconnected') => void;
  setTranscript: (transcript: string[]) => void;
  setLastTranscript: (text: string, isFinal?: boolean) => void;
  addToTranscript: (text: string) => void;
  setIsListeningForQuestions: (listening: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  isStreaming: false,
  status: 'disconnected' as const,
  transcript: [],
  lastTranscript: '',
  isLastTranscriptFinal: false,
  isListeningForQuestions: false,
};

export const useVoiceStore = create<VoiceState>((set) => ({
  ...initialState,

  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setStatus: (status) => set({ status }),
  setTranscript: (transcript) => set({ transcript }),
  setLastTranscript: (text, isFinal = false) => set({ lastTranscript: text, isLastTranscriptFinal: isFinal }),

  addToTranscript: (text) =>
    set((state) => ({
      transcript: [...state.transcript.slice(-20), text],
    })),

  setIsListeningForQuestions: (listening) => set({ isListeningForQuestions: listening }),

  reset: () => set(initialState),
}));

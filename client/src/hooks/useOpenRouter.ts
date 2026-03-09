import { useState, useRef } from 'react';
import { apiPost, APIError, isAPIError } from '@/lib/api-client';

interface ProcessScriptResponse {
  sections: {
    content: string;
    primaryTrigger: string;
    alternativeTriggers: string[];
  }[];
}

interface SuggestTriggersResponse {
  triggers: string[];
}

export function useOpenRouter() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const processScript = async (text: string, model: string, preserveWording: boolean = true): Promise<ProcessScriptResponse> => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    try {
      const data = await apiPost<ProcessScriptResponse>('/api/process-script', {
        text,
        model,
        preserveWording
      });

      clearInterval(progressInterval);
      setProgress(100);
      return data;
    } catch (err) {
      clearInterval(progressInterval);
      const message = isAPIError(err) ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const suggestTriggers = async (text: string, model: string): Promise<string[]> => {
    setIsProcessing(true);
    setError(null);

    try {
      const data = await apiPost<SuggestTriggersResponse>('/api/suggest-triggers', {
        text,
        model
      });
      return data.triggers;
    } catch (err) {
      const message = isAPIError(err) ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const processImagesWithAI = async (
    images: { id: string; dataUrl: string; name: string }[],
    aspectRatio: string,
    model: string
  ): Promise<ProcessScriptResponse> => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    try {
      const data = await apiPost<ProcessScriptResponse>('/api/process-images', {
        images,
        aspectRatio,
        model
      });

      clearInterval(progressInterval);
      setProgress(100);
      return data;
    } catch (err) {
      clearInterval(progressInterval);
      const message = isAPIError(err) ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const generateFAQs = async (presentationContent: string, model?: string): Promise<{ question: string; answer: string }[]> => {
    setIsProcessing(true);
    setError(null);

    try {
      const data = await apiPost<{ faqs: { question: string; answer: string }[] }>('/api/generate-faqs', {
        presentationContent,
        model
      });
      return data.faqs;
    } catch (err) {
      const message = isAPIError(err) ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  interface AnswerResponse {
    heading: string;
    brief: string;
    bullets: string[];
    full: string;
    keywords: string[];
  }

  const answerQuestion = async (
    question: string,
    presentationContent: string,
    knowledgeBase: { question: string; answer: string }[],
    model?: string,
    tone: string = 'professional',
    sections?: { heading?: string; content: string }[],
    currentSlideIndex?: number,
    presentationGoal?: string,
  ): Promise<{ answer1: AnswerResponse; answer2: AnswerResponse }> => {
    setIsProcessing(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE}/api/answer-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          presentationContent,
          knowledgeBase,
          model,
          tone,
          sections,
          currentSlideIndex,
          presentationGoal,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to answer question');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('✋ Question answering cancelled');
        throw new Error('Question cancelled');
      }
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const cancelAnswerQuestion = () => {
    if (abortControllerRef.current) {
      console.log('🛑 Cancelling question answer request...');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsProcessing(false);
    }
  };

  // For Know It All Wall - uses knowledge base only, no presentation content required
  const answerQuestionWithKeywords = async (
    question: string,
    knowledgeBase: string,
    model?: string,
    tone?: string
  ): Promise<{ answer1: AnswerResponse; answer2: AnswerResponse }> => {
    setIsProcessing(true);
    setError(null);

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE}/api/answer-question-with-keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, knowledgeBase, model, tone }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to answer question');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      // Check if this was an abort
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('✋ Question answering cancelled');
        throw new Error('Question cancelled');
      }
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const generateTitles = async (sections: any[], model: string): Promise<string[]> => {
    setIsProcessing(true);
    setError(null);

    try {
      const data = await apiPost<{ titles: string[] }>('/api/generate-titles', {
        sections,
        model
      });
      return data.titles;
    } catch (err) {
      const message = isAPIError(err) ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSlideOptions = async (
    topic: string,
    answers: any[],
    sectionNumber: number,
    totalSections: number,
    model?: string
  ): Promise<any> => {
    setIsProcessing(true);
    setError(null);

    try {
      const data = await apiPost<{ slide: any }>('/api/generate-slide-options', {
        topic,
        answers,
        sectionNumber,
        totalSections,
        model
      });
      return data.slide;
    } catch (err) {
      const message = isAPIError(err) ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSpeakerNotes = async (
    slides: any[],
    topic: string,
    answers: any[],
    model?: string
  ): Promise<Array<{ profoundStatement: string; talkingPoints: string[]; highImpactParagraph: string }>> => {
    setIsProcessing(true);
    setError(null);

    try {
      const data = await apiPost<{ speakerNotes: Array<{ profoundStatement: string; talkingPoints: string[]; highImpactParagraph: string }> }>('/api/generate-speaker-notes', {
        slides,
        topic,
        answers,
        model
      });
      return data.speakerNotes;
    } catch (err) {
      const message = isAPIError(err) ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processScript,
    suggestTriggers,
    processImagesWithAI,
    generateFAQs,
    answerQuestion,
    answerQuestionWithKeywords,
    cancelAnswerQuestion,
    generateTitles,
    generateSlideOptions,
    generateSpeakerNotes,
    isProcessing,
    error,
    progress,
  };
}

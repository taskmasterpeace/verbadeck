import { useState } from 'react';

const API_BASE = 'http://localhost:3001/api';

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

  const processScript = async (text: string, model: string, preserveWording: boolean = true): Promise<ProcessScriptResponse> => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch(`${API_BASE}/process-script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, model, preserveWording }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process script');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
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
      const response = await fetch(`${API_BASE}/suggest-triggers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, model }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suggest triggers');
      }

      const data: SuggestTriggersResponse = await response.json();
      return data.triggers;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
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

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch(`${API_BASE}/process-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images, aspectRatio, model }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process images');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const generateFAQs = async (presentationContent: string, model: string): Promise<{ question: string; answer: string }[]> => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/generate-faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ presentationContent, model }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate FAQs');
      }

      const data = await response.json();
      return data.faqs;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const answerQuestion = async (
    question: string,
    presentationContent: string,
    knowledgeBase: { question: string; answer: string }[],
    model: string
  ): Promise<{ answer1: string; answer2: string }> => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/answer-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, presentationContent, knowledgeBase, model }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to answer question');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
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
    isProcessing,
    error,
    progress,
  };
}

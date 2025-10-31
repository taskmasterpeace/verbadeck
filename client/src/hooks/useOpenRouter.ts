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

  const processScript = async (text: string, model: string): Promise<ProcessScriptResponse> => {
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
        body: JSON.stringify({ text, model }),
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

  return {
    processScript,
    suggestTriggers,
    isProcessing,
    error,
    progress,
  };
}

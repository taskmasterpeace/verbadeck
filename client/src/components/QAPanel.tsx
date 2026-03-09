import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Loader2, X, Copy, Check, Clock } from 'lucide-react';
import { getModelById } from '@/lib/openrouter-models';

interface Answer {
  heading: string;
  brief: string;
  bullets: string[];
  full: string;
  keywords: string[];
}

interface QAPanelProps {
  question: string;
  answers?: { answer1: Answer; answer2: Answer } | null;
  isLoading?: boolean;
  onDismiss: () => void;
  onCancel?: () => void;
  cancelWord?: string;
  selectedModel?: string;
}

export function QAPanel({ question, answers, isLoading, onDismiss, onCancel, cancelWord, selectedModel }: QAPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'a' | 'b'>('a');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const modelInfo = selectedModel ? getModelById(selectedModel) : null;
  const expectedTime = modelInfo?.expectedResponseTime || 4000;

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) setElapsedTime(Date.now() - startTimeRef.current);
      }, 100);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isLoading]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeAnswer = answers ? (selectedAnswer === 'a' ? answers.answer1 : answers.answer2) : null;

  return (
    <div className="fixed right-0 top-0 h-full w-[450px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 border-b bg-blue-50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MessageCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm font-medium text-blue-900 truncate">{question}</p>
        </div>
        <button onClick={onDismiss} className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Generating answer...</p>
                <p className="text-xs text-gray-500">
                  {(elapsedTime / 1000).toFixed(1)}s / ~{(expectedTime / 1000).toFixed(1)}s expected
                </p>
              </div>
            </div>
            {onCancel && (
              <button onClick={onCancel} className="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                Cancel ({cancelWord || 'cancel'})
              </button>
            )}
          </div>
        ) : answers ? (
          <>
            {/* Answer Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedAnswer('a')}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedAnswer === 'a' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Option A
              </button>
              <button
                onClick={() => setSelectedAnswer('b')}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedAnswer === 'b' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Option B
              </button>
            </div>

            {activeAnswer && (
              <div className="space-y-3">
                {/* Brief - prominent */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-green-700">QUICK ANSWER</span>
                    <button
                      onClick={() => handleCopy(activeAnswer.brief, selectedAnswer === 'a' ? 1 : 2)}
                      className="text-gray-400 hover:text-green-600 p-0.5"
                    >
                      {copiedIndex === (selectedAnswer === 'a' ? 1 : 2) ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{activeAnswer.brief}</p>
                </div>

                {/* Bullets */}
                <div>
                  <span className="text-xs font-semibold text-blue-600">KEY POINTS</span>
                  <ul className="mt-1 space-y-1">
                    {(activeAnswer.bullets || []).map((bullet, idx) => (
                      <li key={idx} className="text-sm text-gray-800 flex gap-2">
                        <span className="text-blue-500">-</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Full */}
                <div>
                  <span className="text-xs font-semibold text-gray-500">DETAILED</span>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">{activeAnswer.full}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic text-sm">No answers generated yet.</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3">
        <button onClick={onDismiss} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm">
          Continue Presentation
        </button>
      </div>
    </div>
  );
}

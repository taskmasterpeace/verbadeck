import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageCircle, Loader2, X } from 'lucide-react';

interface QAPanelProps {
  question: string;
  answer?: string;
  talkingPoints: string[];
  isLoading?: boolean;
  onDismiss: () => void;
}

export function QAPanel({ question, answer, talkingPoints, isLoading, onDismiss }: QAPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Live Question
            </CardTitle>
            <button
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Question */}
          <div>
            <div className="text-sm font-semibold text-gray-500 mb-2">QUESTION:</div>
            <div className="text-lg font-medium text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-200">
              {question}
            </div>
          </div>

          {/* AI Talking Points */}
          <div>
            <div className="text-sm font-semibold text-gray-500 mb-2">AI TALKING POINTS:</div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-600 p-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating response...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {talkingPoints.map((point, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 text-gray-900 bg-white p-3 rounded-lg border">
                      {point}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pre-written Answer (from Knowledge Base) */}
          {answer && (
            <div>
              <div className="text-sm font-semibold text-gray-500 mb-2">YOUR ANSWER:</div>
              <div className="text-gray-900 bg-green-50 p-4 rounded-lg border border-green-200 leading-relaxed">
                {answer}
              </div>
            </div>
          )}
        </CardContent>
        <div className="border-t p-4 bg-gray-50">
          <button
            onClick={onDismiss}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Continue Presentation
          </button>
        </div>
      </Card>
    </div>
  );
}

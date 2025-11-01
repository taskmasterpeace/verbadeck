import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageCircle, Loader2, X, Copy, Check } from 'lucide-react';

interface Answer {
  brief: string;
  bullets: string[];
  full: string;
}

interface QAPanelProps {
  question: string;
  answers?: { answer1: Answer; answer2: Answer } | null;
  isLoading?: boolean;
  onDismiss: () => void;
}

export function QAPanel({ question, answers, isLoading, onDismiss }: QAPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              AI-Powered Q&A
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

          {/* AI Answers */}
          <div>
            <div className="text-sm font-semibold text-gray-500 mb-2">AI-GENERATED ANSWERS:</div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-600 p-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating answers with AI... This may take a few seconds.</span>
              </div>
            ) : answers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Answer Option 1 */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-blue-600">OPTION A</div>
                    <button
                      onClick={() => handleCopy(`Brief: ${answers.answer1.brief}\n\nKey Points:\n${answers.answer1.bullets.map(b => `• ${b}`).join('\n')}\n\nFull Answer:\n${answers.answer1.full}`, 1)}
                      className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                      title="Copy all sections to clipboard"
                    >
                      {copiedIndex === 1 ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="space-y-3 bg-white p-4 rounded-lg border-2 border-blue-300">
                    {/* Brief */}
                    <div>
                      <div className="text-xs font-semibold text-green-600 mb-1">💬 ONE SENTENCE ANSWER</div>
                      <div className="text-sm text-gray-900 italic bg-green-50 p-2 rounded">
                        {answers.answer1.brief}
                      </div>
                    </div>

                    {/* Bullets */}
                    <div>
                      <div className="text-xs font-semibold text-blue-600 mb-1">📌 KEY POINTS</div>
                      <ul className="space-y-1">
                        {answers.answer1.bullets.map((bullet, idx) => (
                          <li key={idx} className="text-sm text-gray-900 flex gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Full */}
                    <div>
                      <div className="text-xs font-semibold text-purple-600 mb-1">📄 FULL ANSWER (Detailed)</div>
                      <div className="text-sm text-gray-900 leading-relaxed bg-purple-50 p-2 rounded">
                        {answers.answer1.full}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer Option 2 */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-blue-600">OPTION B</div>
                    <button
                      onClick={() => handleCopy(`Brief: ${answers.answer2.brief}\n\nKey Points:\n${answers.answer2.bullets.map(b => `• ${b}`).join('\n')}\n\nFull Answer:\n${answers.answer2.full}`, 2)}
                      className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                      title="Copy all sections to clipboard"
                    >
                      {copiedIndex === 2 ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="space-y-3 bg-white p-4 rounded-lg border-2 border-blue-300">
                    {/* Brief */}
                    <div>
                      <div className="text-xs font-semibold text-green-600 mb-1">💬 ONE SENTENCE ANSWER</div>
                      <div className="text-sm text-gray-900 italic bg-green-50 p-2 rounded">
                        {answers.answer2.brief}
                      </div>
                    </div>

                    {/* Bullets */}
                    <div>
                      <div className="text-xs font-semibold text-blue-600 mb-1">📌 KEY POINTS</div>
                      <ul className="space-y-1">
                        {answers.answer2.bullets.map((bullet, idx) => (
                          <li key={idx} className="text-sm text-gray-900 flex gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Full */}
                    <div>
                      <div className="text-xs font-semibold text-purple-600 mb-1">📄 FULL ANSWER (Detailed)</div>
                      <div className="text-sm text-gray-900 leading-relaxed bg-purple-50 p-2 rounded">
                        {answers.answer2.full}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic p-4">
                No answers generated yet.
              </div>
            )}
          </div>

          {/* Usage Tips */}
          {answers && !isLoading && (
            <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-600">
              <strong>💡 Tips:</strong> Use the <span className="text-green-600 font-semibold">one sentence</span> for brevity, <span className="text-blue-600 font-semibold">key points</span> for structured responses, or the <span className="text-purple-600 font-semibold">full answer</span> to elaborate. Click the copy icon to save for follow-up emails.
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

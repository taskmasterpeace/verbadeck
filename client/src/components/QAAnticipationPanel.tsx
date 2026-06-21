import { useState } from 'react';
import { Brain, Loader2, ChevronDown, ChevronUp, Plus, Check, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Section } from '@/lib/script-parser';

interface PredictedQuestion {
  question: string;
  likelihood: number;
  category: 'roi' | 'risk' | 'implementation' | 'proof' | 'alternative';
  reasoning: string;
  slideReference?: number;
}

interface QAAnswer {
  shortAnswer: string;
  detailedAnswer: string;
  keyPoints: string[];
  confidence: 'high' | 'medium' | 'low';
  missingInfo: string | null;
}

interface QAAnticipationPanelProps {
  sections: Section[];
  knowledgeBase: { question: string; answer: string }[];
  selectedTone: string;
  onAddToKnowledgeBase: (question: string, answer: string) => void;
  onAddToSpeakerNotes: (slideIndex: number, notes: string) => void;
}

/**
 * QAAnticipationPanel Component
 *
 * Smart Q&A Anticipation: Predicts likely audience questions before presenting.
 *
 * Features:
 * - AI analyzes presentation content
 * - Predicts top 10 questions with confidence scores
 * - Generates pre-written answers (short + detailed versions)
 * - One-click save to Knowledge Base + Speaker Notes
 * - Category tagging (ROI, Risk, Implementation, Proof, Alternatives)
 *
 * User's favorite feature: "Oh my gosh, that's so good!"
 */
export function QAAnticipationPanel({
  sections,
  knowledgeBase,
  selectedTone,
  onAddToKnowledgeBase,
  onAddToSpeakerNotes,
}: QAAnticipationPanelProps) {
  const [predictions, setPredictions] = useState<PredictedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [preparingAnswer, setPreparingAnswer] = useState<number | null>(null);
  const [generatedAnswers, setGeneratedAnswers] = useState<Map<number, QAAnswer>>(new Map());
  const [savedQuestions, setSavedQuestions] = useState<Set<number>>(new Set());

  const handleAnticipateQuestions = async () => {
    setLoading(true);
    setPredictions([]);

    try {
      const response = await fetch('/api/anticipate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections,
          knowledgeBase,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to anticipate questions');
      }

      const data = await response.json();
      setPredictions(data.questions || []);
      console.log(`✅ AI anticipated ${data.questions.length} questions`);
    } catch (err) {
      console.error('Error anticipating questions:', err);
      alert('Failed to generate question predictions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareAnswer = async (questionIndex: number) => {
    const question = predictions[questionIndex];
    setPreparingAnswer(questionIndex);

    try {
      const allContent = sections.map((s, i) => `Slide ${i + 1}: ${s.content}`).join('\n\n');

      const response = await fetch('/api/generate-qa-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          presentationContent: allContent,
          knowledgeBase: knowledgeBase.map(kb => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n'),
          selectedTone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate answer');
      }

      const answer = await response.json();

      setGeneratedAnswers(prev => new Map(prev).set(questionIndex, answer));
      setExpandedIndex(questionIndex);
      console.log(`✅ Generated answer for: "${question.question.substring(0, 50)}..."`);
    } catch (err) {
      console.error('Error generating answer:', err);
      alert('Failed to generate answer. Please try again.');
    } finally {
      setPreparingAnswer(null);
    }
  };

  const handleSaveToBoth = (questionIndex: number) => {
    const question = predictions[questionIndex];
    const answer = generatedAnswers.get(questionIndex);

    if (!answer) return;

    // Add to Knowledge Base
    onAddToKnowledgeBase(question.question, answer.detailedAnswer);

    // Add to Speaker Notes for relevant slide
    if (question.slideReference !== undefined) {
      const slideIndex = question.slideReference - 1; // Convert to 0-indexed
      if (slideIndex >= 0 && slideIndex < sections.length) {
        const notesToAdd = `\n\n---\nAnticipated Q&A:\nQ: ${question.question}\nA: ${answer.shortAnswer}`;
        onAddToSpeakerNotes(slideIndex, notesToAdd);
      }
    }

    // Mark as saved
    setSavedQuestions(prev => new Set(prev).add(questionIndex));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      roi: 'bg-green-100 text-green-800 border-green-200',
      risk: 'bg-red-100 text-red-800 border-red-200',
      implementation: 'bg-blue-100 text-blue-800 border-blue-200',
      proof: 'bg-teal-100 text-teal-800 border-teal-200',
      alternative: 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      roi: '💰',
      risk: '⚠️',
      implementation: '🔧',
      proof: '📊',
      alternative: '🔄',
    };
    return emojis[category as keyof typeof emojis] || '❓';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Q&A Anticipation</h2>
            <span className="text-xs text-gray-500">Predict likely audience questions</span>
          </div>

          <button
            onClick={handleAnticipateQuestions}
            disabled={loading || sections.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing...
              </>
            ) : predictions.length > 0 ? (
              <>
                <Brain className="w-3.5 h-3.5" />
                Regenerate
              </>
            ) : (
              <>
                <Brain className="w-3.5 h-3.5" />
                Anticipate Questions
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Empty State */}
        {predictions.length === 0 && !loading && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No predictions yet</h3>
            <p className="text-sm text-gray-500">
              Click "Anticipate Questions" above to predict the top 10 questions your audience will ask.
            </p>
            {sections.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">Create slides first to enable this feature</p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && predictions.length === 0 && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">Analyzing your presentation for likely questions...</p>
          </div>
        )}

        {/* Predictions List */}
        {predictions.length > 0 && (
          <div className="space-y-3">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                AI predicted <span className="font-semibold text-gray-900">{predictions.length} likely questions</span> — click any to prepare an answer
              </p>
            </div>

            {predictions.map((pred, index) => {
              const answer = generatedAnswers.get(index);
              const isExpanded = expandedIndex === index;
              const isPreparing = preparingAnswer === index;
              const isSaved = savedQuestions.has(index);

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                >
                  {/* Question Header */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${getCategoryColor(pred.category)}`}>
                            {getCategoryEmoji(pred.category)}
                            {pred.category.toUpperCase()}
                          </span>
                          <span className="text-xs font-medium text-green-600">
                            {pred.likelihood}% likely
                          </span>
                          {pred.slideReference && (
                            <span className="text-xs text-gray-500">
                              (Slide {pred.slideReference})
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-gray-900 mb-1">
                          "{pred.question}"
                        </p>

                        <p className="text-xs text-gray-600 italic">
                          {pred.reasoning}
                        </p>
                      </div>

                      {!answer && !isPreparing && (
                        <button
                          onClick={() => handlePrepareAnswer(index)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Prepare Answer
                        </button>
                      )}

                      {isPreparing && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Generating...
                        </div>
                      )}

                      {answer && (
                        <button
                          onClick={() => setExpandedIndex(isExpanded ? null : index)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Answer Details */}
                  <AnimatePresence>
                    {answer && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-gray-200 space-y-4">
                          {/* Short Answer */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">30 seconds</span>
                              SHORT ANSWER
                            </h4>
                            <p className="text-sm text-gray-800 bg-blue-50 border border-blue-100 rounded-lg p-3">
                              {answer.shortAnswer}
                            </p>
                          </div>

                          {/* Detailed Answer */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">2-3 minutes</span>
                              DETAILED ANSWER
                            </h4>
                            <div className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap">
                              {answer.detailedAnswer}
                            </div>
                          </div>

                          {/* Key Points */}
                          {answer.keyPoints && answer.keyPoints.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-2">KEY POINTS (for speaker notes)</h4>
                              <ul className="space-y-1">
                                {answer.keyPoints.map((point, i) => (
                                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Confidence & Missing Info */}
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>
                              Confidence:{' '}
                              <span
                                className={`font-medium ${
                                  answer.confidence === 'high'
                                    ? 'text-green-600'
                                    : answer.confidence === 'medium'
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {answer.confidence.toUpperCase()}
                              </span>
                            </span>
                            {answer.missingInfo && (
                              <span className="text-amber-600">
                                Missing: {answer.missingInfo}
                              </span>
                            )}
                          </div>

                          {/* Save Options */}
                          <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-xs text-gray-600">Save prepared answer:</p>

                            <div className="flex gap-2">
                              {!isSaved ? (
                                <>
                                  <button
                                    onClick={() => {
                                      onAddToKnowledgeBase(pred.question, answer.detailedAnswer);
                                      setSavedQuestions(prev => new Set(prev).add(index));
                                    }}
                                    className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                  >
                                    <Plus className="w-3.5 h-3.5 inline mr-1" />
                                    Knowledge Base Only
                                  </button>

                                  <button
                                    onClick={() => handleSaveToBoth(index)}
                                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                  >
                                    <Plus className="w-3.5 h-3.5 inline mr-1" />
                                    Save to Both
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
                                  <Check className="w-4 h-4" />
                                  <span className="text-sm font-medium">Saved</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Bulk Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{savedQuestions.size}</span> of {predictions.length} answers prepared
              </p>

              <button
                onClick={() => {
                  predictions.forEach((_, index) => {
                    if (generatedAnswers.has(index) && !savedQuestions.has(index)) {
                      handleSaveToBoth(index);
                    }
                  });
                }}
                disabled={generatedAnswers.size === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Save All Prepared Answers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

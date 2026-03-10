/**
 * KnowItAllQuestionCard - Individual question card with two answer options
 * Displays heading, brief, bullets, full text, and keywords for each answer
 */

import { QuestionCard } from '../lib/know-it-all-types';
import { Card, CardContent, CardHeader } from './ui/card';
import { Loader2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { HighlightedText } from './HighlightedText';
import { motion } from 'framer-motion';

interface KnowItAllQuestionCardProps {
  /** Question card data */
  question: QuestionCard;

  /** Callback when an answer is manually selected (for testing) */
  onSelectAnswer: (cardId: string, answerIndex: 1 | 2) => void;
}

export function KnowItAllQuestionCard({
  question,
  onSelectAnswer,
}: KnowItAllQuestionCardProps) {
  const isAnswered = question.status === 'answered';
  const isConfirming = question.status === 'confirming';
  const isGenerating = question.status === 'generating';
  const isError = question.status === 'error';

  // Check if a keyword has been detected
  const isKeywordDetected = (keyword: string) => {
    return question.keywordsDetected.includes(keyword.toLowerCase());
  };

  // Render a single answer option
  const renderAnswer = (
    answerIndex: 1 | 2,
    answer: typeof question.answers.answer1
  ) => {
    const isSelected = question.selectedAnswer === answerIndex;
    const isFaded = isAnswered && !isSelected;

    // Check if any keyword from this answer was detected
    const hasKeywordMatch = answer.keywords.some(k => isKeywordDetected(k));

    // If any keyword is detected on THIS answer and it's confirming, briefly highlight
    const isBlinking = hasKeywordMatch && isConfirming;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: isFaded ? 0.3 : 1,
          scale: isSelected ? 1.02 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          'p-4 rounded-lg border-2',
          isFaded && 'grayscale',
          isSelected && 'border-green-500 bg-green-50 shadow-lg',
          !isSelected && !isFaded && 'border-gray-200 hover:border-gray-300',
          isBlinking && 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-300'
        )}
      >
        {/* Heading */}
        <div className="flex items-start gap-2 mb-2">
          {isSelected ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          )}
          <HighlightedText
            text={answer.heading || `Answer ${answerIndex}`}
            keywords={answer.keywords}
            detectedKeywords={question.keywordsDetected}
            as="h4"
            className="font-semibold text-sm text-gray-900 flex-1"
          />
        </div>

        {/* Brief */}
        {answer.brief && (
          <HighlightedText
            text={answer.brief}
            keywords={answer.keywords}
            detectedKeywords={question.keywordsDetected}
            as="p"
            className="text-sm text-gray-700 mb-2 italic"
          />
        )}

        {/* Bullets */}
        {answer.bullets && answer.bullets.length > 0 && (
          <ul className="space-y-1 mb-2 text-xs text-gray-600">
            {answer.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-gray-400 mt-0.5">•</span>
                <HighlightedText
                  text={bullet}
                  keywords={answer.keywords}
                  detectedKeywords={question.keywordsDetected}
                  as="span"
                  className="flex-1"
                />
              </li>
            ))}
          </ul>
        )}

        {/* Full text */}
        {answer.full && (
          <HighlightedText
            text={answer.full}
            keywords={answer.keywords}
            detectedKeywords={question.keywordsDetected}
            as="p"
            className="text-xs text-gray-600 mb-3 leading-relaxed"
          />
        )}

        {/* Keywords */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Keywords:</span>
          <div className="flex gap-2">
            {answer.keywords.map((keyword, idx) => (
              <motion.span
                key={idx}
                initial={{ scale: 1 }}
                animate={{
                  scale: isKeywordDetected(keyword) ? [1, 1.15, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium transition-colors',
                  isKeywordDetected(keyword)
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className={cn(
      'transition-all duration-300',
      question.isVisible && 'ring-2 ring-blue-500/20',
      isAnswered && 'bg-green-50/30',
      isError && 'bg-red-50/30 border-red-200'
    )}>
      <CardHeader className="pb-3">
        {/* Question text */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base">
              {question.question}
            </h3>

          </div>

          {/* Status indicator */}
          <div className="flex-shrink-0">
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </div>
            )}
            {isConfirming && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-2 text-xs text-amber-600"
              >
                <Circle className="w-4 h-4 animate-pulse" />
                <span>Say 2nd keyword</span>
              </motion.div>
            )}
            {isAnswered && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Answered</span>
              </div>
            )}
            {isError && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Error</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-sm text-red-600 font-medium">
                {question.errorMessage || 'Failed to generate answer'}
              </p>
              <p className="text-xs text-gray-500">
                The question is still saved - you can retry by asking it again.
              </p>
            </div>
          </div>
        ) : isGenerating ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Only show selected answer if answered, otherwise show both */}
            {isAnswered ? (
              question.selectedAnswer === 1 ? renderAnswer(1, question.answers.answer1) : renderAnswer(2, question.answers.answer2)
            ) : isConfirming ? (
              // Once first keyword is detected, only show the matching answer
              <>
                {question.answers.answer1.keywords.some(k => isKeywordDetected(k)) && renderAnswer(1, question.answers.answer1)}
                {question.answers.answer2.keywords.some(k => isKeywordDetected(k)) && renderAnswer(2, question.answers.answer2)}
              </>
            ) : (
              // Show both options initially
              <>
                {renderAnswer(1, question.answers.answer1)}
                {renderAnswer(2, question.answers.answer2)}
              </>
            )}
          </div>
        )}

        {/* Debug: Manual selection (hidden in production) */}
        {process.env.NODE_ENV === 'development' && !isAnswered && !isGenerating && (
          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={() => onSelectAnswer(question.id, 1)}
              className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              Select Answer 1
            </button>
            <button
              onClick={() => onSelectAnswer(question.id, 2)}
              className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              Select Answer 2
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

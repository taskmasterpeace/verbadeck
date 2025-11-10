/**
 * KnowItAllWall - Question queue system with voice-activated triggers
 * Uses Intersection Observer to track which cards are visible for keyword detection
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { QuestionCard, extractLockWord } from '../lib/know-it-all-types';
import { KnowItAllQuestionCard } from './KnowItAllQuestionCard';
import { useKeywordDetection } from '../hooks/useKeywordDetection';
import { extractTriggerWord } from '../lib/extract-trigger-word';
import { apiPost, isAPIError } from '@/lib/api-client';
import { SessionStats } from './know-it-all/SessionStats';
import { ExportSession } from './know-it-all/ExportSession';

interface KnowItAllWallProps {
  /** All questions in the current session */
  questions: QuestionCard[];

  /** Callback to update questions state */
  onQuestionsChange: (questionsOrUpdater: QuestionCard[] | ((prev: QuestionCard[]) => QuestionCard[])) => void;

  /** Current transcript from voice recognition */
  transcript: string;

  /** Knowledge base content for generating answers */
  knowledgeBase: string;

  /** Selected AI model for answer generation */
  selectedModel: string;

  /** Selected tone for AI responses */
  selectedTone: string;
}

export function KnowItAllWall({
  questions,
  onQuestionsChange,
  transcript,
  knowledgeBase,
  selectedModel,
  selectedTone,
}: KnowItAllWallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [detectedQuestion, setDetectedQuestion] = useState<string | null>(null);
  const lastTriggerTranscriptRef = useRef<string>('');

  // Manual question input state
  const [manualQuestion, setManualQuestion] = useState<string>('');

  // Session timer
  const [sessionStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Detect questions from transcript + handle lock word detection
  useEffect(() => {
    if (!transcript.trim()) return;

    const text = transcript.trim().toLowerCase();

    // FIRST: Check for lock word detection (before question detection)
    // Detect "next question" or "unlock" to unlock any locked question
    const unlockTriggers = ['next question', 'unlock', 'next'];
    const hasUnlockTrigger = unlockTriggers.some(trigger => text.includes(trigger));

    if (hasUnlockTrigger) {
      // Unlock any locked question
      const lockedQuestion = questions.find(q => q.isLocked);
      if (lockedQuestion) {
        console.log(`🔓 Unlocking question via unlock trigger: "${text}"`);
        onQuestionsChange(questions.map(q =>
          q.id === lockedQuestion.id ? { ...q, isLocked: false } : q
        ));
        return; // Don't process as a question
      }
    }

    // Check if any question's lock word is spoken (toggle lock)
    for (const q of questions) {
      if (q.lockWord && text.includes(q.lockWord)) {
        console.log(`${q.isLocked ? '🔓 Unlocking' : '🔒 Locking'} question via lock word: "${q.lockWord}"`);
        onQuestionsChange(questions.map(card =>
          card.id === q.id ? { ...card, isLocked: !card.isLocked } : card
        ));
        return; // Don't process as a question
      }
    }

    // Don't detect new questions if ANY question is locked
    const hasLockedQuestion = questions.some(q => q.isLocked);
    if (hasLockedQuestion) {
      console.log('🔒 Question locked - new question detection blocked');
      return;
    }

    // Don't detect new questions if there's an active question still being answered
    const hasActiveQuestion = questions.some(
      q => q.status === 'generating' || q.status === 'ready' || q.status === 'confirming'
    );

    if (hasActiveQuestion) {
      return; // Wait for current question to be answered first
    }

    // Question trigger words/phrases (at the start of sentences)
    const questionStarters = [
      // Question words
      'how', 'what', 'when', 'where', 'who', 'why', 'which', 'whose', 'whom',

      // Modal phrases
      'can you', 'could you', 'would you', 'will you', 'should you',
      'may i', 'might you', 'shall we', 'would it', 'could it', 'can it',

      // Verb starters
      'do you', 'does', 'did you', 'have you', 'has', 'is', 'are',
      'was', 'were', 'am', 'been', 'had', 'will', 'would', 'could', 'should',

      // Command starters
      'tell me', 'explain', 'describe', 'give me', 'show me', 'help me',
      'talk about', 'discuss', 'share', 'elaborate', 'clarify', 'define',
      'compare', 'contrast', 'demonstrate', 'illustrate', 'outline',

      // Conversational starters
      'i wonder', "i'm wondering", "i'd like to know", 'wondering about',
      'curious about', 'question about', 'ask about', 'thinking about',
      'let me know', "let's talk about", "let's discuss", 'can we talk about',
      'wanna know', 'want to know', 'need to know', 'trying to understand'
    ];

    // Check if starts with question word or ends with ?
    const startsWithQuestion = questionStarters.some(starter =>
      text.startsWith(starter + ' ')
    );
    const endsWithQuestion = transcript.trim().endsWith('?');

    if ((startsWithQuestion || endsWithQuestion) && transcript.trim().length > 10) {
      // Add ? if not present but starts with question word
      const question = endsWithQuestion ? transcript.trim() : transcript.trim() + '?';

      // Check if this question already exists
      const alreadyExists = questions.some(q =>
        q.question.toLowerCase() === question.toLowerCase()
      );

      if (!alreadyExists) {
        // New question detected
        setDetectedQuestion(question);
      }
    }
  }, [transcript, questions, onQuestionsChange]);

  // Generate answers for detected question
  useEffect(() => {
    if (!detectedQuestion) return;

    const generateAnswers = async () => {
      // Extract trigger word from question
      const triggerWord = extractTriggerWord(detectedQuestion);

      // Extract lock word (second-longest word) from question
      const lockWord = extractLockWord(detectedQuestion);

      // Check if there's already an active question
      const hasActiveQuestion = questions.some(q => q.isActive);

      // Create new question card with 'generating' status
      const newCard: QuestionCard = {
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question: detectedQuestion,
        timestamp: new Date(),
        answers: {
          answer1: {
            heading: '',
            brief: '',
            bullets: [],
            full: '',
            keywords: ['', ''],
          },
          answer2: {
            heading: '',
            brief: '',
            bullets: [],
            full: '',
            keywords: ['', ''],
          },
        },
        status: 'generating',
        keywordsDetected: [],
        isVisible: true,
        lockWord,
        isLocked: false,
        triggerWord,
        isActive: !hasActiveQuestion, // Only active if no other active question
      };

      // Add to questions list
      onQuestionsChange([...questions, newCard]);
      setDetectedQuestion(null);

      try {
        // Call API to generate answers with keywords
        const data = await apiPost<{
          answer1: {
            heading: string;
            brief: string;
            bullets: string[];
            full: string;
            keywords: [string, string];
          };
          answer2: {
            heading: string;
            brief: string;
            bullets: string[];
            full: string;
            keywords: [string, string];
          };
        }>('/api/answer-question-with-keywords', {
          question: newCard.question,
          knowledgeBase,
          model: selectedModel,
          tone: selectedTone,
        });

        // Update card with generated answers
        onQuestionsChange((prevQuestions: QuestionCard[]) =>
          prevQuestions.map((q: QuestionCard) =>
            q.id === newCard.id
              ? {
                  ...q,
                  answers: {
                    answer1: data.answer1,
                    answer2: data.answer2,
                  },
                  status: 'ready' as const,
                }
              : q
          )
        );
      } catch (error) {
        console.error('Failed to generate answers:', error);

        // Determine error type from message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isRateLimit = errorMessage.includes('Rate limited');

        // Update card with error status instead of deleting it
        onQuestionsChange((prevQuestions: QuestionCard[]) =>
          prevQuestions.map((q: QuestionCard) =>
            q.id === newCard.id
              ? {
                  ...q,
                  status: 'error' as const,
                  errorMessage: isRateLimit
                    ? 'Rate limited - please wait a moment before asking more questions'
                    : 'Failed to generate answer - please try again',
                }
              : q
          )
        );

        // Error is logged to console - question card shows error state
        console.error('Failed to generate answers for question:', newCard.question, errorMessage);
      }
    };

    generateAnswers();
  }, [detectedQuestion, knowledgeBase, selectedModel, onQuestionsChange]);

  // Intersection Observer to track visible cards
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardId = entry.target.getAttribute('data-card-id');
          if (!cardId) return;

          // Update visibility status
          onQuestionsChange((prevQuestions: QuestionCard[]) =>
            prevQuestions.map((q: QuestionCard) =>
              q.id === cardId ? { ...q, isVisible: entry.isIntersecting } : q
            )
          );
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // At least 50% visible
      }
    );

    // Observe all question cards
    const cards = containerRef.current.querySelectorAll('[data-card-id]');
    cards.forEach(card => observer.observe(card));

    return () => {
      observer.disconnect();
    };
  }, [questions.length, onQuestionsChange]);

  // Use keyword detection hook
  useKeywordDetection({
    questions,
    onQuestionsChange,
    transcript,
  });

  // Auto-scroll to newest question
  useEffect(() => {
    if (questions.length > 0) {
      // Scroll to bottom to show newest question
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [questions.length]);

  // Handle manual answer selection (for debugging/testing)
  const handleSelectAnswer = useCallback((cardId: string, answerIndex: 1 | 2) => {
    onQuestionsChange((prevQuestions: QuestionCard[]) =>
      prevQuestions.map((q: QuestionCard) =>
        q.id === cardId
          ? {
              ...q,
              selectedAnswer: answerIndex,
              status: 'answered' as const,
            }
          : q
      )
    );
  }, [onQuestionsChange]);

  // Separate questions by status (must be before early returns to maintain hook order)
  const activeQuestion = questions.find(q => q.isActive);
  const pendingQuestions = questions.filter(q => !q.isActive && q.status !== 'answered');
  const answeredQuestions = questions.filter(q => q.status === 'answered');

  // Handle activating a pending question (by clicking or saying trigger word)
  const handleActivateQuestion = useCallback((questionId: string) => {
    onQuestionsChange((prev: QuestionCard[]) =>
      prev.map((q: QuestionCard) => ({
        ...q,
        isActive: q.id === questionId,
      }))
    );
  }, [onQuestionsChange]);

  // Handle deleting a pending question
  const handleDeleteQuestion = useCallback((questionId: string) => {
    onQuestionsChange((prev: QuestionCard[]) => prev.filter((q: QuestionCard) => q.id !== questionId));
  }, [onQuestionsChange]);

  // Handle manual question submission
  const handleManualQuestionSubmit = () => {
    const trimmedQuestion = manualQuestion.trim();
    if (!trimmedQuestion) return;

    // Add ? if not present
    const question = trimmedQuestion.endsWith('?') ? trimmedQuestion : trimmedQuestion + '?';

    // Check if this question already exists
    const alreadyExists = questions.some(q =>
      q.question.toLowerCase() === question.toLowerCase()
    );

    if (!alreadyExists) {
      setDetectedQuestion(question);
      setManualQuestion(''); // Clear input
    } else {
      console.log('Question already exists:', question);
    }
  };

  // Detect trigger words from transcript to activate pending questions
  useEffect(() => {
    // Only process new transcripts
    if (!transcript || transcript === lastTriggerTranscriptRef.current) return;

    const normalizedTranscript = transcript.toLowerCase();

    // Get pending questions (not active and not answered)
    const pending = questions.filter(q => !q.isActive && q.status !== 'answered');

    if (pending.length === 0) return;

    // Check if any trigger word was spoken
    for (const question of pending) {
      if (question.triggerWord && normalizedTranscript.includes(question.triggerWord.toLowerCase())) {
        console.log(`🎯 Trigger word "${question.triggerWord}" detected - activating question: ${question.question}`);
        lastTriggerTranscriptRef.current = transcript; // Mark this transcript as processed
        handleActivateQuestion(question.id);
        return; // Exit after first match
      }
    }

    // Update last processed transcript even if no match (prevents re-checking same transcript)
    lastTriggerTranscriptRef.current = transcript;
  }, [transcript, questions, handleActivateQuestion]);

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        {/* Session Stats - Always show */}
        <SessionStats questions={questions} elapsedTime={elapsedTime} />

        {/* Instruction Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🎤</div>
            <div>
              <h3 className="font-bold text-blue-900 text-lg mb-2">Ready to Answer Your Questions!</h3>
              <div className="text-blue-800 space-y-2">
                <p className="font-medium">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                  <li><strong>Speak your question</strong> out loud (must end with "?")</li>
                  <li><strong>AI generates 2 answer options</strong> with keywords highlighted</li>
                  <li><strong>Say a keyword</strong> (the blue highlighted words) to select an answer</li>
                  <li><strong>Ask another question</strong> or say "next" to continue</li>
                </ol>
                <p className="text-sm mt-3 bg-white p-2 rounded border border-blue-300">
                  💡 <strong>Example:</strong> "Are you a good fit for this position?" → Say "technical" or "leadership" to choose an answer
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center h-[300px] border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">🎤 Listening for your first question...</p>
            <p className="text-sm">Speak clearly and end with "?"</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine current status message
  const getStatusMessage = () => {
    if (!activeQuestion) {
      if (pendingQuestions.length > 0) {
        return {
          emoji: '⏳',
          title: 'Unanswered Questions in Queue',
          message: 'Click a question or say its trigger word to activate it',
          color: 'amber'
        };
      }

      return {
        emoji: '🎤',
        title: 'Listening for Next Question',
        message: 'Speak your question ending with "?" or say "next" to continue',
        color: 'blue'
      };
    }

    if (activeQuestion.status === 'generating') {
      return {
        emoji: '⚙️',
        title: 'AI Generating Answers...',
        message: 'Please wait while I prepare answer options with selectable keywords',
        color: 'amber'
      };
    }

    if (activeQuestion.status === 'ready') {
      const keywords = [
        ...activeQuestion.answers.answer1.keywords,
        ...activeQuestion.answers.answer2.keywords
      ].filter(k => k.length > 0);

      return {
        emoji: '💬',
        title: 'Say a Keyword to Select an Answer',
        message: `Available keywords: ${keywords.map(k => `"${k}"`).join(', ')}`,
        color: 'green'
      };
    }

    if (activeQuestion.status === 'confirming') {
      const detected = activeQuestion.keywordsDetected.map(k => `"${k}"`).join(', ');
      return {
        emoji: '🔵',
        title: `First Keyword Detected: ${detected}`,
        message: 'Say the SECOND keyword from the same answer to confirm',
        color: 'blue'
      };
    }

    return {
      emoji: '🎤',
      title: 'Ready for Next Question',
      message: 'Ask another question or say "next"',
      color: 'blue'
    };
  };

  const status = getStatusMessage();

  // Map status color to Tailwind classes
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'text-blue-900',
      text: 'text-blue-700',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      title: 'text-amber-900',
      text: 'text-amber-700',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: 'text-green-900',
      text: 'text-green-700',
    },
  };

  const colors = colorClasses[status.color as keyof typeof colorClasses];

  return (
    <div className="space-y-2">
      {/* Session Stats */}
      <SessionStats questions={questions} elapsedTime={elapsedTime} />

      {/* Export Button */}
      <div className="flex justify-end">
        <ExportSession questions={questions} elapsedTime={elapsedTime} />
      </div>

      {/* Manual Question Input - Always Available */}
      <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={manualQuestion}
            onChange={(e) => setManualQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleManualQuestionSubmit();
              }
            }}
            placeholder="Type a question manually (press Enter to submit)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="manual-question-input"
          />
          <button
            onClick={handleManualQuestionSubmit}
            disabled={!manualQuestion.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            data-testid="submit-manual-question"
          >
            Ask
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Type a question and press Enter, or use voice by speaking your question ending with "?"
        </p>
      </div>

      {/* Status Banner - Compact */}
      <div className={`${colors.bg} border ${colors.border} rounded-lg p-2`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{status.emoji}</span>
          <p className={`${colors.title} text-xs font-semibold flex-1`}>{status.title}</p>
        </div>
      </div>

      {/* Current Active Question */}
      {activeQuestion && (
        <div ref={containerRef} data-card-id={activeQuestion.id}>
          <KnowItAllQuestionCard
            question={activeQuestion}
            onSelectAnswer={handleSelectAnswer}
          />
        </div>
      )}

      {/* Pending Questions Queue */}
      {pendingQuestions.length > 0 && (
        <div className="border-2 border-amber-200 bg-amber-50 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-amber-100 border-b border-amber-200">
            <span className="text-xs font-semibold text-amber-900">
              ⏳ Unanswered Questions ({pendingQuestions.length})
            </span>
          </div>
          <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
            {pendingQuestions.map((q) => (
              <div
                key={q.id}
                className="relative group rounded-lg border-2 border-amber-300 bg-white hover:bg-amber-50 hover:border-amber-400 transition-all"
                data-testid={`pending-question-${q.id}`}
              >
                <button
                  onClick={() => handleActivateQuestion(q.id)}
                  className="w-full text-left p-3"
                >
                  <p className="text-sm font-semibold text-gray-800 mb-2 pr-8">{q.question}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-700">Say trigger word:</span>
                    <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded">
                      {q.triggerWord?.toUpperCase()}
                    </span>
                    <span className="text-xs text-amber-600">or click to activate</span>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuestion(q.id);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete question"
                  data-testid={`delete-question-${q.id}`}
                >
                  <span className="text-sm font-bold">×</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answered Questions History - Condensed View */}
      {answeredQuestions.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <details>
            <summary className="cursor-pointer bg-gray-50 px-3 py-2 hover:bg-gray-100 transition-colors">
              <span className="text-xs font-semibold text-gray-700">
                📋 Previous Questions ({answeredQuestions.length})
              </span>
            </summary>
            <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
              {[...answeredQuestions].reverse().map((q) => {
                const selectedAnswer = q.selectedAnswer === 1 ? q.answers.answer1 : q.answers.answer2;
                return (
                  <div key={q.id} className="border-l-4 border-green-500 pl-3 py-2 bg-gray-50 rounded-r">
                    <p className="text-xs font-semibold text-gray-800 mb-1">{q.question}</p>
                    <p className="text-xs text-gray-600">✓ {selectedAnswer.heading}</p>
                  </div>
                );
              })}
            </div>
          </details>
        </div>
      )}

      {/* Question Trigger Words Reference - Collapsed by default */}
      <div className="border rounded-lg overflow-hidden">
        <details>
          <summary className="cursor-pointer bg-blue-50 px-3 py-2 hover:bg-blue-100 transition-colors">
            <span className="text-xs font-semibold text-blue-700">
              🎯 Question Trigger Words (68 phrases)
            </span>
          </summary>
          <div className="p-3 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Question Words */}
              <div className="space-y-1">
                <div className="font-bold text-gray-700">Question Words (9)</div>
                <div className="text-gray-600 leading-relaxed">
                  how, what, when, where, who, why, which, whose, whom
                </div>
              </div>

              {/* Modal Phrases */}
              <div className="space-y-1">
                <div className="font-bold text-gray-700">Modal Phrases (11)</div>
                <div className="text-gray-600 leading-relaxed">
                  can you, could you, would you, will you, should you, may i, might you, shall we, would it, could it, can it
                </div>
              </div>

              {/* Verb Starters */}
              <div className="space-y-1">
                <div className="font-bold text-gray-700">Verb Starters (18)</div>
                <div className="text-gray-600 leading-relaxed">
                  do you, does, did you, have you, has, is, are, was, were, am, been, had, will, would, could, should
                </div>
              </div>

              {/* Command Starters */}
              <div className="space-y-1">
                <div className="font-bold text-gray-700">Command Starters (16)</div>
                <div className="text-gray-600 leading-relaxed">
                  tell me, explain, describe, give me, show me, help me, talk about, discuss, share, elaborate, clarify, define, compare, contrast, demonstrate, illustrate, outline
                </div>
              </div>

              {/* Conversational Starters */}
              <div className="col-span-1 md:col-span-2 space-y-1">
                <div className="font-bold text-gray-700">Conversational Starters (14)</div>
                <div className="text-gray-600 leading-relaxed">
                  i wonder, i'm wondering, i'd like to know, wondering about, curious about, question about, ask about, thinking about, let me know, let's talk about, let's discuss, can we talk about, wanna know, want to know, need to know, trying to understand
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              💡 Any phrase starting with these words (or ending with "?") will be detected as a question
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

/**
 * useKeywordDetection - Viewport-aware keyword detection for Know It All Wall
 * Only detects keywords from visible questions, requires 2 keywords from same answer
 */

import { useEffect, useRef } from 'react';
import { QuestionCard } from '../lib/know-it-all-types';
import { normalizeToken, createTokenPattern } from '../lib/script-parser';
import { useSoundEffects } from './useSoundEffects';

interface UseKeywordDetectionProps {
  /** All questions in the session */
  questions: QuestionCard[];

  /** Callback to update questions */
  onQuestionsChange: (questionsOrUpdater: QuestionCard[] | ((prev: QuestionCard[]) => QuestionCard[])) => void;

  /** Current transcript from voice recognition */
  transcript: string;
}

export function useKeywordDetection({
  questions,
  onQuestionsChange,
  transcript,
}: UseKeywordDetectionProps) {
  const lastTranscriptRef = useRef<string>('');
  const { playSound } = useSoundEffects();

  useEffect(() => {
    // Only process new transcript segments
    if (!transcript || transcript === lastTranscriptRef.current) {
      return;
    }

    lastTranscriptRef.current = transcript;

    // Normalize transcript for matching
    const normalizedTranscript = normalizeToken(transcript);

    // Check for "back" command to reset confirming questions
    const backWords = ['back', 'cancel', 'reset', 'undo'];
    const hasBackCommand = backWords.some(word =>
      normalizedTranscript.includes(word) || transcript.toLowerCase().includes(word)
    );

    if (hasBackCommand) {
      // Find any question in 'confirming' state and reset it
      const confirmingQuestion = questions.find(q => q.status === 'confirming' && q.isVisible);

      if (confirmingQuestion) {
        console.log(`⬅️ Back command detected - resetting question: ${confirmingQuestion.question}`);

        onQuestionsChange(
          questions.map(q =>
            q.id === confirmingQuestion.id
              ? {
                  ...q,
                  keywordsDetected: [],
                  status: 'ready' as const,
                }
              : q
          )
        );

        return; // Exit after handling back command
      }
    }

    // Get visible questions that are ready or confirming
    const activeQuestions = questions.filter(
      q => q.isVisible && (q.status === 'ready' || q.status === 'confirming')
    );

    if (activeQuestions.length === 0) {
      return;
    }

    // Check each active question for keyword matches
    for (const question of activeQuestions) {
      // Check both answers for keyword matches
      for (const [answerKey, answer] of Object.entries(question.answers)) {
        const answerIndex = answerKey === 'answer1' ? 1 : 2;

        // Check if both keywords from this answer are present
        const [keyword1, keyword2] = answer.keywords;

        // Skip if keywords are not set
        if (!keyword1 || !keyword2) continue;

        // Create patterns for both keywords
        const pattern1 = createTokenPattern(keyword1);
        const pattern2 = createTokenPattern(keyword2);

        // Check if keywords match in transcript
        const match1 = pattern1.test(normalizedTranscript) || pattern1.test(transcript);
        const match2 = pattern2.test(normalizedTranscript) || pattern2.test(transcript);

        // Track which keywords have been detected
        const detectedKeywords = question.keywordsDetected.map(k => k.toLowerCase());
        const keyword1Lower = keyword1.toLowerCase();
        const keyword2Lower = keyword2.toLowerCase();

        if (match1 && !detectedKeywords.includes(keyword1Lower)) {
          // First keyword detected
          console.log(`🔑 Keyword detected: "${keyword1}" for question: ${question.question}`);

          // Play sound effect
          playSound('keyword-detected');

          onQuestionsChange(
            questions.map(q =>
              q.id === question.id
                ? {
                    ...q,
                    keywordsDetected: [...q.keywordsDetected, keyword1Lower],
                    status: 'confirming' as const,
                  }
                : q
            )
          );

          return; // Exit after first keyword detection
        }

        if (match2 && !detectedKeywords.includes(keyword2Lower)) {
          // Second keyword detected
          console.log(`🔑 Keyword detected: "${keyword2}" for question: ${question.question}`);

          const updatedDetected = [...question.keywordsDetected, keyword2Lower];

          // Check if both keywords are now detected
          if (
            updatedDetected.includes(keyword1Lower) &&
            updatedDetected.includes(keyword2Lower)
          ) {
            // Both keywords confirmed - answer selected!
            console.log(`✅ Answer ${answerIndex} confirmed for: ${question.question}`);

            // Play answer selected sound
            playSound('answer-selected');

            // Immediately update to show selection, then mark as answered after delay
            onQuestionsChange(
              questions.map(q =>
                q.id === question.id
                  ? {
                      ...q,
                      keywordsDetected: updatedDetected,
                      selectedAnswer: answerIndex,
                      status: 'confirming' as const, // Keep in confirming state briefly
                    }
                  : q
              )
            );

            // Add 1.5 second delay before marking as answered (lets user see the selection)
            setTimeout(() => {
              onQuestionsChange((prev: QuestionCard[]) =>
                prev.map((q: QuestionCard) =>
                  q.id === question.id
                    ? {
                        ...q,
                        status: 'answered' as const,
                      }
                    : q
                )
              );
            }, 1500);

            return; // Exit after answer confirmation
          } else {
            // Only one keyword detected so far
            playSound('keyword-detected');

            onQuestionsChange(
              questions.map(q =>
                q.id === question.id
                  ? {
                      ...q,
                      keywordsDetected: updatedDetected,
                      status: 'confirming' as const,
                    }
                  : q
              )
            );

            return;
          }
        }
      }
    }
  }, [transcript, questions, onQuestionsChange]);
}

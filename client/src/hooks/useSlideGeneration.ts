import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api-config';
import type { Question, QuestionTypePreferences, SlideOption } from '@/components/create/types';
import type { Section } from '@/lib/script-parser';

export function useSlideGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Generate questions from topic
  const generateQuestions = useCallback(async (
    topic: string,
    model: string,
    preferences: QuestionTypePreferences | null
  ): Promise<Question[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-questions`, {
        topic: topic.trim(),
        model,
        preferences,
      });

      return response.data.questions;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to generate questions';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate slide options from answers - NOW SEQUENTIAL (one slide at a time)
  const generateSlideOptions = useCallback(async (
    topic: string,
    questions: Question[],
    answers: Record<string, string>,
    numSlides: number,
    model: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<SlideOption[]> => {
    setError(null);

    try {
      const formattedAnswers = questions.map(q => ({
        question: q.question,
        answer: answers[q.id],
      }));

      const slides: SlideOption[] = [];

      // Generate slides sequentially
      for (let i = 1; i <= numSlides; i++) {
        setIsLoading(true);
        onProgress?.(i, numSlides);

        const response = await axios.post(`${API_BASE_URL}/api/generate-slide-options`, {
          topic: topic.trim(),
          answers: formattedAnswers,
          sectionNumber: i,
          totalSections: numSlides,
          model,
        });

        slides.push(response.data.slide);
      }

      return slides;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to generate slides';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate speaker notes - BATCH API (all slides at once)
  const generateSpeakerNotes = useCallback(async (
    slides: SlideOption[],
    topic: string,
    answers: Record<string, string>,
    model: string
  ): Promise<Array<{ profoundStatement: string; talkingPoints: { data: string; vision: string; proof: string }; highImpactParagraph: string }>> => {
    setIsLoading(true);
    setError(null);

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question: questionId,
        answer
      }));

      const response = await axios.post(`${API_BASE_URL}/api/generate-speaker-notes`, {
        slides,
        topic: topic.trim(),
        answers: formattedAnswers,
        model,
      });

      return response.data.speakerNotes;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to generate speaker notes';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create final sections (with or without speaker notes)
  const createSections = useCallback((
    slides: SlideOption[],
    speakerNotes?: Array<{ profoundStatement: string; talkingPoints: { data: string; vision: string; proof: string }; highImpactParagraph: string }>
  ): Section[] => {
    return slides.map((slide, index) => {
      const normalizedPrimary = slide.primaryTrigger.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedAlternatives = slide.alternativeTriggers.map(t =>
        t.toLowerCase().replace(/[^a-z0-9]/g, '')
      );

      // Build content from TalkAdvantage Pro format (if available) or use old format
      let content = slide.content || '';
      if (!content && slide.heading) {
        // New TalkAdvantage Pro format - combine heading + visualElements
        content = slide.heading;
        if (slide.subtext) {
          content += `\n\n${slide.subtext}`;
        }
        if (slide.visualElements && slide.visualElements.length > 0) {
          content += '\n\n' + slide.visualElements.join('\n');
        }
      }

      const section: Section = {
        id: `section-${index}`,
        content,
        advanceToken: normalizedPrimary,
        alternativeTriggers: slide.alternativeTriggers,
        selectedTriggers: [normalizedPrimary, ...normalizedAlternatives],
      };

      // Add TalkAdvantage Pro fields if available
      if (slide.heading) {
        section.heading = slide.heading;
      }
      if (slide.subtext) {
        section.subtext = slide.subtext;
      }
      if (slide.visualElements) {
        section.visualElements = slide.visualElements;
      }
      if (slide.recommendedImage) {
        section.recommendedImage = slide.recommendedImage;
      }

      // Attach structured speaker notes if available
      if (speakerNotes && speakerNotes[index]) {
        section.structuredSpeakerNotes = speakerNotes[index];
      }

      return section;
    });
  }, []);

  return {
    isLoading,
    error,
    clearError,
    generateQuestions,
    generateSlideOptions,
    generateSpeakerNotes,
    createSections,
  };
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Sparkles, Loader2, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import type { Section } from '@/lib/script-parser';
import { API_BASE_URL } from '@/lib/api-config';

interface CreateFromScratchProps {
  onSectionsGenerated: (sections: Section[]) => void;
  selectedModel: string;
}

type Question = {
  id: string;
  type: 'multiple_choice' | 'fill_in_blank';
  question: string;
  options?: string[];
  placeholder?: string;
};

type SlideOption = {
  content: string;
  primaryTrigger: string;
  alternativeTriggers: string[];
  style: string;
};

type Slide = {
  position: number;
  title: string;
  options: SlideOption[];
};

type Step = 'topic' | 'questions' | 'slides' | 'review';

export function CreateFromScratch({ onSectionsGenerated, selectedModel }: CreateFromScratchProps) {
  const [step, setStep] = useState<Step>('topic');
  const [topic, setTopic] = useState('');
  const [numSlides, setNumSlides] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({}); // slidePosition -> optionIndex
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Generate questions from topic
  const handleGenerateQuestions = async () => {
    if (!topic.trim()) {
      setError('Please enter a presentation topic');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-questions`, {
        topic: topic.trim(),
        model: selectedModel,
      });

      setQuestions(response.data.questions);
      setStep('questions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate questions');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Generate slide options from answers
  const handleGenerateSlides = async () => {
    // Validate all questions are answered
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setError('Please answer all questions before continuing');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formattedAnswers = questions.map(q => ({
        question: q.question,
        answer: answers[q.id],
      }));

      const response = await axios.post(`${API_BASE_URL}/api/generate-slide-options`, {
        topic: topic.trim(),
        answers: formattedAnswers,
        numSlides,
        model: selectedModel,
      });

      setSlides(response.data.slides);
      // Pre-select first option for each slide
      const initialSelections: Record<number, number> = {};
      response.data.slides.forEach((slide: Slide) => {
        initialSelections[slide.position] = 0;
      });
      setSelectedOptions(initialSelections);
      setStep('slides');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate slides');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Finalize and create sections
  const handleFinalize = () => {
    // Convert selected slide options to Section format
    const sections: Section[] = slides.map((slide, index) => {
      const selectedOption = slide.options[selectedOptions[slide.position]];
      const normalizedPrimary = selectedOption.primaryTrigger.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedAlternatives = selectedOption.alternativeTriggers.map(t =>
        t.toLowerCase().replace(/[^a-z0-9]/g, '')
      );

      return {
        id: `section-${index}`,
        content: selectedOption.content,
        advanceToken: normalizedPrimary,
        alternativeTriggers: selectedOption.alternativeTriggers,
        selectedTriggers: [normalizedPrimary, ...normalizedAlternatives],
      };
    });

    onSectionsGenerated(sections);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setError(null);
  };

  const handleSlideOptionSelect = (slidePosition: number, optionIndex: number) => {
    setSelectedOptions(prev => ({ ...prev, [slidePosition]: optionIndex }));
  };

  const progressPercentage =
    step === 'topic' ? 0 :
    step === 'questions' ? 33 :
    step === 'slides' ? 66 :
    100;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Create from Scratch
          </CardTitle>
          <CardDescription>
            Step {step === 'topic' ? '1' : step === 'questions' ? '2' : step === 'slides' ? '3' : '4'} of 3:
            {step === 'topic' && ' Describe your presentation topic'}
            {step === 'questions' && ' Answer a few questions'}
            {step === 'slides' && ' Choose your preferred slide options'}
          </CardDescription>
          <Progress value={progressPercentage} className="h-2 mt-2" />
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">⚠️ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* STEP 1: Topic Input */}
      {step === 'topic' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                What's your presentation about?
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI-powered meeting assistant for sales teams, Sustainable energy solutions for urban areas..."
                className="w-full h-32 px-4 py-3 rounded-md border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Number of Slides</label>
                <span className="text-2xl font-bold text-blue-600">{numSlides}</span>
              </div>
              <input
                type="range"
                min="3"
                max="25"
                value={numSlides}
                onChange={(e) => setNumSlides(parseInt(e.target.value))}
                className="w-full"
                disabled={isProcessing}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 slides</span>
                <span>25 slides</span>
              </div>
            </div>

            <button
              onClick={handleGenerateQuestions}
              disabled={isProcessing || !topic.trim()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Questions (4 cards displayed simultaneously) */}
      {step === 'questions' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((question, index) => (
              <Card key={question.id} className="border-2 border-blue-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    {question.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {question.type === 'multiple_choice' ? (
                    <div className="space-y-2">
                      {question.options?.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswerChange(question.id, option)}
                          className={`w-full px-4 py-3 rounded-md text-left transition-all border-2 ${
                            answers[question.id] === option
                              ? 'bg-blue-50 border-blue-500 text-blue-900 font-medium'
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder={question.placeholder || 'Your answer...'}
                      className="w-full px-4 py-3 rounded-md border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <button
                onClick={() => setStep('topic')}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleGenerateSlides}
                disabled={isProcessing || questions.some(q => !answers[q.id])}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Slides...
                  </>
                ) : (
                  <>
                    Generate Slides
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        </>
      )}

      {/* STEP 3: Slide Options (4 options per slide) */}
      {step === 'slides' && (
        <>
          <div className="space-y-6">
            {slides.map((slide) => (
              <Card key={slide.position} className="border-2 border-purple-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">
                      {slide.position}
                    </span>
                    {slide.title}
                  </CardTitle>
                  <CardDescription>Choose the version you prefer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {slide.options.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleSlideOptionSelect(slide.position, optIdx)}
                        className={`p-4 rounded-lg text-left transition-all border-2 ${
                          selectedOptions[slide.position] === optIdx
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-white border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                            {option.style}
                          </span>
                          {selectedOptions[slide.position] === optIdx && (
                            <CheckCircle2 className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">
                          {option.content}
                        </p>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Trigger: <span className="font-mono font-semibold">{option.primaryTrigger}</span>
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <button
                onClick={() => setStep('questions')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleFinalize}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Create Presentation
              </button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

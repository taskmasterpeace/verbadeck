import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Slide } from '../types';

interface SlideSelectionStepProps {
  slides: Slide[];
  selectedOptions: Record<number, number>;
  onSlideOptionSelect: (slidePosition: number, optionIndex: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function SlideSelectionStep({
  slides,
  selectedOptions,
  onSlideOptionSelect,
  onBack,
  onContinue,
}: SlideSelectionStepProps) {
  return (
    <>
      <div className="space-y-6">
        {slides.map((slide) => (
          <Card key={slide.position} className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
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
                    onClick={() => onSlideOptionSelect(slide.position, optIdx)}
                    className={`p-4 rounded-lg text-left transition-all border-2 ${
                      selectedOptions[slide.position] === optIdx
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        {option.style}
                      </span>
                      {selectedOptions[slide.position] === optIdx && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
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
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold flex items-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </CardContent>
      </Card>
    </>
  );
}

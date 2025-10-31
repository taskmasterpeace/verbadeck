import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { MessageCircle, Loader2 } from 'lucide-react';
import { type Section } from '@/lib/script-parser';

interface PresenterViewProps {
  currentSection?: Section;
  nextSection?: Section;
  sectionIndex: number;
  totalSections: number;
  progress: number;
  onSectionClick?: (index: number) => void;
  currentQuestion?: string | null;
  questionTalkingPoints?: string[];
  isLoadingQA?: boolean;
}

export function PresenterView({
  currentSection,
  nextSection,
  sectionIndex,
  totalSections,
  progress,
  onSectionClick,
  currentQuestion,
  questionTalkingPoints = [],
  isLoadingQA = false,
}: PresenterViewProps) {
  if (!currentSection) {
    return (
      <Card className="p-8">
        <CardContent className="text-center text-muted-foreground">
          No sections loaded. Enter your script above.
        </CardContent>
      </Card>
    );
  }

  // Render content with trigger words bolded
  const renderContent = (section: Section) => {
    const triggers = section.selectedTriggers || [section.advanceToken];
    const primaryTrigger = triggers[0];

    // If no triggers defined, just return plain text
    if (!primaryTrigger || primaryTrigger.trim() === '') {
      return <p className="whitespace-pre-wrap">{section.content}</p>;
    }

    // Try to find the primary trigger in the content
    let triggerToHighlight = primaryTrigger;
    let triggerIndex = section.content.toLowerCase().indexOf(primaryTrigger.toLowerCase());

    // If primary trigger not found, try alternatives
    if (triggerIndex === -1 && triggers.length > 1) {
      for (const trigger of triggers) {
        const idx = section.content.toLowerCase().indexOf(trigger.toLowerCase());
        if (idx !== -1) {
          triggerToHighlight = trigger;
          triggerIndex = idx;
          break;
        }
      }
    }

    // If no trigger found in content, just return plain text
    if (triggerIndex === -1) {
      return <p className="whitespace-pre-wrap">{section.content}</p>;
    }

    const before = section.content.substring(0, triggerIndex);
    const word = section.content.substring(triggerIndex, triggerIndex + triggerToHighlight.length);
    const after = section.content.substring(triggerIndex + triggerToHighlight.length);

    return (
      <p className="whitespace-pre-wrap">
        {before}
        <strong className="font-bold text-primary underline decoration-2 underline-offset-4">
          {word}
        </strong>
        {after}
      </p>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Current Section - Large Display */}
      <Card className="lg:col-span-2 bg-card border-2 border-primary/20">
        <CardContent className="p-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Section {sectionIndex + 1} of {totalSections}</span>
              <span className="text-xs font-mono">Trigger: "{currentSection.advanceToken}"</span>
            </div>

            {/* Image (if provided) */}
            {currentSection.imageUrl && (
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={currentSection.imageUrl}
                  alt={`Slide ${sectionIndex + 1}`}
                  className="w-full h-auto max-h-96 object-contain bg-muted"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="text-4xl leading-relaxed font-light">
              {renderContent(currentSection)}
            </div>

            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Next Section + Q&A */}
      <div className="flex flex-col gap-4">
        {/* Next Section Preview */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Next Up
              </div>

              {nextSection ? (
                <div className="text-lg opacity-60 leading-relaxed">
                  {renderContent(nextSection)}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  🎉 This is the final section
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Q&A Area (only shown when question is present) */}
        {currentQuestion && (
          <Card className="bg-blue-50 border-2 border-blue-300">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <MessageCircle className="w-5 h-5" />
                  <div className="text-sm font-semibold uppercase tracking-wide">
                    Live Question
                  </div>
                </div>

                {/* Question */}
                <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                  <div className="text-xs font-semibold text-gray-500 mb-2">QUESTION:</div>
                  <div className="text-lg font-medium text-gray-900">{currentQuestion}</div>
                </div>

                {/* AI Talking Points */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2">AI TALKING POINTS:</div>
                  {isLoadingQA ? (
                    <div className="flex items-center gap-2 text-blue-600 p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Generating response...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {questionTalkingPoints.map((point, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 text-sm text-gray-900 bg-white p-2 rounded border">
                            {point}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section Navigation (for testing/setup) */}
      {onSectionClick && totalSections > 1 && (
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Jump to:</span>
              {Array.from({ length: totalSections }, (_, i) => (
                <button
                  key={i}
                  onClick={() => onSectionClick(i)}
                  className={`
                    px-3 py-1 rounded text-sm font-medium transition-colors
                    ${i === sectionIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { type Section } from '@/lib/script-parser';

interface PresenterViewProps {
  currentSection?: Section;
  nextSection?: Section;
  sectionIndex: number;
  totalSections: number;
  progress: number;
  onSectionClick?: (index: number) => void;
}

export function PresenterView({
  currentSection,
  nextSection,
  sectionIndex,
  totalSections,
  progress,
  onSectionClick,
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
  // If speaker notes exist, show those to the presenter instead of slide content
  const renderContent = (section: Section) => {
    const triggers = section.selectedTriggers || [section.advanceToken];
    const primaryTrigger = triggers[0];

    // Use speaker notes if available, otherwise use slide content
    const textToDisplay = section.speakerNotes || section.content;
    const isShowingNotes = !!section.speakerNotes;

    // If no triggers defined, just return plain text
    if (!primaryTrigger || primaryTrigger.trim() === '') {
      return (
        <div>
          {isShowingNotes && (
            <div className="mb-2 px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs text-amber-900 font-medium">
              📝 Speaker Notes (audience sees slide content)
            </div>
          )}
          <p className="whitespace-pre-wrap">{textToDisplay}</p>
        </div>
      );
    }

    // Try to find the primary trigger in the text
    let triggerToHighlight = primaryTrigger;
    let triggerIndex = textToDisplay.toLowerCase().indexOf(primaryTrigger.toLowerCase());

    // If primary trigger not found, try alternatives
    if (triggerIndex === -1 && triggers.length > 1) {
      for (const trigger of triggers) {
        const idx = textToDisplay.toLowerCase().indexOf(trigger.toLowerCase());
        if (idx !== -1) {
          triggerToHighlight = trigger;
          triggerIndex = idx;
          break;
        }
      }
    }

    // If no trigger found in text, just return plain text
    if (triggerIndex === -1) {
      return (
        <div>
          {isShowingNotes && (
            <div className="mb-2 px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs text-amber-900 font-medium">
              📝 Speaker Notes (audience sees slide content)
            </div>
          )}
          <p className="whitespace-pre-wrap">{textToDisplay}</p>
        </div>
      );
    }

    const before = textToDisplay.substring(0, triggerIndex);
    const word = textToDisplay.substring(triggerIndex, triggerIndex + triggerToHighlight.length);
    const after = textToDisplay.substring(triggerIndex + triggerToHighlight.length);

    return (
      <div>
        {isShowingNotes && (
          <div className="mb-2 px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs text-amber-900 font-medium">
            📝 Speaker Notes (audience sees slide content)
          </div>
        )}
        <p className="whitespace-pre-wrap">
          {before}
          <strong className="font-bold text-primary underline decoration-2 underline-offset-4">
            {word}
          </strong>
          {after}
        </p>
      </div>
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

      {/* Right Column: Next Section */}
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

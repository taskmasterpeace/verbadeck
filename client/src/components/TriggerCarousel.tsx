import { type Section } from '@/lib/script-parser';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TriggerCarouselProps {
  currentSection?: Section;
  previousSection?: Section;
  nextSection?: Section;
  sectionIndex: number;
}

export function TriggerCarousel({
  currentSection,
  previousSection,
  nextSection,
  sectionIndex,
}: TriggerCarouselProps) {
  if (!currentSection) return null;

  const currentTriggers = currentSection.selectedTriggers || [currentSection.advanceToken];
  const primaryTrigger = currentTriggers[0];
  const nextTrigger = nextSection?.selectedTriggers?.[0] || nextSection?.advanceToken;
  const prevTrigger = previousSection?.selectedTriggers?.[0] || previousSection?.advanceToken;

  return (
    <div className="fixed bottom-16 left-0 right-0 pointer-events-none z-40">
      <div className="container mx-auto px-4">
        <div className="relative flex items-end justify-center">
          {/* Left: Previous trigger or Back command */}
          <div className="absolute left-0 bottom-0 opacity-30 text-xs">
            {sectionIndex > 0 ? (
              <div className="flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <div className="text-muted-foreground">
                  Say "back"
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground italic">
                First slide
              </div>
            )}
          </div>

          {/* Center: Current trigger words - compact version */}
          <div className="bg-card border border-primary rounded-lg px-4 py-2 shadow-lg pointer-events-auto">
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <span className="text-xs text-muted-foreground">Say:</span>
              {currentTriggers.slice(0, 3).map((trigger, index) => (
                <div
                  key={trigger}
                  className={`
                    px-2 py-1 rounded font-mono text-sm font-semibold
                    ${index === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                    }
                  `}
                >
                  "{trigger}"
                </div>
              ))}
            </div>
          </div>

          {/* Right: Next trigger */}
          <div className="absolute right-0 bottom-0 opacity-30 text-xs">
            {nextTrigger ? (
              <div className="flex items-center gap-1">
                <div className="text-muted-foreground text-right">
                  Next: "{nextTrigger}"
                </div>
                <ArrowRight className="w-3 h-3" />
              </div>
            ) : (
              <div className="text-muted-foreground italic">
                Last slide
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

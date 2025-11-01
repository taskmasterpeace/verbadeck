import { type Section } from '@/lib/script-parser';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';

interface AudienceViewProps {
  currentSection?: Section;
  sectionIndex: number;
  totalSections: number;
  progress: number;
}

export function AudienceView({
  currentSection,
  sectionIndex,
  totalSections,
  progress,
}: AudienceViewProps) {
  if (!currentSection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Waiting for presentation...</p>
      </div>
    );
  }

  // Check if we have an image
  const hasImage = !!currentSection.imageUrl;
  const isImageOnly = currentSection.imageOnly && hasImage;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Image only mode - fullscreen image */}
      {isImageOnly ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted">
          <img
            src={currentSection.imageUrl}
            alt={`Slide ${sectionIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              console.error('Failed to load image:', currentSection.imageUrl);
            }}
          />

          {/* Progress bar at bottom */}
          <div className="mt-8 w-full max-w-md space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-muted-foreground text-center">
              Slide {sectionIndex + 1} of {totalSections}
            </div>
          </div>
        </div>
      ) : hasImage ? (
        /* Has image but not image-only - split 50/50 */
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image side */}
          <div className="flex items-center justify-center bg-muted p-8">
            <img
              src={currentSection.imageUrl}
              alt={`Slide ${sectionIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                console.error('Failed to load image:', currentSection.imageUrl);
              }}
            />
          </div>

          {/* Text side */}
          <div className="flex flex-col items-center justify-center p-12">
            <div className="text-4xl leading-relaxed font-light text-center max-w-2xl">
              {currentSection.content}
            </div>

            {/* Progress bar at bottom of text section */}
            <div className="mt-12 w-full max-w-md space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="text-sm text-muted-foreground text-center">
                Slide {sectionIndex + 1} of {totalSections}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No image - fullscreen text */
        <div className="flex-1 flex flex-col items-center justify-center p-16">
          <div className="text-5xl leading-relaxed font-light text-center max-w-4xl">
            {currentSection.content}
          </div>

          {/* Progress bar */}
          <div className="mt-12 w-full max-w-md space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-muted-foreground text-center">
              Slide {sectionIndex + 1} of {totalSections}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

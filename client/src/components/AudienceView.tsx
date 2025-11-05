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
  const layout = currentSection.layout || 'balanced';

  // Render progress bar component (reused across layouts)
  const ProgressBar = () => (
    <div className="mt-8 w-full max-w-md space-y-2">
      <Progress value={progress} className="h-2" />
      <div className="text-sm text-muted-foreground text-center">
        Slide {sectionIndex + 1} of {totalSections}
      </div>
    </div>
  );

  // Render heading component (reused across layouts)
  const Heading = ({ size = 'large' }: { size?: 'small' | 'medium' | 'large' | 'xlarge' }) => {
    const sizeClasses = {
      small: 'text-3xl mb-2 pb-2',
      medium: 'text-4xl mb-3 pb-3',
      large: 'text-5xl mb-4 pb-4',
      xlarge: 'text-6xl mb-6 pb-6',
    };
    return (
      <h2 className={`${sizeClasses[size]} font-bold text-primary text-center border-b-2 border-primary/20`}>
        {currentSection.heading || `Section ${sectionIndex + 1}`}
      </h2>
    );
  };

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
          <ProgressBar />
        </div>
      ) : hasImage ? (
        /* Has image - render based on layout */
        <>
          {layout === 'balanced' && (
            /* Balanced: 50/50 side-by-side */
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
                <div className="space-y-6 max-w-2xl">
                  <Heading size="large" />
                  <div className="text-4xl leading-relaxed font-light text-center">
                    {currentSection.content}
                  </div>
                </div>
                <ProgressBar />
              </div>
            </div>
          )}

          {layout === 'image-top' && (
            /* Image Top: Full-width image on top, text below */
            <div className="flex-1 flex flex-col">
              {/* Image section */}
              <div className="flex items-center justify-center bg-muted p-8 h-1/2">
                <img
                  src={currentSection.imageUrl}
                  alt={`Slide ${sectionIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    console.error('Failed to load image:', currentSection.imageUrl);
                  }}
                />
              </div>

              {/* Text section */}
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="space-y-6 max-w-3xl">
                  <Heading size="medium" />
                  <div className="text-3xl leading-relaxed font-light text-center">
                    {currentSection.content}
                  </div>
                </div>
                <ProgressBar />
              </div>
            </div>
          )}

          {layout === 'image-bottom' && (
            /* Image Bottom: Text on top, full-width image below */
            <div className="flex-1 flex flex-col">
              {/* Text section */}
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="space-y-6 max-w-3xl">
                  <Heading size="medium" />
                  <div className="text-3xl leading-relaxed font-light text-center">
                    {currentSection.content}
                  </div>
                </div>
              </div>

              {/* Image section */}
              <div className="flex items-center justify-center bg-muted p-8 h-1/2">
                <img
                  src={currentSection.imageUrl}
                  alt={`Slide ${sectionIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    console.error('Failed to load image:', currentSection.imageUrl);
                  }}
                />
              </div>

              <div className="pb-8 flex justify-center">
                <ProgressBar />
              </div>
            </div>
          )}

          {layout === 'image-focus' && (
            /* Image Focus: Large image with small text caption */
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted">
              <div className="space-y-6 max-w-5xl flex flex-col items-center">
                <Heading size="medium" />
                <img
                  src={currentSection.imageUrl}
                  alt={`Slide ${sectionIndex + 1}`}
                  className="max-w-full max-h-[60vh] object-contain"
                  onError={(e) => {
                    console.error('Failed to load image:', currentSection.imageUrl);
                  }}
                />
                <div className="text-2xl leading-relaxed font-light text-center max-w-2xl">
                  {currentSection.content}
                </div>
                <ProgressBar />
              </div>
            </div>
          )}

          {layout === 'text-focus' && (
            /* Text Focus: Large text with small image thumbnail */
            <div className="flex-1 flex flex-col items-center justify-center p-16">
              <div className="space-y-8 max-w-4xl">
                <Heading size="xlarge" />
                <div className="text-5xl leading-relaxed font-light text-center">
                  {currentSection.content}
                </div>
                <div className="flex justify-center mt-8">
                  <img
                    src={currentSection.imageUrl}
                    alt={`Slide ${sectionIndex + 1}`}
                    className="max-w-md max-h-48 object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      console.error('Failed to load image:', currentSection.imageUrl);
                    }}
                  />
                </div>
              </div>
              <ProgressBar />
            </div>
          )}
        </>
      ) : (
        /* No image - fullscreen text */
        <div className="flex-1 flex flex-col items-center justify-center p-16">
          <div className="space-y-8 max-w-4xl">
            <Heading size="xlarge" />
            <div className="text-5xl leading-relaxed font-light text-center">
              {currentSection.content}
            </div>
          </div>
          <ProgressBar />
        </div>
      )}
    </div>
  );
}

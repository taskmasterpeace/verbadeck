import { useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import { type Section } from '@/lib/script-parser';

interface SlidePreviewProps {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  onClose: () => void;
}

export function SlidePreview({
  section,
  sectionIndex,
  totalSections,
  onClose,
}: SlidePreviewProps) {
  const hasImage = !!section.imageUrl;
  const isImageOnly = section.imageOnly && hasImage;

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[300] p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <Eye className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Slide Preview</h2>
          <span className="text-sm text-white/60">
            (What the audience will see)
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          title="Close Preview"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Preview Content */}
      <div className="w-full max-w-7xl h-[80vh] bg-background rounded-lg shadow-2xl overflow-hidden mt-16">
        {/* Render exactly like AudienceView */}
        {isImageOnly ? (
          /* Image only mode - fullscreen image */
          <div className="h-full flex flex-col items-center justify-center p-8 bg-muted">
            <img
              src={section.imageUrl}
              alt={`Slide ${sectionIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Slide indicator */}
            <div className="mt-8 text-sm text-muted-foreground text-center">
              Slide {sectionIndex + 1} of {totalSections}
            </div>
          </div>
        ) : hasImage ? (
          /* Has image but not image-only - split 50/50 */
          <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image side */}
            <div className="flex items-center justify-center bg-muted p-8">
              <img
                src={section.imageUrl}
                alt={`Slide ${sectionIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Text side */}
            <div className="flex flex-col items-center justify-center p-12">
              <div className="text-4xl leading-relaxed font-light text-center max-w-2xl">
                {section.content}
              </div>

              {/* Slide indicator */}
              <div className="mt-12 text-sm text-muted-foreground text-center">
                Slide {sectionIndex + 1} of {totalSections}
              </div>
            </div>
          </div>
        ) : (
          /* No image - fullscreen text */
          <div className="h-full flex flex-col items-center justify-center p-16">
            <div className="text-5xl leading-relaxed font-light text-center max-w-4xl">
              {section.content}
            </div>

            {/* Slide indicator */}
            <div className="mt-12 text-sm text-muted-foreground text-center">
              Slide {sectionIndex + 1} of {totalSections}
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm">
        Press ESC or click X to close
      </div>
    </div>
  );
}

import { Section } from '@/lib/script-parser';
import { Card, CardContent } from '@/components/ui/card';
import { MarkdownRenderer } from './MarkdownRenderer';

interface CurrentSlidePreviewProps {
  section: Section;
}

export function CurrentSlidePreview({ section }: CurrentSlidePreviewProps) {
  const hasImage = !!section.imageUrl;

  return (
    <Card className="bg-blue-50 border-2 border-blue-300">
      <CardContent className="p-3">
        <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1">
          <span>📺</span> Audience View
        </div>

        {/* Mini slide preview - what the audience sees */}
        <div className="bg-white rounded border border-blue-200 p-3 aspect-video flex items-center justify-center overflow-hidden">
          {section.imageOnly && hasImage ? (
            // Image-only mode: just show the image
            <img
              src={section.imageUrl}
              alt="Slide"
              className="max-w-full max-h-full object-contain"
            />
          ) : hasImage ? (
            // Image + text mode: show both in a compact layout
            <div className="grid grid-cols-2 gap-2 w-full h-full text-left">
              <div className="flex items-center justify-center bg-muted/30 rounded p-1">
                <img
                  src={section.imageUrl}
                  alt="Slide"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center text-[0.5rem] leading-tight overflow-y-auto">
                {section.heading && (
                  <div className="font-bold text-[0.6rem] mb-1">{section.heading}</div>
                )}
                <MarkdownRenderer content={section.content} className="text-center" />
              </div>
            </div>
          ) : (
            // Text-only mode: just show the content
            <div className="text-[0.6rem] leading-tight text-center overflow-y-auto max-h-full px-2">
              {section.heading && (
                <div className="font-bold text-[0.7rem] mb-2">{section.heading}</div>
              )}
              <MarkdownRenderer content={section.content} />
            </div>
          )}
        </div>

        {/* Show trigger word info */}
        <div className="mt-2 text-[0.65rem] text-blue-600 text-center">
          Trigger: <span className="font-mono font-semibold">
            {section.selectedTriggers?.[0] || section.advanceToken}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

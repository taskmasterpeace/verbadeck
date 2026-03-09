import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface SectionPreviewPaneProps {
  sectionIndex: number;
  heading: string;
  content: string;
  imageUrl: string;
  imageOnly: boolean;
  speakerNotes: string;
  selectedTriggers: string[];
}

export function SectionPreviewPane({
  sectionIndex,
  heading,
  content,
  imageUrl,
  imageOnly,
  speakerNotes,
  selectedTriggers,
}: SectionPreviewPaneProps) {
  return (
    <>
      <div className="space-y-2">
        {/* Heading Preview (View Mode) - Always show, use section number as fallback */}
        <div className="pb-2 mb-3 border-b-2 border-primary/20">
          <h3 className="text-xl font-bold text-primary">
            {heading || `Section ${sectionIndex + 1}`}
          </h3>
        </div>

        {/* Image Preview (View Mode) */}
        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 w-fit max-w-full mb-2">
            <img
              src={imageUrl}
              alt="Slide preview"
              className="h-48 w-auto object-contain bg-gray-50"
              onError={() => console.error('Failed to load image')}
            />
            {imageOnly && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                Image Only
              </div>
            )}
          </div>
        )}

        {/* Content Preview (View Mode) - Rendered as Markdown */}
        {!imageOnly && (
          <div className="text-base leading-relaxed prose prose-sm max-w-none">
            <MarkdownRenderer content={content} />
          </div>
        )}

        {/* Speaker Notes Preview (if present) - Rendered as Markdown */}
        {speakerNotes && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-xs font-semibold text-amber-900 mb-1">📝 Speaker Notes:</p>
            <div className="text-sm text-amber-800 prose prose-sm max-w-none">
              <MarkdownRenderer content={speakerNotes} />
            </div>
          </div>
        )}
      </div>

      {/* Current Trigger Display (View Mode) */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
        <span>Triggers:</span>
        {selectedTriggers.map((trigger, i) => (
          <Badge key={i} variant={i === 0 ? 'default' : 'outline'} className="text-xs">
            {trigger}
            {i === 0 && ' ★'}
          </Badge>
        ))}
      </div>
    </>
  );
}

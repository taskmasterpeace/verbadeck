import type { SlideLayout } from '@/lib/script-parser';

interface LayoutPickerProps {
  layout: SlideLayout | undefined;
  onLayoutChange: (layout: SlideLayout) => void;
}

/**
 * LayoutPicker Component
 *
 * Displays a 2x2 grid of layout options with visual previews.
 * Shows active state highlighting for the currently selected layout.
 *
 * Enhanced with visual layout previews (Phase 2, Task #4)
 */

// Layout preview component showing visual representation
function LayoutPreview({ type }: { type: SlideLayout }) {
  const imageBox = "bg-blue-300 rounded";
  const textBox = "bg-gray-200 rounded flex items-center justify-center";

  switch (type) {
    case 'balanced':
      return (
        <div className="flex gap-1 h-12 mb-2">
          <div className={`${imageBox} flex-1`} />
          <div className={`${textBox} flex-1 text-[8px] text-gray-500`}>
            <span className="rotate-0">TEXT</span>
          </div>
        </div>
      );
    case 'image-top':
      return (
        <div className="flex flex-col gap-1 h-12 mb-2">
          <div className={`${imageBox} flex-1`} />
          <div className={`${textBox} flex-1 text-[8px] text-gray-500`}>TEXT</div>
        </div>
      );
    case 'image-bottom':
      return (
        <div className="flex flex-col gap-1 h-12 mb-2">
          <div className={`${textBox} flex-1 text-[8px] text-gray-500`}>TEXT</div>
          <div className={`${imageBox} flex-1`} />
        </div>
      );
    case 'image-focus':
      return (
        <div className="flex flex-col gap-1 h-12 mb-2">
          <div className={`${imageBox} flex-[3]`} />
          <div className={`${textBox} flex-1 text-[8px] text-gray-500`}>TEXT</div>
        </div>
      );
    default:
      return null;
  }
}

export function LayoutPicker({ layout, onLayoutChange }: LayoutPickerProps) {
  const layouts: Array<{ type: SlideLayout; emoji: string; name: string; desc: string }> = [
    { type: 'balanced', emoji: '⚖️', name: 'Balanced', desc: 'Image + Text Side-by-Side' },
    { type: 'image-top', emoji: '⬆️', name: 'Image Top', desc: 'Image Above Text' },
    { type: 'image-bottom', emoji: '⬇️', name: 'Image Bottom', desc: 'Text Above Image' },
    { type: 'image-focus', emoji: '🖼️', name: 'Image Focus', desc: 'Large Image, Small Text' },
  ];

  return (
    <div className="space-y-2 p-3 rounded-md bg-blue-50 border border-blue-200">
      <label className="text-sm font-semibold text-blue-900">
        Slide Layout:
      </label>
      <div className="grid grid-cols-2 gap-2">
        {layouts.map(({ type, emoji, name, desc }) => (
          <button
            key={type}
            type="button"
            onClick={() => onLayoutChange(type)}
            className={`p-3 rounded-md text-xs font-medium transition-all ${
              layout === type
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
            }`}
          >
            <LayoutPreview type={type} />
            <div className="font-semibold">{emoji} {name}</div>
            <div className="text-[10px] opacity-80 mt-0.5">{desc}</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-blue-700 italic mt-1">
        💡 Layout was auto-detected based on aspect ratio. Change if needed.
      </p>
    </div>
  );
}

import type { SlideLayout } from '@/lib/script-parser';

interface LayoutPickerProps {
  layout: SlideLayout | undefined;
  onLayoutChange: (layout: SlideLayout) => void;
}

/**
 * LayoutPicker Component
 *
 * Displays a 2x2 grid of layout options for presentation slides.
 * Shows active state highlighting for the currently selected layout.
 *
 * Extracted from RichSectionEditor.tsx (lines 363-423)
 */
export function LayoutPicker({ layout, onLayoutChange }: LayoutPickerProps) {
  return (
    <div className="space-y-2 p-3 rounded-md bg-purple-50 border border-purple-200">
      <label className="text-sm font-semibold text-purple-900">
        Slide Layout:
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onLayoutChange('balanced')}
          className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
            layout === 'balanced'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
          }`}
        >
          <div className="font-semibold">⚖️ Balanced</div>
          <div className="text-[10px] opacity-80">Image + Text Side-by-Side</div>
        </button>
        <button
          type="button"
          onClick={() => onLayoutChange('image-top')}
          className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
            layout === 'image-top'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
          }`}
        >
          <div className="font-semibold">⬆️ Image Top</div>
          <div className="text-[10px] opacity-80">Image Above Text</div>
        </button>
        <button
          type="button"
          onClick={() => onLayoutChange('image-bottom')}
          className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
            layout === 'image-bottom'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
          }`}
        >
          <div className="font-semibold">⬇️ Image Bottom</div>
          <div className="text-[10px] opacity-80">Text Above Image</div>
        </button>
        <button
          type="button"
          onClick={() => onLayoutChange('image-focus')}
          className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
            layout === 'image-focus'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
          }`}
        >
          <div className="font-semibold">🖼️ Image Focus</div>
          <div className="text-[10px] opacity-80">Large Image, Small Text</div>
        </button>
      </div>
      <p className="text-xs text-purple-700 italic mt-1">
        💡 Layout was auto-detected based on aspect ratio. Change if needed.
      </p>
    </div>
  );
}

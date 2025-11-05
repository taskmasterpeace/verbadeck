import { useState, useRef } from 'react';
import { Upload, ImageIcon as ImageIconLucide, Sparkles, X } from 'lucide-react';
import { AIImageGenerator } from './AIImageGenerator';
import { LayoutPicker } from './LayoutPicker';
import type { Section, SlideLayout } from '@/lib/script-parser';

interface ImageUploadSectionProps {
  sectionId: string;
  imageUrl: string;
  imageOnly: boolean;
  layout: SlideLayout | undefined;
  allSections?: Section[];
  presentationStyle?: any;
  selectedModel: string;
  content: string;
  onImageChange: (url: string) => void;
  onImageOnlyChange: (imageOnly: boolean) => void;
  onLayoutChange: (layout: SlideLayout) => void;
}

/**
 * ImageUploadSection Component
 *
 * Handles image upload, URL input, and AI-generated images for a section.
 * Includes file upload button, AI generator button, URL input, image preview,
 * image-only checkbox, and layout picker integration.
 *
 * Extracted from RichSectionEditor.tsx (lines 291-368)
 */
export function ImageUploadSection({
  sectionId,
  imageUrl,
  imageOnly,
  layout,
  allSections,
  presentationStyle,
  selectedModel,
  content,
  onImageChange,
  onImageOnlyChange,
  onLayoutChange,
}: ImageUploadSectionProps) {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert image to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
        <ImageIconLucide className="w-4 h-4" />
        Slide Image (optional):
      </label>

      {/* Image Preview */}
      {imageUrl && (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-32 object-contain rounded-md border bg-muted"
            onError={() => onImageChange('')}
          />
          <button
            onClick={() => onImageChange('')}
            className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload or URL input */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 px-3 py-2 rounded-md border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
        <button
          onClick={() => setShowAIGenerator(true)}
          className="flex-1 px-3 py-2 rounded-md border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate with AI
        </button>
      </div>

      <input
        type="url"
        value={imageUrl.startsWith('data:') ? '' : imageUrl}
        onChange={(e) => onImageChange(e.target.value)}
        placeholder="Or paste image URL..."
        className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Display Image Only Option */}
      {imageUrl && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 border border-blue-200">
          <input
            type="checkbox"
            id={`imageOnly-${sectionId}`}
            checked={imageOnly}
            onChange={(e) => onImageOnlyChange(e.target.checked)}
            className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={`imageOnly-${sectionId}`} className="text-sm font-medium text-blue-900 cursor-pointer">
            Display image only (hide text from audience)
          </label>
        </div>
      )}

      {/* Layout Picker - only show when there's an image and not in image-only mode */}
      {imageUrl && !imageOnly && (
        <LayoutPicker layout={layout} onLayoutChange={onLayoutChange} />
      )}

      {/* AI Image Generator Modal */}
      {showAIGenerator && (
        <AIImageGenerator
          sectionContent={content}
          existingImage={imageUrl || undefined}
          presentationContext={allSections?.map(s => s.content).join('\n\n')}
          selectedModel={selectedModel}
          presentationStyle={presentationStyle}
          onImageGenerated={(url, newLayout) => {
            onImageChange(url);
            if (newLayout) {
              onLayoutChange(newLayout);
            }
            setShowAIGenerator(false);
          }}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
}

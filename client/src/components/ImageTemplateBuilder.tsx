import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { AllModelsSelector } from './AllModelsSelector';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { Loader2, Sparkles, Image as ImageIcon, Upload, X, MonitorSmartphone, Monitor, HelpCircle } from 'lucide-react';
import type { Section } from '@/lib/script-parser';

interface ImageTemplateBuilderProps {
  onSectionsGenerated: (sections: Section[]) => void;
}

type AspectRatio = '9:16' | '16:9';

interface UploadedImage {
  id: string;
  dataUrl: string;
  name: string;
}

export function ImageTemplateBuilder({ onSectionsGenerated }: ImageTemplateBuilderProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('verbadeck-selected-model') || 'anthropic/claude-3.5-sonnet';
  });
  const [isDragging, setIsDragging] = useState(false);
  const { processImagesWithAI, isProcessing, error, progress } = useOpenRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: UploadedImage = {
          id: `img-${Date.now()}-${Math.random()}`,
          dataUrl: reader.result as string,
          name: file.name,
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleProcess = async () => {
    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    try {
      const result = await processImagesWithAI(images, aspectRatio, selectedModel);

      // Convert API response to Section format
      const sections: Section[] = result.sections.map((sec: any, index: number) => {
        const normalizedPrimary = sec.primaryTrigger.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedAlternatives = (sec.alternativeTriggers || []).map((t: string) =>
          t.toLowerCase().replace(/[^a-z0-9]/g, '')
        );

        return {
          id: `section-${index}`,
          content: sec.content,
          advanceToken: normalizedPrimary,
          alternativeTriggers: sec.alternativeTriggers,
          selectedTriggers: [normalizedPrimary, ...normalizedAlternatives],
          imageUrl: sec.imageUrl, // Image from the uploaded set
        };
      });

      onSectionsGenerated(sections);
      setImages([]); // Clear images after processing
    } catch (err) {
      console.error('Processing failed:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Generate Script from Images (AI Vision)
        </CardTitle>
        <CardDescription>
          Upload multiple images and AI will analyze them to generate a complete presentation script with narration for each visual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aspect Ratio Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            Select Template Aspect Ratio
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                Choose 16:9 for standard projectors/monitors or 9:16 for vertical displays and mobile devices
              </div>
            </div>
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">16:9 Landscape</div>
                <div className="text-xs opacity-75">Standard displays</div>
              </div>
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <MonitorSmartphone className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">9:16 Portrait</div>
                <div className="text-xs opacity-75">Mobile/vertical</div>
              </div>
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            Select AI Model
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                Choose an AI model to generate your script. Free models are marked with a green badge.
              </div>
            </div>
          </label>
          <AllModelsSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>

        {/* Image Upload Zone */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Upload Images ({images.length})
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="font-semibold text-gray-700">
                  Drop images here or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Upload multiple images for your presentation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div key={img.id} className="relative group">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-gray-600 mt-1 truncate">{img.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is analyzing your images and generating script...</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleProcess}
          disabled={isProcessing || images.length === 0}
          className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Script from Images
            </>
          )}
        </button>

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
          <p><strong>💡 Tips for best results:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Upload images in the order you want them presented</li>
            <li>AI will generate narration that flows through your visuals</li>
            <li>Works great for product showcases, photo stories, and visual guides</li>
            <li>You can edit the generated script and triggers afterwards</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

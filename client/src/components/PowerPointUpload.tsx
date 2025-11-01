import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import type { Section } from '@/lib/script-parser';
import { API_BASE_URL } from '@/lib/api-config';

interface PowerPointUploadProps {
  onSlidesExtracted: (slides: Section[]) => void;
}

export function PowerPointUpload({ onSlidesExtracted }: PowerPointUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.pptx') && !file.name.endsWith('.ppt')) {
      setError('Please upload a PowerPoint file (.pptx or .ppt)');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/upload-pptx`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('📊 Received slides from backend:', data.slides);

      // Convert slides to Section format
      const sections: Section[] = data.slides.map((slide: any, index: number) => ({
        id: `slide-${index}`,
        content: slide.content,
        advanceToken: '', // Will be set by AI or user
        alternativeTriggers: [],
        selectedTriggers: [],
        imageUrl: slide.imageUrl || undefined,
      }));

      onSlidesExtracted(sections);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading PowerPoint:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload PowerPoint');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Import PowerPoint Presentation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Upload a PowerPoint file (.pptx) to automatically extract slides and content
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.ppt"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            id="pptx-upload"
          />
          <label htmlFor="pptx-upload">
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${isUploading
                  ? 'border-muted bg-muted/50 cursor-not-allowed'
                  : 'border-primary/50 hover:border-primary hover:bg-primary/5'
                }
              `}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Processing PowerPoint...</p>
                  <p className="text-xs text-muted-foreground">Extracting slides and images</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-8 h-8 text-primary" />
                  <p className="text-sm font-medium">Click to upload PowerPoint</p>
                  <p className="text-xs text-muted-foreground">or drag and drop .pptx file here</p>
                </div>
              )}
            </div>
          </label>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Note:</strong> After uploading:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Slide content will be extracted as presenter notes</li>
            <li>Images will be imported and linked to each slide</li>
            <li>You can then select trigger words or use AI to enhance your script</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

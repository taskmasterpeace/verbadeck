import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Sparkles, Check, Upload, Image as ImageIcon, Eye } from 'lucide-react';
import type { Section } from '@/lib/script-parser';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { AIImageGenerator } from './AIImageGenerator';
import { SlidePreview } from './SlidePreview';

interface RichSectionEditorProps {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  onUpdate: (section: Section) => void;
  onDelete: () => void;
  selectedModel: string;
  allSections?: Section[]; // Full presentation for context
}

export function RichSectionEditor({
  section,
  sectionIndex,
  totalSections,
  onUpdate,
  onDelete,
  selectedModel,
  allSections,
}: RichSectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(section.content);
  const [imageUrl, setImageUrl] = useState(section.imageUrl || '');
  const [speakerNotes, setSpeakerNotes] = useState(section.speakerNotes || '');
  const [imageOnly, setImageOnly] = useState(section.imageOnly || false);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    section.selectedTriggers || [section.advanceToken]
  );
  const { suggestTriggers, isProcessing } = useOpenRouter();
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(section.alternativeTriggers || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-resize textarea to fit content
  const handleTextareaResize = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Tokenize content into clickable words
  // Use speaker notes for trigger selection if available
  const textForTriggers = speakerNotes.trim() || content;
  const words = textForTriggers.split(/(\s+|[.,!?;:])/g);

  const handleWordClick = (word: string) => {
    if (!isEditing) return;

    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanWord) return;

    setSelectedTriggers((prev) => {
      if (prev.includes(cleanWord)) {
        // Remove trigger
        return prev.filter((t) => t !== cleanWord);
      } else {
        // Add trigger
        return [...prev, cleanWord];
      }
    });
  };

  const handleSave = () => {
    if (selectedTriggers.length === 0) {
      alert('Please select at least one trigger word');
      return;
    }

    const primaryTrigger = selectedTriggers[0];
    onUpdate({
      ...section,
      content,
      advanceToken: primaryTrigger,
      selectedTriggers,
      imageUrl: imageUrl || undefined,
      speakerNotes: speakerNotes.trim() || undefined,
      imageOnly,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(section.content);
    setImageUrl(section.imageUrl || '');
    setSpeakerNotes(section.speakerNotes || '');
    setImageOnly(section.imageOnly || false);
    setSelectedTriggers(section.selectedTriggers || [section.advanceToken]);
    setIsEditing(false);
  };

  const handleAISuggest = async () => {
    try {
      // Use speaker notes for AI suggestions if available
      const textForSuggestions = speakerNotes.trim() || content;
      const suggestions = await suggestTriggers(textForSuggestions, selectedModel);
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to get AI suggestions:', err);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    const cleanSuggestion = suggestion.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!selectedTriggers.includes(cleanSuggestion)) {
      setSelectedTriggers((prev) => [...prev, cleanSuggestion]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert image to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className={`relative border-2 shadow-lg mb-6 transition-all hover:shadow-xl hover:border-primary/30 ${sectionIndex % 2 === 0 ? 'bg-muted/20' : 'bg-background'}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {sectionIndex + 1}
            </span>
            <span className="text-muted-foreground font-normal text-sm">of {totalSections}</span>
            {section.imageUrl && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-normal">
                <ImageIcon className="w-3 h-3" />
                Has Image
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-xs px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                  title="Preview how this slide will look to the audience"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs px-3 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="text-xs px-2 py-1 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-xs px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                  title="Preview how this slide will look to the audience"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
                <button
                  onClick={handleSave}
                  className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="text-xs px-3 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Content Editor */}
        {isEditing ? (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Slide Content (what audience sees):
              </label>
              <textarea
                ref={contentTextareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleTextareaResize(e.target);
                }}
                onFocus={(e) => handleTextareaResize(e.target)}
                placeholder="Section content..."
                className="w-full min-h-32 p-3 rounded-md border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ height: 'auto' }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Speaker Notes (optional - what you'll say):
              </label>
              <textarea
                ref={notesTextareaRef}
                value={speakerNotes}
                onChange={(e) => {
                  setSpeakerNotes(e.target.value);
                  handleTextareaResize(e.target);
                }}
                onFocus={(e) => handleTextareaResize(e.target)}
                placeholder="Leave empty to use slide content... Add your own script here if you want to say something different from what's on the slide."
                className="w-full min-h-24 p-3 rounded-md border border-dashed bg-amber-50/50 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-amber-400"
                style={{ height: 'auto' }}
              />
              <p className="text-xs text-muted-foreground italic">
                💡 Tip: Voice navigation will use your speaker notes (if provided) instead of slide content
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Slide Image (optional):
              </label>

              {/* Image Preview */}
              {imageUrl && (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-contain rounded-md border bg-muted"
                    onError={() => setImageUrl('')}
                  />
                  <button
                    onClick={() => setImageUrl('')}
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
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL..."
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Display Image Only Option */}
              {imageUrl && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 border border-blue-200">
                  <input
                    type="checkbox"
                    id={`imageOnly-${section.id}`}
                    checked={imageOnly}
                    onChange={(e) => setImageOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`imageOnly-${section.id}`} className="text-sm font-medium text-blue-900 cursor-pointer">
                    Display image only (hide text from audience)
                  </label>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-base leading-relaxed">
            {words.map((word, i) => {
              const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
              const isTrigger = selectedTriggers.includes(cleanWord);
              const isPrimary = cleanWord === selectedTriggers[0];

              if (cleanWord && isTrigger) {
                return (
                  <span
                    key={i}
                    className={`relative inline-block px-1 rounded ${
                      isPrimary
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    {word}
                    {isPrimary && <span className="ml-1">★</span>}
                  </span>
                );
              }

              return <span key={i}>{word}</span>;
            })}
          </div>
        )}

        {/* Trigger Word Selection (Edit Mode) */}
        {isEditing && (
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Click words to select as triggers:
              </label>
              <button
                onClick={handleAISuggest}
                disabled={isProcessing}
                className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                AI Suggest
              </button>
            </div>

            {/* Clickable Words */}
            <div className="p-3 rounded-md border bg-muted/30 text-sm leading-relaxed">
              {words.map((word, i) => {
                const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                const isTrigger = selectedTriggers.includes(cleanWord);
                const isPrimary = cleanWord === selectedTriggers[0];

                if (!cleanWord) {
                  return <span key={i}>{word}</span>;
                }

                return (
                  <span
                    key={i}
                    onClick={() => handleWordClick(word)}
                    className={`cursor-pointer hover:bg-accent/20 rounded px-1 ${
                      isTrigger
                        ? isPrimary
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'bg-accent text-accent-foreground'
                        : ''
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>

            {/* Selected Triggers Display */}
            {selectedTriggers.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-medium text-muted-foreground">Selected:</span>
                {selectedTriggers.map((trigger, i) => (
                  <Badge key={i} variant={i === 0 ? 'default' : 'secondary'}>
                    {trigger}
                    {i === 0 && ' ★'}
                    <button
                      onClick={() =>
                        setSelectedTriggers((prev) => prev.filter((t) => t !== trigger))
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">AI Suggestions:</span>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="text-xs px-2 py-1 rounded-md border border-dashed hover:bg-accent/20 transition-colors"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Trigger Display (View Mode) */}
        {!isEditing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
            <span>Triggers:</span>
            {selectedTriggers.map((trigger, i) => (
              <Badge key={i} variant={i === 0 ? 'default' : 'outline'} className="text-xs">
                {trigger}
                {i === 0 && ' ★'}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* AI Image Generator Modal */}
      {showAIGenerator && (
        <AIImageGenerator
          sectionContent={content}
          existingImage={imageUrl || undefined}
          presentationContext={allSections?.map(s => s.content).join('\n\n')}
          selectedModel={selectedModel}
          onImageGenerated={(url) => {
            setImageUrl(url);
            setShowAIGenerator(false);
          }}
          onClose={() => setShowAIGenerator(false)}
        />
      )}

      {/* Slide Preview Modal */}
      {showPreview && (
        <SlidePreview
          section={{
            ...section,
            content,
            imageUrl: imageUrl || undefined,
            speakerNotes: speakerNotes.trim() || undefined,
          }}
          sectionIndex={sectionIndex}
          totalSections={totalSections}
          onClose={() => setShowPreview(false)}
        />
      )}
    </Card>
  );
}

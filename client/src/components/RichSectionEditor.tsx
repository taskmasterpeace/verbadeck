import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Check, Image as ImageIcon, Eye } from 'lucide-react';
import type { Section, SlideLayout } from '@/lib/script-parser';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { SlidePreview } from './SlidePreview';
import { ImageUploadSection } from './ImageUploadSection';

interface RichSectionEditorProps {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  onUpdate: (section: Section) => void;
  onDelete: () => void;
  selectedModel: string;
  allSections?: Section[]; // Full presentation for context
  presentationStyle?: any; // Presentation style for consistent image generation
}

export function RichSectionEditor({
  section,
  sectionIndex,
  totalSections,
  onUpdate,
  onDelete,
  selectedModel,
  allSections,
  presentationStyle,
}: RichSectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [heading, setHeading] = useState(section.heading || '');
  const [content, setContent] = useState(section.content);
  const [imageUrl, setImageUrl] = useState(section.imageUrl || '');
  const [speakerNotes, setSpeakerNotes] = useState(section.speakerNotes || '');
  const [imageOnly, setImageOnly] = useState(section.imageOnly || false);
  const [layout, setLayout] = useState<SlideLayout | undefined>(section.layout || 'balanced');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    section.selectedTriggers || [section.advanceToken]
  );
  const { suggestTriggers, isProcessing } = useOpenRouter();
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(section.alternativeTriggers || []);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Sync state with section prop changes (e.g., when images are added)
  useEffect(() => {
    setHeading(section.heading || '');
    setContent(section.content);
    setImageUrl(section.imageUrl || '');
    setSpeakerNotes(section.speakerNotes || '');
    setImageOnly(section.imageOnly || false);
    setLayout(section.layout || 'balanced');
    setSelectedTriggers(section.selectedTriggers || [section.advanceToken]);
    setAiSuggestions(section.alternativeTriggers || []);
  }, [section]);

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
      heading: heading.trim() || undefined,
      content,
      advanceToken: primaryTrigger,
      selectedTriggers,
      imageUrl: imageUrl || undefined,
      speakerNotes: speakerNotes.trim() || undefined,
      imageOnly,
      layout,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setHeading(section.heading || '');
    setContent(section.content);
    setImageUrl(section.imageUrl || '');
    setSpeakerNotes(section.speakerNotes || '');
    setImageOnly(section.imageOnly || false);
    setLayout(section.layout || 'balanced');
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
    setSelectedTriggers((prev) => {
      if (prev.includes(cleanSuggestion)) {
        // Remove if already selected (toggle off)
        return prev.filter((t) => t !== cleanSuggestion);
      } else {
        // Add if not selected (toggle on)
        return [...prev, cleanSuggestion];
      }
    });
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
                {(imageUrl || content) && (
                  <button
                    onClick={() => setShowPreview(true)}
                    className="text-xs px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                    title="Preview how this slide will look to the audience"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                )}
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
                {(imageUrl || content) && (
                  <button
                    onClick={() => setShowPreview(true)}
                    className="text-xs px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                    title="Preview how this slide will look to the audience"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                )}
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
                Slide Title/Heading (optional):
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g., Introduction, Key Benefits, Next Steps..."
                className="w-full p-3 rounded-md border bg-background text-base font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground italic">
                💡 This heading will appear prominently at the top of your slide
              </p>
            </div>

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

            <ImageUploadSection
              sectionId={section.id}
              imageUrl={imageUrl}
              imageOnly={imageOnly}
              layout={layout}
              allSections={allSections}
              presentationStyle={presentationStyle}
              selectedModel={selectedModel}
              content={content}
              onImageChange={setImageUrl}
              onImageOnlyChange={setImageOnly}
              onLayoutChange={setLayout}
            />
          </>
        ) : (
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

            {/* Content Preview (View Mode) */}
            {!imageOnly && (
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

            {/* Speaker Notes Preview (if present) */}
            {speakerNotes && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-xs font-semibold text-amber-900 mb-1">📝 Speaker Notes:</p>
                <p className="text-sm text-amber-800">{speakerNotes}</p>
              </div>
            )}
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

            {/* Alternative Triggers with Checkboxes */}
            {section.alternativeTriggers && section.alternativeTriggers.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Alternative Triggers
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    Check to activate
                  </span>
                </div>
                <div className="grid gap-2">
                  {section.alternativeTriggers.map((trigger, i) => {
                    const normalizedTrigger = trigger.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const isSelected = selectedTriggers.includes(normalizedTrigger);

                    return (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-md border bg-card hover:bg-accent/10 cursor-pointer transition-colors group"
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleApplySuggestion(trigger)}
                            className="peer h-4 w-4 rounded border-2 border-primary/40 bg-background checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                          />
                          {isSelected && (
                            <svg
                              className="absolute w-3 h-3 text-primary-foreground pointer-events-none"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                          {trigger}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {aiSuggestions.length > 0 && (
                  <div className="pt-2 border-t">
                    <span className="text-xs font-medium text-muted-foreground mb-2 block">
                      AI Suggested Triggers:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.map((suggestion, i) => {
                        // Don't show suggestions that are already in alternativeTriggers
                        if (section.alternativeTriggers?.includes(suggestion)) return null;

                        return (
                          <button
                            key={i}
                            onClick={() => handleApplySuggestion(suggestion)}
                            className="text-xs px-2 py-1 rounded-md border border-dashed hover:bg-accent/20 transition-colors"
                          >
                            + {suggestion}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Sparkles, Check } from 'lucide-react';
import type { Section } from '@/lib/script-parser';
import { useOpenRouter } from '@/hooks/useOpenRouter';

interface RichSectionEditorProps {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  onUpdate: (section: Section) => void;
  onDelete: () => void;
  selectedModel: string;
}

export function RichSectionEditor({
  section,
  sectionIndex,
  totalSections,
  onUpdate,
  onDelete,
  selectedModel,
}: RichSectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(section.content);
  const [imageUrl, setImageUrl] = useState(section.imageUrl || '');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    section.selectedTriggers || [section.advanceToken]
  );
  const { suggestTriggers, isProcessing } = useOpenRouter();
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(section.alternativeTriggers || []);

  // Tokenize content into clickable words
  const words = content.split(/(\s+|[.,!?;:])/g);

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
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(section.content);
    setImageUrl(section.imageUrl || '');
    setSelectedTriggers(section.selectedTriggers || [section.advanceToken]);
    setIsEditing(false);
  };

  const handleAISuggest = async () => {
    try {
      const suggestions = await suggestTriggers(content, selectedModel);
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

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Section {sectionIndex + 1} of {totalSections}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
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
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Section content..."
              className="w-full h-32 p-3 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Image URL (optional):
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
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
    </Card>
  );
}

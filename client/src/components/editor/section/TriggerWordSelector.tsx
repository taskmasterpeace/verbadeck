import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X } from 'lucide-react';
import type { Section } from '@/lib/script-parser';

interface TriggerWordSelectorProps {
  section: Section;
  content: string;
  speakerNotes: string;
  selectedTriggers: string[];
  onToggleTrigger: (word: string) => void;
  onAISuggest: () => Promise<void>;
  aiSuggestions: string[];
  isProcessing: boolean;
}

export function TriggerWordSelector({
  section,
  content,
  speakerNotes,
  selectedTriggers,
  onToggleTrigger,
  onAISuggest,
  aiSuggestions,
  isProcessing,
}: TriggerWordSelectorProps) {
  // Tokenize content into clickable words
  // Use speaker notes for trigger selection if available
  const textForTriggers = speakerNotes.trim() || content;
  const words = textForTriggers.split(/(\s+|[.,!?;:])/g);

  const handleWordClick = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanWord) return;
    onToggleTrigger(cleanWord);
  };

  const handleApplySuggestion = (suggestion: string) => {
    const cleanSuggestion = suggestion.toLowerCase().replace(/[^a-z0-9]/g, '');
    onToggleTrigger(cleanSuggestion);
  };

  return (
    <div className="space-y-2 border-t pt-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Click words to select as triggers:
        </label>
        <button
          onClick={onAISuggest}
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
                onClick={() => onToggleTrigger(trigger)}
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
            <span className="text-xs text-muted-foreground/70">Check to activate</span>
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
  );
}

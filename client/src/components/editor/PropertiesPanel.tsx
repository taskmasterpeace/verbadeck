import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Image as ImageIcon, Layout, Wand2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { Section, SlideLayout } from '@/lib/script-parser';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { ImageUploadSection } from '../ImageUploadSection';

interface PropertiesPanelProps {
  section: Section;
  onUpdate: (section: Section) => void;
  selectedModel: string;
  allSections?: Section[];
  presentationStyle?: any;
}

// Collapsible section component
function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function PropertiesPanel({
  section,
  onUpdate,
  selectedModel,
  allSections,
  presentationStyle,
}: PropertiesPanelProps) {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    section.selectedTriggers || [section.advanceToken]
  );
  const { suggestTriggers, isProcessing } = useOpenRouter();
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(
    section.alternativeTriggers || []
  );

  // Use speaker notes for trigger selection if available
  // Try: old speakerNotes → structuredSpeakerNotes.highImpactParagraph → content
  const textForTriggers =
    section.speakerNotes?.trim() ||
    section.structuredSpeakerNotes?.highImpactParagraph?.trim() ||
    section.content ||
    '';
  const words = textForTriggers.split(/(\s+|[.,!?;:])/g);

  const handleWordClick = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanWord) return;

    const newTriggers = selectedTriggers.includes(cleanWord)
      ? selectedTriggers.filter((t) => t !== cleanWord)
      : [...selectedTriggers, cleanWord];

    setSelectedTriggers(newTriggers);

    // Update section with new triggers
    onUpdate({
      ...section,
      advanceToken: newTriggers[0] || section.advanceToken,
      selectedTriggers: newTriggers,
    });
  };

  const handleAISuggest = async () => {
    try {
      const suggestions = await suggestTriggers(textForTriggers, selectedModel);
      setAiSuggestions(suggestions);

      // Also update section's alternative triggers
      onUpdate({
        ...section,
        alternativeTriggers: suggestions,
      });
    } catch (err) {
      console.error('Failed to get AI suggestions:', err);
    }
  };

  const handleToggleSuggestion = (suggestion: string) => {
    const cleanSuggestion = suggestion.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newTriggers = selectedTriggers.includes(cleanSuggestion)
      ? selectedTriggers.filter((t) => t !== cleanSuggestion)
      : [...selectedTriggers, cleanSuggestion];

    setSelectedTriggers(newTriggers);

    onUpdate({
      ...section,
      advanceToken: newTriggers[0] || section.advanceToken,
      selectedTriggers: newTriggers,
    });
  };

  const handleImageChange = (imageUrl: string) => {
    onUpdate({
      ...section,
      imageUrl: imageUrl || undefined,
    });
  };

  const handleImageOnlyChange = (imageOnly: boolean) => {
    onUpdate({
      ...section,
      imageOnly,
    });
  };

  const handleLayoutChange = (layout: SlideLayout) => {
    onUpdate({
      ...section,
      layout,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Triggers Section */}
      <CollapsibleSection
        title="Trigger Words"
        icon={<Wand2 className="w-4 h-4" />}
        defaultOpen={true}
      >
        <div className="space-y-3">
          {/* AI Suggest Button */}
          <button
            onClick={handleAISuggest}
            disabled={isProcessing}
            className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-brand-deep to-brand-teal text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {isProcessing ? 'Suggesting...' : 'AI Suggest Triggers'}
          </button>

          {/* Selected Triggers Display */}
          {selectedTriggers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Active Triggers:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedTriggers.map((trigger, i) => (
                  <Badge
                    key={i}
                    variant={i === 0 ? 'default' : 'secondary'}
                    className="text-xs cursor-pointer hover:opacity-80"
                    onClick={() => handleToggleSuggestion(trigger)}
                  >
                    {trigger}
                    {i === 0 && ' ★'}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                Click to remove • First one is primary
              </p>
            </div>
          )}

          {/* Clickable Words */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Click words to add:
            </p>
            <div className="p-3 rounded-lg border bg-muted/30 text-xs leading-relaxed max-h-[200px] overflow-y-auto">
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
                    className={`cursor-pointer hover:bg-accent/30 rounded px-0.5 transition-colors ${
                      isTrigger
                        ? isPrimary
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'bg-accent text-accent-foreground font-semibold'
                        : ''
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                AI Suggestions:
              </p>
              <div className="space-y-1.5">
                {aiSuggestions.map((suggestion, i) => {
                  const normalizedSuggestion = suggestion.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const isSelected = selectedTriggers.includes(normalizedSuggestion);

                  return (
                    <label
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent/10 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSuggestion(suggestion)}
                        className="w-4 h-4 rounded border-2 border-primary/40 bg-background checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      />
                      <span className="text-xs font-medium group-hover:text-foreground">
                        {suggestion}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Images Section */}
      <CollapsibleSection
        title="Images"
        icon={<ImageIcon className="w-4 h-4" />}
        defaultOpen={true}
      >
        <ImageUploadSection
          sectionId={section.id}
          imageUrl={section.imageUrl || ''}
          imageOnly={section.imageOnly || false}
          layout={section.layout || 'balanced'}
          allSections={allSections}
          presentationStyle={presentationStyle}
          selectedModel={selectedModel}
          content={section.content}
          onImageChange={handleImageChange}
          onImageOnlyChange={handleImageOnlyChange}
          onLayoutChange={handleLayoutChange}
        />
      </CollapsibleSection>

      {/* Layout Section */}
      <CollapsibleSection
        title="Layout"
        icon={<Layout className="w-4 h-4" />}
        defaultOpen={true}
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Choose how content and images are arranged:
          </p>

          <div className="space-y-2">
            {/* Layout options */}
            {[
              { value: 'balanced', label: '50/50 Split', desc: 'Equal image and text' },
              { value: 'image-left', label: 'Image Left', desc: '60% image, 40% text' },
              { value: 'image-right', label: 'Image Right', desc: '60% image, 40% text' },
              { value: 'image-dominant', label: 'Image Focus', desc: '70% image, 30% text' },
              { value: 'text-dominant', label: 'Text Focus', desc: '70% text, 30% image' },
            ].map((layoutOption) => (
              <label
                key={layoutOption.value}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${section.layout === layoutOption.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/30'
                  }
                `}
              >
                <input
                  type="radio"
                  name="layout"
                  value={layoutOption.value}
                  checked={section.layout === layoutOption.value}
                  onChange={(e) => handleLayoutChange(e.target.value as SlideLayout)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{layoutOption.label}</p>
                  <p className="text-xs text-muted-foreground">{layoutOption.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Image Only Toggle */}
          {section.imageUrl && (
            <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-blue-200 bg-blue-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={section.imageOnly || false}
                onChange={(e) => handleImageOnlyChange(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-primary/40 checked:bg-primary"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">Image Only</p>
                <p className="text-xs text-blue-700">Hide text, show only image</p>
              </div>
            </label>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}

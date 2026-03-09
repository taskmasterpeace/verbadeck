import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import type { Section } from '@/lib/script-parser';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { useSectionForm } from '@/hooks/useSectionForm';
import { SlidePreview } from './SlidePreview';
import { ImageUploadSection } from './ImageUploadSection';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { SectionHeader } from './editor/section/SectionHeader';
import { ContentEditor } from './editor/section/ContentEditor';
import { SpeakerNotesEditor } from './editor/section/SpeakerNotesEditor';
import { TriggerWordSelector } from './editor/section/TriggerWordSelector';
import { SectionPreviewPane } from './editor/section/SectionPreviewPane';

interface RichSectionEditorProps {
  sectionIndex: number;
  onDragStart?: (index: number) => void;
  onDragEnter?: (index: number) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export function RichSectionEditor({
  sectionIndex,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
}: RichSectionEditorProps) {
  // Get data from store
  const sections = usePresentationStore((state) => state.sections);
  const selectedModel = usePresentationStore((state) => state.selectedModel);
  const selectedTone = usePresentationStore((state) => state.selectedTone);
  const presentationStyle = usePresentationStore((state) => state.presentationStyle);
  const updateSection = usePresentationStore((state) => state.updateSection);
  const deleteSection = usePresentationStore((state) => state.deleteSection);

  const section = sections[sectionIndex];
  const totalSections = sections.length;
  const allSections = sections;

  // Safety check: return null if section doesn't exist
  if (!section) {
    console.warn(`Section at index ${sectionIndex} does not exist`);
    return null;
  }

  // Use form hook for state management
  const {
    formState,
    isEditing,
    setIsEditing,
    updateField,
    updateFields,
    saveChanges,
    cancelChanges,
    toggleTrigger,
  } = useSectionForm({
    section,
    onSave: (updates) => updateSection(sectionIndex, { ...section, ...updates }),
  });

  const { suggestTriggers, isProcessing } = useOpenRouter();
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(section?.alternativeTriggers || []);
  const [showPreview, setShowPreview] = useState(false);

  // Tab state for Edit/Preview toggle - default to Preview
  const [contentTab, setContentTab] = useState<'edit' | 'preview'>('preview');
  const [notesTab, setNotesTab] = useState<'edit' | 'preview'>('preview');

  // AI suggest handler
  const handleAISuggest = async () => {
    try {
      const textForSuggestions = formState.speakerNotes.trim() || formState.content;
      const suggestions = await suggestTriggers(textForSuggestions, selectedModel);
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to get AI suggestions:', err);
    }
  };

  return (
    <Card
      className={`relative border-2 shadow-lg mb-6 transition-all hover:shadow-xl hover:border-primary/30 ${
        sectionIndex % 2 === 0 ? 'bg-muted/20' : 'bg-background'
      }`}
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <SectionHeader
          sectionIndex={sectionIndex}
          totalSections={totalSections}
          hasImage={!!section.imageUrl}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={saveChanges}
          onCancel={cancelChanges}
          onDelete={() => deleteSection(sectionIndex)}
          onPreview={() => setShowPreview(true)}
          showPreviewButton={!!(formState.imageUrl || formState.content)}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          <>
            <ContentEditor
              heading={formState.heading}
              content={formState.content}
              tab={contentTab}
              onHeadingChange={(value) => updateField('heading', value)}
              onContentChange={(value) => updateField('content', value)}
              onTabChange={setContentTab}
            />

            <SpeakerNotesEditor
              speakerNotes={formState.speakerNotes}
              tab={notesTab}
              slideContent={formState.content}
              selectedTone={selectedTone}
              onNotesChange={(value) => updateField('speakerNotes', value)}
              onTabChange={setNotesTab}
            />

            <ImageUploadSection
              sectionId={section.id}
              imageUrl={formState.imageUrl}
              imageOnly={formState.imageOnly}
              layout={formState.layout}
              allSections={allSections}
              presentationStyle={presentationStyle}
              selectedModel={selectedModel}
              content={formState.content}
              onImageChange={(value) => updateField('imageUrl', value)}
              onImageOnlyChange={(value) => updateField('imageOnly', value)}
              onLayoutChange={(value) => updateField('layout', value)}
            />
          </>
        ) : (
          <SectionPreviewPane
            sectionIndex={sectionIndex}
            heading={formState.heading}
            content={formState.content}
            imageUrl={formState.imageUrl}
            imageOnly={formState.imageOnly}
            speakerNotes={formState.speakerNotes}
            selectedTriggers={formState.selectedTriggers}
          />
        )}

        {/* Trigger Word Selection (Edit Mode) */}
        {isEditing && (
          <TriggerWordSelector
            section={section}
            content={formState.content}
            speakerNotes={formState.speakerNotes}
            selectedTriggers={formState.selectedTriggers}
            onToggleTrigger={toggleTrigger}
            onAISuggest={handleAISuggest}
            aiSuggestions={aiSuggestions}
            isProcessing={isProcessing}
          />
        )}
      </CardContent>

      {/* Slide Preview Modal */}
      {showPreview && (
        <SlidePreview
          section={{
            ...section,
            content: formState.content,
            imageUrl: formState.imageUrl || undefined,
            speakerNotes: formState.speakerNotes.trim() || undefined,
          }}
          sectionIndex={sectionIndex}
          totalSections={totalSections}
          onClose={() => setShowPreview(false)}
        />
      )}
    </Card>
  );
}

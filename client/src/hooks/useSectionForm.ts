import { useState, useCallback, useEffect } from 'react';
import type { Section, SlideLayout } from '@/lib/script-parser';

interface SectionFormState {
  heading: string;
  content: string;
  imageUrl: string;
  speakerNotes: string;
  imageOnly: boolean;
  layout: SlideLayout | undefined;
  selectedTriggers: string[];
}

interface UseSectionFormOptions {
  section: Section;
  onSave: (updates: Partial<Section>) => void;
}

export function useSectionForm({ section, onSave }: UseSectionFormOptions) {
  // Clean HTML formatting tags from content
  const cleanHtmlTags = useCallback((text: string): string => {
    return text
      .replace(/<div style="text-align:\s*(left|center|right)">\s*/gi, '')
      .replace(/<\/div>\s*/gi, '')
      .replace(/<\/?span[^>]*>/gi, '')
      .replace(/<\/?p[^>]*>/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, []);

  // Initialize state from section
  const [formState, setFormState] = useState<SectionFormState>({
    heading: section?.heading || '',
    content: cleanHtmlTags(section?.content || ''),
    imageUrl: section?.imageUrl || '',
    speakerNotes: section?.speakerNotes ? cleanHtmlTags(section.speakerNotes) : '',
    imageOnly: section?.imageOnly || false,
    layout: section?.layout || 'balanced',
    selectedTriggers: section?.selectedTriggers || [section?.advanceToken || ''],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync with section prop changes (e.g., when images are added)
  useEffect(() => {
    setFormState({
      heading: section.heading || '',
      content: cleanHtmlTags(section.content),
      imageUrl: section.imageUrl || '',
      speakerNotes: section.speakerNotes ? cleanHtmlTags(section.speakerNotes) : '',
      imageOnly: section.imageOnly || false,
      layout: section.layout || 'balanced',
      selectedTriggers: section.selectedTriggers || [section.advanceToken],
    });
  }, [section, cleanHtmlTags]);

  // Update individual field
  const updateField = useCallback((field: keyof SectionFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  // Batch update multiple fields
  const updateFields = useCallback((updates: Partial<SectionFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Save changes
  const saveChanges = useCallback(() => {
    if (formState.selectedTriggers.length === 0) {
      alert('Please select at least one trigger word');
      return false;
    }

    const primaryTrigger = formState.selectedTriggers[0];
    onSave({
      heading: formState.heading.trim() || undefined,
      content: formState.content,
      advanceToken: primaryTrigger,
      selectedTriggers: formState.selectedTriggers,
      imageUrl: formState.imageUrl || undefined,
      speakerNotes: formState.speakerNotes.trim() || undefined,
      imageOnly: formState.imageOnly,
      layout: formState.layout,
    });

    setIsDirty(false);
    setIsEditing(false);
    return true;
  }, [formState, onSave]);

  // Cancel changes
  const cancelChanges = useCallback(() => {
    setFormState({
      heading: section.heading || '',
      content: section.content,
      imageUrl: section.imageUrl || '',
      speakerNotes: section.speakerNotes || '',
      imageOnly: section.imageOnly || false,
      layout: section.layout || 'balanced',
      selectedTriggers: section.selectedTriggers || [section.advanceToken],
    });
    setIsDirty(false);
    setIsEditing(false);
  }, [section]);

  // Toggle trigger word
  const toggleTrigger = useCallback((word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanWord) return;

    setFormState((prev) => {
      const triggers = prev.selectedTriggers.includes(cleanWord)
        ? prev.selectedTriggers.filter((t) => t !== cleanWord)
        : [...prev.selectedTriggers, cleanWord];
      return { ...prev, selectedTriggers: triggers };
    });
    setIsDirty(true);
  }, []);

  return {
    formState,
    isEditing,
    isDirty,
    setIsEditing,
    updateField,
    updateFields,
    saveChanges,
    cancelChanges,
    toggleTrigger,
  };
}

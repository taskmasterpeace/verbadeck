import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { type PresentationStyle } from '../components/PresentationStyleManager';
import { type Section } from '../lib/script-parser';

interface UsePresentationStyleProps {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  selectedModel: string;
  generateImage: (prompt: string, options: any) => Promise<string>;
  suggestPrompt: (content: string, context: string, model: string, style?: PresentationStyle | null) => Promise<string>;
}

export interface BulkStatus {
  type: 'info' | 'success' | 'error';
  message: string;
}

/**
 * Custom hook to manage presentation style and bulk image generation
 */
export function usePresentationStyle({
  sections,
  setSections,
  selectedModel,
  generateImage,
  suggestPrompt,
}: UsePresentationStyleProps) {
  const [presentationStyle, setPresentationStyle] = useLocalStorage<PresentationStyle | null>(
    'verbadeck-presentation-style',
    null
  );
  const [bulkStatus, setBulkStatus] = useState<BulkStatus | null>(null);

  /**
   * Handle presentation style selection
   */
  const handleStyleSelect = (style: PresentationStyle) => {
    setPresentationStyle(style);
    localStorage.setItem('verbadeck-presentation-style', JSON.stringify(style));
    console.log(`🎨 Presentation style set to: ${style.name}`);
  };

  /**
   * Apply current style to all slides (regenerate all images with consistent style)
   */
  const handleApplyStyleToAll = async () => {
    if (!presentationStyle) {
      alert('Please select a presentation style first');
      return;
    }

    if (sections.length === 0) {
      setBulkStatus({ type: 'error', message: 'Please create sections first' });
      return;
    }

    const confirmed = confirm(
      `This will regenerate images for ALL ${sections.length} slides using the "${presentationStyle.name}" style. This may take a few minutes and will replace existing images. Continue?`
    );

    if (!confirmed) return;

    setBulkStatus({ type: 'info', message: `Applying "${presentationStyle.name}" style to all slides...` });

    const presentationContext = sections.map(s => s.content).join('\n\n');

    try {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        console.log(`🎨 Generating styled image ${i + 1}/${sections.length} for section ${i + 1}`);

        // Generate AI prompt with full context AND presentation style
        const prompt = await suggestPrompt(section.content, presentationContext, selectedModel, presentationStyle);
        console.log(`📝 Generated styled prompt for section ${i + 1}:`, prompt.substring(0, 100) + '...');

        // Generate image
        const imageUrl = await generateImage(prompt, {
          aspectRatio: '16:9',
          outputFormat: 'jpg',
        });

        if (!imageUrl || imageUrl.trim() === '') {
          throw new Error(`Image generation returned empty URL for section ${i + 1}`);
        }

        // Update section with new image
        setSections(prevSections => {
          const newSections = [...prevSections];
          newSections[i] = {
            ...newSections[i],
            imageUrl,
          };
          return newSections;
        });

        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setBulkStatus({
        type: 'success',
        message: `Successfully applied "${presentationStyle.name}" style to all ${sections.length} slides!`
      });

      setTimeout(() => setBulkStatus(null), 5000);
    } catch (error) {
      console.error('Style application error:', error);
      setBulkStatus({
        type: 'error',
        message: `Failed to apply style. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  return {
    presentationStyle,
    handleStyleSelect,
    handleApplyStyleToAll,
    bulkStatus,
    setBulkStatus,
  };
}

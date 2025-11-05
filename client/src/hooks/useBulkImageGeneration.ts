import { useState } from 'react';
import { selectAspectRatioForSection, detectOptimalLayout, type Section } from '@/lib/script-parser';
import type { PresentationStyle } from '@/components/PresentationStyleManager';

interface UseBulkImageGenerationParams {
  sections: Section[];
  setSections: (sections: Section[] | ((prev: Section[]) => Section[])) => void;
  selectedModel: string;
  presentationStyle: PresentationStyle | null;
  generateImage: (prompt: string, options: { aspectRatio: string; outputFormat: string }) => Promise<string>;
  suggestPrompt: (content: string, context: string, model: string, style?: PresentationStyle | null) => Promise<string>;
}

interface UseBulkImageGenerationReturn {
  isBulkGenerating: boolean;
  bulkProgress: { current: number; total: number };
  bulkStatus: { type: 'success' | 'error' | 'info'; message: string } | null;
  setBulkStatus: (status: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  handleBulkGenerateImages: () => Promise<void>;
}

/**
 * useBulkImageGeneration Hook
 *
 * Handles bulk generation of images for all sections without images.
 * Includes progress tracking, smart aspect ratio selection, and optimal layout detection.
 *
 * Extracted from App.tsx (lines 64-68 state, 173-282 handlers)
 */
export function useBulkImageGeneration({
  sections,
  setSections,
  selectedModel,
  presentationStyle,
  generateImage,
  suggestPrompt,
}: UseBulkImageGenerationParams): UseBulkImageGenerationReturn {

  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkStatus, setBulkStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Bulk generate images for all sections without images
  const handleBulkGenerateImages = async () => {
    setBulkStatus(null); // Clear any previous status

    if (sections.length === 0) {
      setBulkStatus({ type: 'error', message: 'Please create sections first' });
      return;
    }

    console.log('📊 Checking sections for images...');
    sections.forEach((section, idx) => {
      console.log(`Section ${idx + 1}: imageUrl =`, section.imageUrl ? 'HAS IMAGE' : 'NO IMAGE');
    });

    // Find sections without images (check for both undefined and empty string)
    const sectionsNeedingImages = sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => !section.imageUrl || section.imageUrl.trim() === '');

    console.log(`📝 Found ${sectionsNeedingImages.length} sections needing images out of ${sections.length} total`);

    if (sectionsNeedingImages.length === 0) {
      setBulkStatus({ type: 'info', message: 'All sections already have images!' });
      return;
    }

    setBulkStatus({ type: 'info', message: `Starting generation for ${sectionsNeedingImages.length} section(s)...` });

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: sectionsNeedingImages.length });

    const presentationContext = sections.map(s => s.content).join('\n\n');

    try {
      for (let i = 0; i < sectionsNeedingImages.length; i++) {
        const { section, index } = sectionsNeedingImages[i];
        setBulkProgress({ current: i + 1, total: sectionsNeedingImages.length });

        console.log(`🎨 Generating image ${i + 1}/${sectionsNeedingImages.length} for section ${index + 1}`);

        // Generate AI prompt with full context
        const prompt = await suggestPrompt(section.content, presentationContext, selectedModel, presentationStyle);
        console.log(`📝 Generated prompt for section ${index + 1}:`, prompt);

        // Smart aspect ratio selection based on content and position
        const aspectRatio = selectAspectRatioForSection(section, index, sections.length);
        console.log(`📐 Selected aspect ratio for section ${index + 1}: ${aspectRatio}`);

        // Generate image with smart aspect ratio
        const imageUrl = await generateImage(prompt, {
          aspectRatio,
          outputFormat: 'jpg',
        });

        if (!imageUrl || imageUrl.trim() === '') {
          console.error(`❌ Generated image URL is empty for section ${index + 1}!`);
          throw new Error(`Image generation returned empty URL for section ${index + 1}`);
        }

        console.log(`✅ Generated image for section ${index + 1}`);
        console.log(`   Length: ${imageUrl.length} chars`);
        console.log(`   Starts with: ${imageUrl.substring(0, 30)}`);

        // Auto-detect optimal layout based on aspect ratio
        const optimalLayout = detectOptimalLayout(aspectRatio);
        console.log(`🎨 Auto-detected layout for section ${index + 1}: ${optimalLayout}`);

        // Update sections state incrementally - create new array with the updated section
        setSections(prevSections => {
          console.log(`🔄 Updating section ${index + 1}...`);
          console.log(`   Previous imageUrl: ${prevSections[index].imageUrl ? 'EXISTS' : 'NONE'}`);

          const newSections = [...prevSections];
          newSections[index] = {
            ...newSections[index],
            imageUrl,
            layout: optimalLayout,
          };

          console.log(`   New imageUrl set: ${newSections[index].imageUrl ? 'SUCCESS' : 'FAILED'}`);
          console.log(`   New imageUrl length: ${newSections[index].imageUrl?.length || 0}`);
          console.log(`   Layout set: ${newSections[index].layout}`);

          return newSections;
        });

        // Give React time to process the state update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Force a complete re-render by creating entirely new section objects
      setSections(prevSections => prevSections.map(s => ({ ...s })));

      setBulkStatus({
        type: 'success',
        message: `Successfully generated ${sectionsNeedingImages.length} image${sectionsNeedingImages.length > 1 ? 's' : ''}!`
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => setBulkStatus(null), 5000);
    } catch (error) {
      console.error('Bulk generation error:', error);
      setBulkStatus({
        type: 'error',
        message: `Failed to generate images. Generated ${bulkProgress.current} of ${bulkProgress.total}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsBulkGenerating(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  return {
    isBulkGenerating,
    bulkProgress,
    bulkStatus,
    setBulkStatus,
    handleBulkGenerateImages,
  };
}

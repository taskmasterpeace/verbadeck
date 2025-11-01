import { useState } from 'react';
import { API_BASE_URL } from '@/lib/api-config';

interface ImageGenerationOptions {
  aspectRatio?: string;
  imageInput?: string | null;
  outputFormat?: 'png' | 'jpg';
}

interface ImageOptions {
  aspectRatios: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  formats: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

/**
 * Hook for AI image generation using Replicate
 */
export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageOptions, setImageOptions] = useState<ImageOptions | null>(null);

  /**
   * Generate or edit an image with AI
   */
  const generateImage = async (
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          aspectRatio: options.aspectRatio || '16:9',
          imageInput: options.imageInput || null,
          outputFormat: options.outputFormat || 'png',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      return data.imageUrl;
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate a smart image prompt from section content
   */
  const suggestPrompt = async (
    content: string,
    presentationContext?: string,
    model?: string
  ): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/suggest-image-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          presentationContext: presentationContext || '',
          model: model || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt suggestion');
      }

      const data = await response.json();
      return data.prompt;
    } catch (err: any) {
      console.error('Error suggesting prompt:', err);
      // Fallback to basic prompt
      return `Professional presentation slide about: ${content.substring(0, 100)}`;
    }
  };

  /**
   * Fetch available image options (aspect ratios and formats)
   */
  const fetchImageOptions = async (): Promise<ImageOptions> => {
    try {
      if (imageOptions) {
        return imageOptions; // Use cached options
      }

      const response = await fetch(`${API_BASE_URL}/api/image-options`);
      if (!response.ok) {
        throw new Error('Failed to fetch image options');
      }

      const data = await response.json();
      setImageOptions(data);
      return data;
    } catch (err: any) {
      console.error('Error fetching image options:', err);
      // Return defaults if API fails
      return {
        aspectRatios: [
          { value: '16:9', label: '16:9 Widescreen', description: 'Standard presentation' },
          { value: '9:16', label: '9:16 Portrait', description: 'Mobile/vertical' },
          { value: '1:1', label: '1:1 Square', description: 'Perfect square' },
        ],
        formats: [
          { value: 'png', label: 'PNG', description: 'Lossless' },
          { value: 'jpg', label: 'JPG', description: 'Smaller file' },
        ],
      };
    }
  };

  return {
    generateImage,
    suggestPrompt,
    fetchImageOptions,
    isGenerating,
    error,
    generatedImage,
  };
}

import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { useImageGeneration } from '@/hooks/useImageGeneration';

interface AIImageGeneratorProps {
  sectionContent: string;
  existingImage?: string;
  onImageGenerated: (imageUrl: string) => void;
  onClose: () => void;
  presentationContext?: string; // Full presentation context for better prompts
  selectedModel?: string; // AI model to use for prompt generation
}

export function AIImageGenerator({
  sectionContent,
  existingImage,
  onImageGenerated,
  onClose,
  presentationContext,
  selectedModel,
}: AIImageGeneratorProps) {
  const {
    generateImage,
    suggestPrompt,
    fetchImageOptions,
    isGenerating,
    error,
  } = useImageGeneration();

  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg'>('jpg');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aspectRatios, setAspectRatios] = useState<Array<any>>([]);

  const mode = existingImage ? 'edit' : 'create';

  // Load image options on mount
  useEffect(() => {
    const loadOptions = async () => {
      const options = await fetchImageOptions();
      setAspectRatios(options.aspectRatios);
    };
    loadOptions();
  }, []);

  // Auto-generate initial prompt suggestion
  useEffect(() => {
    const generateInitialPrompt = async () => {
      if (sectionContent) {
        setIsSuggesting(true);
        try {
          const suggested = await suggestPrompt(sectionContent, presentationContext, selectedModel);
          setPrompt(suggested);
        } catch (err) {
          console.error('Error suggesting prompt:', err);
          setPrompt(`Professional presentation slide about: ${sectionContent.substring(0, 100)}`);
        } finally {
          setIsSuggesting(false);
        }
      }
    };
    generateInitialPrompt();
  }, [sectionContent, presentationContext, selectedModel]);

  const handleAutoSuggest = async () => {
    setIsSuggesting(true);
    try {
      const suggested = await suggestPrompt(sectionContent, presentationContext, selectedModel);
      setPrompt(suggested);
    } catch (err) {
      console.error('Error suggesting prompt:', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    try {
      const imageUrl = await generateImage(prompt, {
        aspectRatio,
        imageInput: mode === 'edit' ? existingImage : null,
        outputFormat,
      });
      setGeneratedImageUrl(imageUrl);
    } catch (err) {
      console.error('Generation error:', err);
    }
  };

  const handleUseImage = () => {
    if (generatedImageUrl) {
      onImageGenerated(generatedImageUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">
                {mode === 'edit' ? 'Edit Image with AI' : 'Generate Image with AI'}
              </h2>
              <p className="text-sm text-white/80">
                {mode === 'edit'
                  ? 'Transform existing image with AI'
                  : 'Create new image from text description'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Image Description
              </label>
              <button
                onClick={handleAutoSuggest}
                disabled={isSuggesting}
                className="text-xs px-3 py-1.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {isSuggesting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Suggesting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Auto-Suggest from Content
                  </>
                )}
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full h-24 p-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none resize-none text-sm"
              disabled={isSuggesting || isGenerating}
            />
            <p className="text-xs text-gray-500">
              Be specific about style, composition, and visual elements
            </p>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              disabled={isGenerating}
              className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm font-medium"
            >
              {aspectRatios.map((ratio) => (
                <option key={ratio.value} value={ratio.value}>
                  {ratio.label} - {ratio.description}
                </option>
              ))}
            </select>
          </div>

          {/* Format Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpg')}
              disabled={isGenerating}
              className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm font-medium"
            >
              <option value="jpg">JPG - Smaller file size</option>
              <option value="png">PNG - Lossless, transparency support</option>
            </select>
          </div>

          {/* Image Preview */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {generatedImageUrl ? 'Generated Image' : mode === 'edit' ? 'Current Image' : 'Preview'}
            </label>
            <div className="w-full min-h-[300px] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              {isGenerating ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
                  <p className="text-sm font-medium text-gray-700">Generating your image...</p>
                  <p className="text-xs text-gray-500 mt-1">This may take 5-15 seconds</p>
                </div>
              ) : generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="Generated"
                  className="max-w-full max-h-[400px] object-contain rounded-lg"
                />
              ) : existingImage && mode === 'edit' ? (
                <img
                  src={existingImage}
                  alt="Current"
                  className="max-w-full max-h-[400px] object-contain rounded-lg opacity-60"
                />
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-500">Image will appear here after generation</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Cost/Speed Info */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Cost:</strong> ~$0.04 per image | <strong>Speed:</strong> ~5-15 seconds
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {mode === 'edit'
                ? 'Editor mode: Your existing image will be used as a reference for AI editing'
                : 'Creator mode: A new image will be generated from your prompt'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 border-t px-6 py-4 flex justify-between items-center rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {generatedImageUrl && !isGenerating && (
              <button
                onClick={handleGenerate}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Regenerate
              </button>
            )}
            {generatedImageUrl && !isGenerating ? (
              <button
                onClick={handleUseImage}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-md flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Use This Image
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {mode === 'edit' ? 'Edit Image' : 'Generate Image'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

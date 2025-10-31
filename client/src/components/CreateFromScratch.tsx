import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ToneSelector } from './ToneSelector';
import { TONE_OPTIONS, DEFAULT_TONE } from '../lib/tone-options';
import { Sparkles, Image as ImageIcon, Upload, Wand2, ChevronRight, Loader2 } from 'lucide-react';

interface CreateFromScratchProps {
  onGenerate: (config: PresentationConfig) => void;
  isProcessing?: boolean;
}

export interface PresentationConfig {
  description: string;
  tone: string;
  numSlides: number;
  targetAudience: string;
  includeImages: boolean;
  imagePrompts?: string[];
  uploadedImages?: File[];
}

export function CreateFromScratch({ onGenerate, isProcessing = false }: CreateFromScratchProps) {
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState(DEFAULT_TONE);
  const [numSlides, setNumSlides] = useState(5);
  const [targetAudience, setTargetAudience] = useState('general');
  const [includeImages, setIncludeImages] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'generate'>('generate');
  const [imagePrompts, setImagePrompts] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  // Initialize image prompts array when slides change
  const handleNumSlidesChange = (value: number) => {
    setNumSlides(value);
    if (includeImages && imageMode === 'generate') {
      setImagePrompts(Array(value).fill(''));
    }
  };

  const handleIncludeImagesToggle = (enabled: boolean) => {
    setIncludeImages(enabled);
    if (enabled && imageMode === 'generate') {
      setImagePrompts(Array(numSlides).fill(''));
    }
  };

  const handleImagePromptChange = (index: number, prompt: string) => {
    const newPrompts = [...imagePrompts];
    newPrompts[index] = prompt;
    setImagePrompts(newPrompts);
  };

  const handleImageUpload = (index: number, file: File | null) => {
    const newImages = [...uploadedImages];
    if (file) {
      newImages[index] = file;
    } else {
      newImages.splice(index, 1);
    }
    setUploadedImages(newImages);
  };

  const handleGenerate = () => {
    if (!description.trim()) {
      alert('Please provide a description of your presentation');
      return;
    }

    onGenerate({
      description,
      tone,
      numSlides,
      targetAudience,
      includeImages,
      imagePrompts: includeImages && imageMode === 'generate' ? imagePrompts : undefined,
      uploadedImages: includeImages && imageMode === 'upload' ? uploadedImages : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Create from Scratch
          </CardTitle>
          <CardDescription>
            Describe your presentation topic and AI will generate a complete presentation with trigger words
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Form */}
      <Card>
        <CardContent className="p-6 space-y-6">

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              What's your presentation about?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your topic, key points, and what you want to achieve..."
              className="w-full h-32 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Tone Selector */}
          <ToneSelector selectedTone={tone} onToneChange={setTone} />

          {/* Slides Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Number of Slides</label>
              <span className="text-2xl font-bold text-blue-600">{numSlides}</span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              value={numSlides}
              onChange={(e) => handleNumSlidesChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              style={{
                background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${((numSlides - 3) / 17) * 100}%, rgb(229, 231, 235) ${((numSlides - 3) / 17) * 100}%, rgb(229, 231, 235) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>3 slides</span>
              <span>20 slides</span>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="general">General Audience</option>
              <option value="executives">Executives / Leadership</option>
              <option value="technical">Technical / Engineering</option>
              <option value="sales">Sales / Business Development</option>
              <option value="investors">Investors / Stakeholders</option>
              <option value="students">Students / Academic</option>
              <option value="customers">Customers / End Users</option>
            </select>
          </div>

          {/* Image Options */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Include Images</label>
                <p className="text-xs text-gray-500 mt-1">Add visuals to your presentation</p>
              </div>
              <button
                onClick={() => handleIncludeImagesToggle(!includeImages)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  includeImages ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeImages ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {includeImages && (
              <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                {/* Image Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setImageMode('generate')}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all font-medium ${
                      imageMode === 'generate'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Wand2 className="w-4 h-4 inline mr-2" />
                    Generate with AI
                  </button>
                  <button
                    onClick={() => setImageMode('upload')}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all font-medium ${
                      imageMode === 'upload'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Images
                  </button>
                </div>

                {/* Image Prompts Grid (Generate Mode) */}
                {imageMode === 'generate' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: numSlides }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">
                          Slide {index + 1} Image Prompt
                        </label>
                        <input
                          type="text"
                          value={imagePrompts[index] || ''}
                          onChange={(e) => handleImagePromptChange(index, e.target.value)}
                          placeholder="Describe the image..."
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Upload Grid (Upload Mode) */}
                {imageMode === 'upload' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Array.from({ length: numSlides }).map((_, index) => (
                      <div key={index} className="relative aspect-square">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <label
                          htmlFor={`image-upload-${index}`}
                          className="flex flex-col items-center justify-center w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-blue-500 transition-all"
                        >
                          {uploadedImages[index] ? (
                            <div className="relative w-full h-full">
                              <img
                                src={URL.createObjectURL(uploadedImages[index])}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <span className="text-white text-xs">Change</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-xs text-gray-500">Slide {index + 1}</span>
                            </>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 italic">
                  {imageMode === 'generate'
                    ? '⚠️ AI image generation coming soon - prompts will be saved for future use'
                    : 'Upload images in portrait (9:16) or landscape (16:9) format'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isProcessing || !description.trim()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Presentation...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Presentation
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </CardContent>
      </Card>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(37, 99, 235);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.3);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(37, 99, 235);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.3);
        }
      `}</style>
    </div>
  );
}

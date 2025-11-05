import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Palette, Check } from 'lucide-react';

export interface PresentationStyle {
  id: string;
  name: string;
  description: string;
  colorScheme: string;
  visualStyle: string;
  mood: string;
  examples: string[];
}

export const PRESET_STYLES: PresentationStyle[] = [
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Clean, minimal, futuristic',
    colorScheme: 'Blue and white with subtle gradients',
    visualStyle: '3D renders, clean interfaces, modern sans-serif typography',
    mood: 'Professional, innovative, cutting-edge',
    examples: ['Floating holographic interfaces', 'Sleek device mockups', 'Abstract tech patterns']
  },
  {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    description: 'Business-focused, trustworthy',
    colorScheme: 'Navy blue, gray, white with accent colors',
    visualStyle: 'Photorealistic business settings, clean layouts, serif fonts',
    mood: 'Confident, authoritative, reliable',
    examples: ['Business meetings', 'Office environments', 'Professional handshakes']
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    description: 'Eye-catching, energetic, vibrant',
    colorScheme: 'Bright colors, high contrast, bold accents',
    visualStyle: 'Illustrations, abstract art, dynamic compositions',
    mood: 'Energetic, inspiring, memorable',
    examples: ['Colorful illustrations', 'Abstract shapes', 'Bold typography']
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal Elegant',
    description: 'Simple, sophisticated, refined',
    colorScheme: 'Monochromatic or muted tones, lots of white space',
    visualStyle: 'Minimalist photography, simple line art, elegant fonts',
    mood: 'Calm, sophisticated, focused',
    examples: ['Single object focus', 'Soft shadows', 'Negative space']
  },
  {
    id: 'data-driven',
    name: 'Data-Driven',
    description: 'Charts, graphs, infographics',
    colorScheme: 'Cool tones with data visualization colors',
    visualStyle: 'Modern infographics, 3D charts, dashboard interfaces',
    mood: 'Analytical, informative, precise',
    examples: ['Interactive dashboards', 'Animated graphs', 'Data visualizations']
  },
  {
    id: 'warm-human',
    name: 'Warm & Human',
    description: 'People-focused, relatable, friendly',
    colorScheme: 'Warm tones, natural colors, soft lighting',
    visualStyle: 'People photography, natural settings, approachable visuals',
    mood: 'Friendly, approachable, trustworthy',
    examples: ['Diverse teams', 'Natural moments', 'Warm lighting']
  }
];

interface PresentationStyleManagerProps {
  currentStyle: PresentationStyle | null;
  onStyleSelect: (style: PresentationStyle) => void;
  onApplyToAll: () => void;
  sectionsCount: number;
}

export function PresentationStyleManager({
  currentStyle,
  onStyleSelect,
  onApplyToAll,
  sectionsCount
}: PresentationStyleManagerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [customColors, setCustomColors] = useState('');
  const [customMood, setCustomMood] = useState('');

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-semibold">
                Presentation Style
              </CardTitle>
              {currentStyle && (
                <p className="text-sm text-blue-700 font-medium">
                  {currentStyle.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors text-sm"
            >
              {isExpanded ? 'Close' : currentStyle ? 'Change Style' : 'Select Style'}
            </button>
            {currentStyle && sectionsCount > 0 && (
              <button
                onClick={onApplyToAll}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors text-sm"
              >
                Apply to All {sectionsCount}
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3">
        {/* Style Presets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_STYLES.map((style) => {
            const isSelected = currentStyle?.id === style.id;
            return (
              <button
                key={style.id}
                onClick={() => onStyleSelect(style)}
                className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-100 shadow-md'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <h3 className="font-bold text-sm mb-1">{style.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{style.description}</p>
                {showDetails && (
                  <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                    <p><strong>Colors:</strong> {style.colorScheme}</p>
                    <p><strong>Mood:</strong> {style.mood}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show More Details'}
        </button>

        {/* Current Style Summary */}
        {currentStyle && (
          <div className="p-4 bg-white border-2 border-blue-300 rounded-lg">
            <h4 className="text-sm font-bold text-blue-900 mb-2">
              Current Style: {currentStyle.name}
            </h4>
            <div className="text-xs text-gray-700 space-y-1">
              <p><strong>Color Scheme:</strong> {currentStyle.colorScheme}</p>
              <p><strong>Visual Style:</strong> {currentStyle.visualStyle}</p>
              <p><strong>Mood:</strong> {currentStyle.mood}</p>
              <div className="mt-2 pt-2 border-t">
                <p className="font-semibold mb-1">Examples:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {currentStyle.examples.map((example, i) => (
                    <li key={i} className="text-gray-600">{example}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Custom Style Controls */}
        {currentStyle && (
          <div className="p-4 bg-white border-2 border-blue-200 rounded-lg space-y-3">
            <h4 className="text-sm font-bold text-blue-900">Customize Current Style</h4>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Custom Colors (optional):</label>
              <input
                type="text"
                value={customColors}
                onChange={(e) => setCustomColors(e.target.value)}
                placeholder="e.g., Navy blue and gold, Warm oranges and browns"
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Custom Mood (optional):</label>
              <input
                type="text"
                value={customMood}
                onChange={(e) => setCustomMood(e.target.value)}
                placeholder="e.g., Energetic and bold, Calm and professional"
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>
            {(customColors || customMood) && (
              <button
                onClick={() => {
                  // Create modified style
                  const modifiedStyle = {
                    ...currentStyle,
                    colorScheme: customColors || currentStyle.colorScheme,
                    mood: customMood || currentStyle.mood,
                  };
                  onStyleSelect(modifiedStyle);
                  setCustomColors('');
                  setCustomMood('');
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
              >
                Apply Custom Changes
              </button>
            )}
          </div>
        )}
      </CardContent>
      )}
    </Card>
  );
}

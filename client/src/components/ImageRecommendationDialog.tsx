import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Loader2, Upload, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageRecommendation {
  id: string;
  url: string;
  thumbnail: string;
  description: string;
  photographer: string;
  photographerUrl: string;
  downloadUrl: string;
  quality: 'excellent' | 'high' | 'medium' | 'low';
  resolution: string;
  isHighRes: boolean;
  searchQuery: string;
  likes: number;
}

interface ImageRecommendationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slideContent: string;
  onImageSelected: (imageUrl: string) => void;
}

/**
 * ImageRecommendationDialog Component
 *
 * AI-powered image recommendations from Unsplash (3M+ free photos).
 * Analyzes slide content and shows curated image options with quality indicators.
 *
 * Features:
 * - 4 AI-curated images (literal, professional, abstract, emotional)
 * - Quality indicators (⭐⭐⭐ excellent → ⚠️ low-res warning)
 * - One-click insert (no downloads, no file management)
 * - Photographer attribution
 * - Fallback to manual upload
 */
export function ImageRecommendationDialog({
  isOpen,
  onClose,
  slideContent,
  onImageSelected,
}: ImageRecommendationDialogProps) {
  const [recommendations, setRecommendations] = useState<ImageRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch recommendations when dialog opens
  useEffect(() => {
    if (isOpen && slideContent) {
      fetchRecommendations();
    }
  }, [isOpen, slideContent]);

  const fetchRecommendations = async (customQuery?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommend-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: customQuery || slideContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching image recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (image: ImageRecommendation) => {
    try {
      // Track download (Unsplash requires tracking, Pexels doesn't)
      await fetch('/api/download-unsplash-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          downloadUrl: image.downloadUrl,
          imageUrl: image.url,
          source: (image as any).source || 'unsplash', // Default to unsplash for backward compatibility
        }),
      });

      // Set the image URL for the slide
      onImageSelected(image.url);
      onClose();
    } catch (err) {
      console.error('Error selecting image:', err);
      alert('Failed to select image. You can try uploading manually.');
    }
  };

  const handleCustomSearch = () => {
    if (searchQuery.trim()) {
      fetchRecommendations(searchQuery);
    }
  };

  const getQualityBadge = (quality: string) => {
    const badges = {
      excellent: { stars: 3, label: 'Excellent', color: 'text-green-600' },
      high: { stars: 2, label: 'High Quality', color: 'text-blue-600' },
      medium: { stars: 1, label: 'Medium', color: 'text-amber-600' },
      low: { stars: 0, label: 'Low Res ⚠️', color: 'text-red-600' },
    };

    const badge = badges[quality as keyof typeof badges] || badges.medium;

    return (
      <div className={`flex items-center gap-1 ${badge.color}`}>
        {[...Array(badge.stars)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-current" />
        ))}
        <span className="text-xs font-medium ml-1">{badge.label}</span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Image Recommendations</h2>
              <p className="text-sm text-gray-500">
                Curated from {recommendations[0]?.source === 'pexels' ? 'Pexels' : 'Unsplash'} (Free, high-quality photos)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-sm text-gray-600">AI analyzing your content...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                Unsplash API may be unavailable. Try manual upload below.
              </p>
            </div>
          )}

          {/* Image Grid */}
          {!loading && !error && recommendations.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Based on your content, here are AI-curated images:
              </p>

              <div className="grid grid-cols-2 gap-4">
                {recommendations.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all hover:shadow-lg"
                    onClick={() => handleImageSelect(image)}
                  >
                    {/* Image */}
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <img
                        src={image.thumbnail}
                        alt={image.description}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <div className="text-white text-sm">
                          <p className="font-medium mb-1">{image.description}</p>
                          <p className="text-xs opacity-90">Click to use this image</p>
                        </div>
                      </div>

                      {/* Low-res Warning Badge */}
                      {!image.isHighRes && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          ⚠️ Low Res
                        </div>
                      )}
                    </div>

                    {/* Image Info */}
                    <div className="p-3 space-y-2">
                      {/* Quality Indicator */}
                      {getQualityBadge(image.quality)}

                      {/* Resolution */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{image.resolution}</span>
                        <span>❤️ {image.likes.toLocaleString()}</span>
                      </div>

                      {/* Photographer Credit */}
                      <div className="text-xs text-gray-600">
                        Photo by{' '}
                        <a
                          href={image.photographerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {image.photographer}
                        </a>
                      </div>

                      {/* Search Query Context */}
                      <div className="text-xs text-gray-500 italic">
                        AI searched: "{image.searchQuery}"
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && recommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No images found. Try a custom search or upload manually.</p>
            </div>
          )}

          {/* Custom Search & Manual Upload */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSearch()}
                placeholder="Search custom term..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleCustomSearch}
                disabled={!searchQuery.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                Search
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            <label className="block w-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Convert file to base64 or upload to server
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      onImageSelected(reader.result as string);
                      onClose();
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <p className="text-sm text-gray-600">Upload your own image</p>
                <p className="text-xs text-gray-500">Click to browse</p>
              </div>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

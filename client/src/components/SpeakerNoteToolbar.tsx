import { useState } from 'react';
import { Sparkles, Target, BookOpen, Lightbulb, Loader2, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeakerNoteToolbarProps {
  currentNotes: string;
  slideContent: string;
  selectedTone: string;
  onNotesUpdate: (newNotes: string) => void;
}

type TransformationType = 'expand' | 'simplify' | 'analogy' | 'story';

interface TransformationResult {
  type: TransformationType;
  content: string;
  metadata?: {
    speakingTime?: string;
    keyTakeaway?: string;
    analogyType?: string;
    reasoning?: string;
    storyType?: string;
    warning?: string;
    keyPoint?: string;
  };
}

/**
 * SpeakerNoteToolbar Component
 *
 * Toolbar with 4 AI-powered speaker note transformations:
 * 1. Expand - Brief notes → Full 2-minute framework
 * 2. Simplify - Complex notes → Key bullet points
 * 3. Add Analogy - Generate memorable comparison
 * 4. Add Story - Create concrete example
 *
 * Location: Above speaker notes textarea in RichSectionEditor
 */
export function SpeakerNoteToolbar({
  currentNotes,
  slideContent,
  selectedTone,
  onNotesUpdate,
}: SpeakerNoteToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [transformationResult, setTransformationResult] = useState<TransformationResult | null>(null);
  const [previousNotes, setPreviousNotes] = useState('');

  const handleTransform = async (type: TransformationType) => {
    setLoading(true);
    setPreviousNotes(currentNotes); // Store for undo

    try {
      let endpoint = '';
      let body = {};

      switch (type) {
        case 'expand':
          endpoint = '/api/expand-speaker-notes';
          body = { briefNotes: currentNotes, slideContent, selectedTone };
          break;
        case 'simplify':
          endpoint = '/api/simplify-speaker-notes';
          body = { notes: currentNotes };
          break;
        case 'analogy':
          endpoint = '/api/add-analogy';
          body = { content: slideContent, notes: currentNotes };
          break;
        case 'story':
          endpoint = '/api/add-story';
          body = { content: slideContent, notes: currentNotes };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to transform notes');
      }

      const data = await response.json();

      // Extract content based on response structure
      let transformedContent = '';
      let metadata = {};

      if (type === 'expand') {
        transformedContent = data.expandedNotes;
        metadata = {
          speakingTime: data.speakingTime,
          keyTakeaway: data.keyTakeaway,
        };
      } else if (type === 'simplify') {
        transformedContent = data.simplified;
      } else if (type === 'analogy') {
        transformedContent = currentNotes
          ? `${currentNotes}\n\n---\n\n${data.analogy}`
          : data.analogy;
        metadata = {
          analogyType: data.analogyType,
          reasoning: data.reasoning,
        };
      } else if (type === 'story') {
        transformedContent = currentNotes
          ? `${currentNotes}\n\n---\n\n${data.story}`
          : data.story;
        metadata = {
          storyType: data.storyType,
          warning: data.warning,
          keyPoint: data.keyPoint,
        };
      }

      setTransformationResult({
        type,
        content: transformedContent,
        metadata,
      });

      setShowPreview(true);
    } catch (err) {
      console.error(`Error transforming notes (${type}):`, err);
      alert(`Failed to ${type} notes. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (transformationResult) {
      onNotesUpdate(transformationResult.content);
      setShowPreview(false);
      setTransformationResult(null);
    }
  };

  const handleRegenerate = () => {
    if (transformationResult) {
      handleTransform(transformationResult.type);
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
    setTransformationResult(null);
  };

  const buttons = [
    {
      type: 'expand' as TransformationType,
      icon: Sparkles,
      label: 'Expand',
      tooltip: 'Brief notes → Full framework (2-min structured)',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
    },
    {
      type: 'simplify' as TransformationType,
      icon: Target,
      label: 'Simplify',
      tooltip: 'Complex notes → Key bullet points',
      color: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
    },
    {
      type: 'analogy' as TransformationType,
      icon: BookOpen,
      label: 'Add Analogy',
      tooltip: 'Generate memorable comparison',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
    },
    {
      type: 'story' as TransformationType,
      icon: Lightbulb,
      label: 'Add Story',
      tooltip: 'Create concrete example (AI-generated)',
      color: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200',
    },
  ];

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 font-medium">AI Transformations:</span>
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.type}
              onClick={() => handleTransform(btn.type)}
              disabled={loading || !slideContent}
              title={btn.tooltip}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${btn.color} transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium`}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && transformationResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={handleCancel}
            />

            {/* Preview Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {transformationResult.type === 'expand' && '✨ Expanded Speaker Notes'}
                      {transformationResult.type === 'simplify' && '🎯 Simplified Notes'}
                      {transformationResult.type === 'analogy' && '📖 Analogy Added'}
                      {transformationResult.type === 'story' && '💡 Story Added'}
                    </h3>
                    {transformationResult.metadata?.speakingTime && (
                      <p className="text-sm opacity-90">
                        Speaking time: {transformationResult.metadata.speakingTime}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
                {/* Warning for AI-generated stories */}
                {transformationResult.type === 'story' && transformationResult.metadata?.warning && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-900 font-medium mb-1">
                      ⚠️ {transformationResult.metadata.warning}
                    </p>
                    <p className="text-xs text-amber-700">
                      Review and modify as needed before presenting.
                    </p>
                  </div>
                )}

                {/* Transformed Content */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                    {transformationResult.content}
                  </pre>
                </div>

                {/* Metadata */}
                {transformationResult.metadata && (
                  <div className="mt-4 space-y-2">
                    {transformationResult.metadata.keyTakeaway && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Key Takeaway:</span>{' '}
                        <span className="text-gray-600">{transformationResult.metadata.keyTakeaway}</span>
                      </div>
                    )}
                    {transformationResult.metadata.reasoning && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Why this works:</span>{' '}
                        <span className="text-gray-600">{transformationResult.metadata.reasoning}</span>
                      </div>
                    )}
                    {transformationResult.metadata.keyPoint && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Illustrates:</span>{' '}
                        <span className="text-gray-600">{transformationResult.metadata.keyPoint}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Regenerate
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Accept & Use
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

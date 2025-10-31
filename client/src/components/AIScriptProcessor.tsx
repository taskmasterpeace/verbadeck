import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ModelSelector } from './ModelSelector';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { getDefaultModel } from '@/lib/openrouter-models';
import { Loader2, Sparkles, FileText } from 'lucide-react';
import type { Section } from '@/lib/script-parser';

interface AIScriptProcessorProps {
  onSectionsGenerated: (sections: Section[]) => void;
}

export function AIScriptProcessor({ onSectionsGenerated }: AIScriptProcessorProps) {
  const [rawText, setRawText] = useState('');
  const [selectedModel, setSelectedModel] = useState(getDefaultModel().id);
  const { processScript, isProcessing, error, progress } = useOpenRouter();

  const handleProcess = async () => {
    if (!rawText.trim()) {
      alert('Please enter some text to process');
      return;
    }

    try {
      const result = await processScript(rawText, selectedModel);

      // Convert API response to Section format
      const sections: Section[] = result.sections.map((sec, index) => {
        const normalizedPrimary = sec.primaryTrigger.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedAlternatives = (sec.alternativeTriggers || []).map(t =>
          t.toLowerCase().replace(/[^a-z0-9]/g, '')
        );

        return {
          id: `section-${index}`,
          content: sec.content,
          advanceToken: normalizedPrimary,
          alternativeTriggers: sec.alternativeTriggers,
          // Activate ALL triggers (primary + alternatives) from the start
          selectedTriggers: [normalizedPrimary, ...normalizedAlternatives],
        };
      });

      onSectionsGenerated(sections);
      setRawText(''); // Clear input after successful processing
    } catch (err) {
      console.error('Processing failed:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Script Processor
        </CardTitle>
        <CardDescription>
          Paste your raw script text and let AI format it into presentation sections with smart trigger words
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Model Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select AI Model</label>
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>

        {/* Text Input */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Raw Script Text
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your presentation script here...

For example:
Today I want to talk about our revolutionary product. We've been working on this for years and finally have something amazing to share.

The problem we're solving is simple but critical. Millions of people struggle with presentations every day. They waste time formatting and organizing their thoughts."
            className="w-full h-64 p-4 rounded-md border bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isProcessing}
          />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{rawText.length.toLocaleString()} characters</span>
            <span>Max: 50,000 characters</span>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing with AI... This may take 30-60 seconds</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleProcess}
          disabled={isProcessing || !rawText.trim()}
          className="w-full px-4 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Process with AI
            </>
          )}
        </button>

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
          <p><strong>💡 Tips for best results:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Provide complete sentences and paragraphs</li>
            <li>AI will automatically split into digestible sections</li>
            <li>Trigger words are chosen based on impact and clarity</li>
            <li>You can edit sections and triggers after processing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

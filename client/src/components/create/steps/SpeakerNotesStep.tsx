import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SpeakerNotesStepProps {
  numSlides: number;
  isGenerating: boolean;
  onGenerate: () => void;
  onSkip: () => void;
}

export function SpeakerNotesStep({
  numSlides,
  isGenerating,
  onGenerate,
  onSkip,
}: SpeakerNotesStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Speaker Notes?</CardTitle>
        <CardDescription>
          Generate a full speaking script for your presentation, or skip to use slide content only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold mb-2">📝 What are Speaker Notes?</h4>
          <p className="text-sm text-gray-700">
            Your complete speaking script with stories, examples, and extra context -
            what YOU say while the audience sees the slide content.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Scripts...
              </>
            ) : (
              'Generate Speaker Notes'
            )}
          </button>

          <button
            onClick={onSkip}
            disabled={isGenerating}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip - No Script Needed
          </button>
        </div>

        {isGenerating && (
          <p className="text-sm text-gray-600 text-center">
            Generating speaking scripts for {numSlides} slides... (~10-15 seconds)
          </p>
        )}
      </CardContent>
    </Card>
  );
}

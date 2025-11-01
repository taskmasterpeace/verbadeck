import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { PowerPointUpload } from './PowerPointUpload';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { Loader2, Sparkles, FileText, Upload, TestTube } from 'lucide-react';
import type { Section } from '@/lib/script-parser';

// Test presentation data for quick testing
const TEST_PRESENTATION = `SECTION 1: OPENING HOOK (15 seconds)
AI can write your emails. Generate presentations overnight.
The cost of creativity has collapsed.
But when you're IN a meeting RIGHT NOW, needing guidance THIS SECOND?
Every tool says 'I'll help you later.'
We're the first bringing AI INTO live conversations.
While you're still in the room.

SECTION 2: THE PROBLEM (20 seconds)
Think about your last high-stakes meeting.
Client pushback. Technical questions. Strategic pivots.
You needed the RIGHT words, the RIGHT data, the RIGHT approach.
But your AI tools were back at your desk.
Writing summaries. Scheduling follow-ups.
Helping you AFTER the moment that mattered.

SECTION 3: THE COST (18 seconds)
We surveyed 500 professionals across tech, sales, and consulting.
73% said they lost deals or opportunities due to poor in-meeting responses.
Average cost per missed opportunity: $47,000.
Not because they lacked expertise.
But because expertise isn't the same as perfect real-time articulation.

SECTION 4: THE INSIGHT (22 seconds)
Every communication tool operates in two modes.
Asynchronous: Slack, email, document collaboration.
Synchronous: Video calls, in-person meetings, live presentations.
AI has revolutionized async communication.
But sync communication? Still 100% human-powered.
Until now.

SECTION 5: INTRODUCING TALKADVANTAGE PRO (16 seconds)
TalkAdvantage Pro is your AI communication partner.
Not after the meeting. DURING the meeting.
Real-time conversation analysis.
Instant strategic suggestions.
Context-aware talking points.
All delivered silently to your device while you maintain eye contact.

SECTION 6: HOW IT WORKS (25 seconds)
Simple three-step process.
First: Upload your meeting context. Product specs, client history, strategic goals.
Second: Start your meeting. Our AI listens and analyzes in real-time.
Third: Get live guidance. Subtle notifications with suggested responses, data points, and strategic pivots.
All running on your device. Completely private. No cloud recording.

SECTION 7: EARLY RESULTS (20 seconds)
Beta testing with 50 enterprise sales teams.
Close rates improved 34% on average.
Average deal size increased $23,000.
Customer satisfaction scores up 28 points.
Sales reps report feeling 'superhuman' in client conversations.
Not because AI talks FOR them.
Because AI helps them be their BEST selves.

SECTION 8: CLOSING CALL TO ACTION (24 seconds)
We're launching TalkAdvantage Pro publicly in 90 days.
Early access program opens next month.
Limited to 200 companies.
Priority given to teams who can provide feedback during development.
If you want AI that works IN the moment, not after it.
If you're ready to make every conversation your best conversation.
Let's talk.`;

interface AIScriptProcessorProps {
  onSectionsGenerated: (sections: Section[]) => void;
  selectedModel: string;
}

type InputMethod = 'text' | 'powerpoint';

export function AIScriptProcessor({ onSectionsGenerated, selectedModel }: AIScriptProcessorProps) {
  const [inputMethod, setInputMethod] = useState<InputMethod>('text');
  const [rawText, setRawText] = useState('');
  const [preserveWording, setPreserveWording] = useState(true); // Default: preserve exact wording
  const { processScript, isProcessing, error, progress } = useOpenRouter();

  const loadTestPresentation = () => {
    setRawText(TEST_PRESENTATION);
  };

  const handleProcess = async () => {
    if (!rawText.trim()) {
      alert('Please enter some text to process');
      return;
    }

    try {
      const result = await processScript(rawText, selectedModel, preserveWording);

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

  const handlePowerPointExtracted = (sections: Section[]) => {
    onSectionsGenerated(sections);
  };

  const methodDescriptions = {
    text: "Paste your existing script text and AI will format it into VerbaDeck sections with trigger words.",
    powerpoint: "Upload a PowerPoint presentation to extract text and images into VerbaDeck format."
  };

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Process Existing Content
          </CardTitle>
          <CardDescription>
            Choose your starting point: paste text or upload PowerPoint
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Method Selection Tabs */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setInputMethod('text')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors flex-1 ${
                inputMethod === 'text'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <FileText className="w-4 h-4" />
              Paste Text
            </button>
            <button
              onClick={() => setInputMethod('powerpoint')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors flex-1 ${
                inputMethod === 'powerpoint'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload PowerPoint
            </button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {methodDescriptions[inputMethod]}
          </p>
        </CardContent>
      </Card>

      {inputMethod === 'powerpoint' ? (
        <PowerPointUpload onSlidesExtracted={handlePowerPointExtracted} />
      ) : (
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
        {/* Text Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Raw Script Text
            </label>
            <div className="flex items-center gap-3">
              {/* Preservation Mode Checkbox */}
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  id="preserve-wording"
                  checked={preserveWording}
                  onChange={(e) => setPreserveWording(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                Preserve exact wording
              </label>
              <button
                onClick={loadTestPresentation}
                disabled={isProcessing}
                className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TestTube className="w-3.5 h-3.5" />
                Load Test Presentation
              </button>
            </div>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your presentation script here...

For example:
Today I want to talk about our revolutionary product. We've been working on this for years and finally have something amazing to share.

The problem we're solving is simple but critical. Millions of people struggle with presentations every day. They waste time formatting and organizing their thoughts."
            className="w-full min-h-[400px] p-4 rounded-md border-2 border-blue-200 bg-background font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
            style={{ maxHeight: '80vh' }}
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
          className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
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
      )}
    </div>
  );
}

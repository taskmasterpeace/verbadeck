import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioStreaming } from './hooks/useAudioStreaming';
import { useTransitions } from './hooks/useTransitions';
import { createTokenPattern, type Section } from './lib/script-parser';
import { getDefaultModel } from './lib/openrouter-models';
import { PresenterView } from './components/PresenterView';
import { StatusBar } from './components/StatusBar';
import { TranscriptTicker } from './components/TranscriptTicker';
import { AIScriptProcessor } from './components/AIScriptProcessor';
import { RichSectionEditor } from './components/RichSectionEditor';
import { TransitionEffects } from './components/TransitionEffects';
import { StatusIndicator } from './components/StatusIndicator';
import { TriggerCarousel } from './components/TriggerCarousel';
import { Card, CardContent } from './components/ui/card';
import { FileText, Sparkles, Edit } from 'lucide-react';

type ViewMode = 'ai-processor' | 'editor' | 'presenter';

export default function App() {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('ai-processor');
  const [selectedModel] = useState(getDefaultModel().id);

  // Broadcast channel for audience view sync
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // No mode/wake/stop word states needed - always listening when streaming

  // Live transcript
  const [transcript, setTranscript] = useState<string[]>([]);
  const [lastTranscript, setLastTranscript] = useState('');

  // Debounce to prevent double-advance/back on echo
  const lastNavTimeRef = useRef<number>(0);
  const NAV_DEBOUNCE_MS = 2000;

  // Transitions
  const { shouldFlash, triggerTransition } = useTransitions();

  // Advance to next section
  const advanceSection = useCallback(() => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < NAV_DEBOUNCE_MS) {
      console.log('⏱️ Debounced advance (too soon)');
      return;
    }

    setCurrentSectionIndex((prev) => {
      if (prev < sections.length - 1) {
        const next = prev + 1;
        console.log(`➡️ Advancing to section ${next + 1}/${sections.length}`);
        lastNavTimeRef.current = now;
        triggerTransition(); // Visual feedback
        return next;
      }
      console.log('🏁 Already at last section');
      return prev;
    });
  }, [sections.length, triggerTransition]);

  // Go back to previous section
  const goBackSection = useCallback(() => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < NAV_DEBOUNCE_MS) {
      console.log('⏱️ Debounced back (too soon)');
      return;
    }

    setCurrentSectionIndex((prev) => {
      if (prev > 0) {
        const prevIdx = prev - 1;
        console.log(`⬅️ Going back to section ${prevIdx + 1}/${sections.length}`);
        lastNavTimeRef.current = now;
        triggerTransition(); // Visual feedback
        return prevIdx;
      }
      console.log('🏁 Already at first section');
      return prev;
    });
  }, [sections.length, triggerTransition]);

  // Check for trigger words (no wake/stop words - always advancing)
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    console.log('📝 handleTranscript called:', text, 'isFinal:', isFinal);

    setLastTranscript(text);

    // Add to transcript ticker (only final)
    if (isFinal) {
      setTranscript((prev) => [...prev.slice(-20), text]);
    }

    const lowerText = text.toLowerCase();

    // Check for BACK command first (works on any section except first)
    if (currentSectionIndex > 0) {
      const backWords = ['back', 'previous', 'go back'];
      for (const backWord of backWords) {
        if (lowerText.includes(backWord)) {
          console.log(`⬅️ Back command detected: "${backWord}"`);
          goBackSection();
          return; // Don't check for other triggers
        }
      }
    }

    // Check for section-specific trigger words
    if (sections.length > 0 && currentSectionIndex < sections.length) {
      const currentSection = sections[currentSectionIndex];
      const triggers = currentSection.selectedTriggers || [currentSection.advanceToken];

      console.log(`🔍 Section ${currentSectionIndex + 1} - Looking for triggers:`, triggers);
      console.log(`   Transcript: "${lowerText}"`);

      // Check all selected triggers
      for (const trigger of triggers) {
        const pattern = createTokenPattern(trigger);
        console.log(`   Testing "${trigger}" with pattern ${pattern} against "${lowerText}"`);
        if (pattern.test(lowerText)) {
          console.log(`✅ Trigger word matched: "${trigger}"`);
          advanceSection();
          break;
        } else {
          console.log(`   ❌ No match`);
        }
      }
    }
  }, [sections, currentSectionIndex, advanceSection, goBackSection]);

  const { isStreaming, status, startStreaming, stopStreaming } = useAudioStreaming({
    onTranscript: handleTranscript,
    onError: (error) => {
      console.error('Streaming error:', error);
      alert(`Error: ${error}`);
    },
  });

  // Auto-fix old sections that don't have selectedTriggers populated
  useEffect(() => {
    setSections(prevSections =>
      prevSections.map(section => {
        // If selectedTriggers is missing, populate it from existing data
        if (!section.selectedTriggers || section.selectedTriggers.length === 0) {
          const normalized = (section.alternativeTriggers || []).map(t =>
            t.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          const fixed = {
            ...section,
            selectedTriggers: [section.advanceToken, ...normalized]
          };
          console.log(`🔧 Auto-fixed section "${section.id}" - added ${normalized.length} alternative triggers`);
          return fixed;
        }
        return section;
      })
    );
  }, []); // Run once on mount

  // No keyboard controls needed - always armed

  // Manual section navigation (for testing)
  const goToSection = (index: number) => {
    if (index >= 0 && index < sections.length) {
      setCurrentSectionIndex(index);
    }
  };

  // Handle AI-generated sections
  const handleSectionsGenerated = (newSections: Section[]) => {
    console.log('📋 handleSectionsGenerated - Received sections:', newSections.length);
    newSections.forEach((sec, i) => {
      console.log(`  Section ${i + 1}:`, {
        id: sec.id,
        advanceToken: sec.advanceToken,
        selectedTriggers: sec.selectedTriggers,
        alternativeTriggers: sec.alternativeTriggers
      });
    });
    setSections(newSections);
    setCurrentSectionIndex(0);
    setViewMode('editor'); // Show editor to allow customization
  };

  // Update a section
  const handleUpdateSection = (index: number, updatedSection: Section) => {
    setSections((prev) =>
      prev.map((sec, i) => (i === index ? updatedSection : sec))
    );
  };

  // Delete a section
  const handleDeleteSection = (index: number) => {
    if (sections.length <= 1) {
      alert('Cannot delete the last section');
      return;
    }
    setSections((prev) => prev.filter((_, i) => i !== index));
    if (currentSectionIndex >= sections.length - 1) {
      setCurrentSectionIndex(Math.max(0, sections.length - 2));
    }
  };

  // Start presenting
  const handleStartPresenting = () => {
    if (sections.length === 0) {
      alert('Please create sections first');
      return;
    }
    setViewMode('presenter');
    setCurrentSectionIndex(0);
  };

  // Set up broadcast channel for audience view
  useEffect(() => {
    const channel = new BroadcastChannel('verbadeck-presentation');
    broadcastChannelRef.current = channel;

    // Listen for state requests from audience window
    channel.onmessage = (event) => {
      if (event.data.type === 'request-state') {
        channel.postMessage({
          type: 'presentation-update',
          state: {
            currentSectionIndex,
            sections,
          },
        });
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Broadcast state changes to audience view
  useEffect(() => {
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'presentation-update',
        state: {
          currentSectionIndex,
          sections,
        },
      });
    }
  }, [currentSectionIndex, sections]);

  // Open audience view in new window
  const openAudienceView = () => {
    const audienceWindow = window.open(
      '/audience',
      'VerbaDeck Audience View',
      'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no'
    );

    if (!audienceWindow) {
      alert('Please allow popups to open the audience view');
    }
  };

  const currentSection = sections[currentSectionIndex];
  const previousSection = sections[currentSectionIndex - 1];
  const nextSection = sections[currentSectionIndex + 1];
  const progress = sections.length > 0 ? ((currentSectionIndex + 1) / sections.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StatusBar
        streamStatus={status}
        isStreaming={isStreaming}
        onToggleStream={isStreaming ? stopStreaming : startStreaming}
      />

      {/* Floating status indicator */}
      <StatusIndicator isStreaming={isStreaming} />

      <div className="container mx-auto p-4 space-y-4">
        {/* View Mode Tabs */}
        {!isStreaming && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('ai-processor')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'ai-processor'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  AI Processor
                </button>
                <button
                  onClick={() => setViewMode('editor')}
                  disabled={sections.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    viewMode === 'editor'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  Edit Sections ({sections.length})
                </button>
                <button
                  onClick={() => setViewMode('presenter')}
                  disabled={sections.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    viewMode === 'presenter'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Present
                </button>

                {sections.length > 0 && viewMode !== 'presenter' && (
                  <button
                    onClick={handleStartPresenting}
                    className="ml-auto px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                  >
                    Start Presenting
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Script Processor View */}
        {viewMode === 'ai-processor' && !isStreaming && (
          <AIScriptProcessor onSectionsGenerated={handleSectionsGenerated} />
        )}

        {/* Section Editor View */}
        {viewMode === 'editor' && !isStreaming && sections.length > 0 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Edit Your Sections</h2>
                    <p className="text-sm text-muted-foreground">
                      Click words to select trigger points, or use AI to suggest better options
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {sections.map((section, index) => (
              <RichSectionEditor
                key={section.id}
                section={section}
                sectionIndex={index}
                totalSections={sections.length}
                onUpdate={(updatedSection) => handleUpdateSection(index, updatedSection)}
                onDelete={() => handleDeleteSection(index)}
                selectedModel={selectedModel}
              />
            ))}
          </div>
        )}

        {/* Presenter View */}
        {(viewMode === 'presenter' || isStreaming) && sections.length > 0 && (
          <>
            {/* Open Audience View Button */}
            {!isStreaming && (
              <Card>
                <CardContent className="p-4">
                  <button
                    onClick={openAudienceView}
                    className="w-full px-4 py-3 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 font-medium transition-colors"
                  >
                    🖥️ Open Audience View (Dual Monitor)
                  </button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Opens a clean view on your second monitor for your audience
                  </p>
                </CardContent>
              </Card>
            )}

            <TransitionEffects
              transitionKey={currentSectionIndex}
              shouldFlash={shouldFlash}
            >
              <PresenterView
                currentSection={currentSection}
                nextSection={nextSection}
                sectionIndex={currentSectionIndex}
                totalSections={sections.length}
                progress={progress}
                onSectionClick={goToSection}
              />
            </TransitionEffects>
          </>
        )}

        {/* Trigger Word Carousel - Fixed to bottom when streaming */}
        {isStreaming && (
          <TriggerCarousel
            currentSection={currentSection}
            previousSection={previousSection}
            nextSection={nextSection}
            sectionIndex={currentSectionIndex}
          />
        )}

        {/* Transcript Ticker - Fixed at very bottom when streaming */}
        {isStreaming && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t shadow-lg">
            <div className="container mx-auto px-4 py-2">
              <TranscriptTicker
                transcript={transcript}
                lastTranscript={lastTranscript}
              />
            </div>
          </div>
        )}

        {/* Debug Info */}
        {import.meta.env.DEV && sections.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-xs space-y-1">
            <div>View: {viewMode}</div>
            <div>Section: {currentSectionIndex + 1}/{sections.length}</div>
            <div>Current Tokens: {currentSection?.selectedTriggers?.join(', ') || currentSection?.advanceToken || 'N/A'}</div>
            <div>Stream Status: {status}</div>
            <div>Last Transcript: {lastTranscript}</div>
          </div>
        )}
      </div>
    </div>
  );
}

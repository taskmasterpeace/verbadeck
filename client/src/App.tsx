import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioStreaming } from './hooks/useAudioStreaming';
import { useTransitions } from './hooks/useTransitions';
import { useOpenRouter } from './hooks/useOpenRouter';
import { createTokenPattern, type Section } from './lib/script-parser';
import { savePresentation, loadPresentation } from './lib/file-storage';
import { PresenterView } from './components/PresenterView';
import { StatusBar } from './components/StatusBar';
import { TranscriptTicker } from './components/TranscriptTicker';
import { AIScriptProcessor } from './components/AIScriptProcessor';
import { RichSectionEditor } from './components/RichSectionEditor';
import { TransitionEffects } from './components/TransitionEffects';
import { StatusIndicator } from './components/StatusIndicator';
import { TriggerCarousel } from './components/TriggerCarousel';
import { QAPanel } from './components/QAPanel';
import { Card, CardContent } from './components/ui/card';
import { FileText, Sparkles, Edit, Save, FolderOpen, Info, Wand2 } from 'lucide-react';
import { CreateFromScratch, type PresentationConfig } from './components/CreateFromScratch';

type ViewMode = 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch';

export default function App() {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('ai-processor');
  const [selectedModel] = useState<string>(() => {
    return localStorage.getItem('verbadeck-selected-model') || 'anthropic/claude-3.5-sonnet';
  });

  // Broadcast channel for audience view sync
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // No mode/wake/stop word states needed - always listening when streaming

  // Live transcript
  const [transcript, setTranscript] = useState<string[]>([]);
  const [lastTranscript, setLastTranscript] = useState('');

  // Q&A Feature
  const [isListeningForQuestions, setIsListeningForQuestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionTalkingPoints, setQuestionTalkingPoints] = useState<string[]>([]);
  const [isLoadingQA, setIsLoadingQA] = useState(false);
  const { suggestTriggers } = useOpenRouter();

  // Debounce to prevent double-advance/back on echo
  const lastNavTimeRef = useRef<number>(0);
  const NAV_DEBOUNCE_MS = 2000;

  // Transitions
  const { shouldFlash, triggerTransition } = useTransitions();

  // Q&A Handlers
  const handleQuestionDetected = async (question: string) => {
    setCurrentQuestion(question);
    setIsLoadingQA(true);
    setQuestionTalkingPoints([]);

    try {
      // Generate AI talking points using the existing suggestTriggers API
      // (We'll reuse this since it's similar - generates suggestions based on text)
      const points = await suggestTriggers(
        `Generate 3-5 concise talking points to answer this question: ${question}`,
        selectedModel
      );
      setQuestionTalkingPoints(points);
    } catch (error) {
      console.error('Failed to generate talking points:', error);
      setQuestionTalkingPoints(['Unable to generate talking points. Please answer manually.']);
    } finally {
      setIsLoadingQA(false);
    }
  };

  const handleDismissQuestion = () => {
    setCurrentQuestion(null);
    setQuestionTalkingPoints([]);
    setIsLoadingQA(false);
  };

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

    // Check for questions when Q&A mode is enabled (only on final transcripts)
    if (isListeningForQuestions && isFinal && text.includes('?')) {
      console.log('❓ Question detected:', text);
      handleQuestionDetected(text);
      return; // Don't process other triggers when question detected
    }

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
  }, [sections, currentSectionIndex, advanceSection, goBackSection, isListeningForQuestions]);

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

  // Keep a ref to current state for BroadcastChannel
  const currentStateRef = useRef({ currentSectionIndex, sections });
  currentStateRef.current = { currentSectionIndex, sections };

  // Set up broadcast channel for audience view
  useEffect(() => {
    const channel = new BroadcastChannel('verbadeck-presentation');
    broadcastChannelRef.current = channel;

    // Listen for state requests from audience window
    channel.onmessage = (event) => {
      if (event.data.type === 'request-state') {
        // Use ref to get current values instead of closure
        channel.postMessage({
          type: 'presentation-update',
          state: currentStateRef.current,
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

  // Open audience view in new window with Window Management API support
  const openAudienceView = async () => {
    try {
      // Try to use Window Management API for multi-screen support
      if ('getScreenDetails' in window) {
        const screenDetails = await (window as any).getScreenDetails();
        console.log('📺 Screens detected:', screenDetails.screens.length);

        // If multiple screens, open on the second screen
        if (screenDetails.screens.length > 1) {
          const externalScreen = screenDetails.screens[1];
          const audienceWindow = window.open(
            '/audience',
            'VerbaDeck Audience View',
            `left=${externalScreen.left},top=${externalScreen.top},width=${externalScreen.availWidth},height=${externalScreen.availHeight},menubar=no,toolbar=no,location=no,status=no`
          );

          if (audienceWindow) {
            // Try to make it fullscreen on the external display
            try {
              await (audienceWindow.document.documentElement as any).requestFullscreen({
                screen: externalScreen
              });
              console.log('✅ Fullscreen on external display');
            } catch (err) {
              console.log('ℹ️ Fullscreen not supported or denied');
            }
          } else {
            alert('Please allow popups to open the audience view');
          }
          return;
        }
      }
    } catch (err) {
      console.log('ℹ️ Window Management API not available, using fallback');
    }

    // Fallback: Standard window.open
    const audienceWindow = window.open(
      '/audience',
      'VerbaDeck Audience View',
      'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no'
    );

    if (!audienceWindow) {
      alert('Please allow popups to open the audience view');
    }
  };

  // Save presentation to file
  const handleSavePresentation = async () => {
    if (sections.length === 0) {
      alert('No presentation to save');
      return;
    }

    try {
      await savePresentation(sections);
      console.log('✅ Presentation saved');
    } catch (error) {
      console.error('Error saving presentation:', error);
      alert('Failed to save presentation');
    }
  };

  // Load presentation from file
  const handleLoadPresentation = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await loadPresentation(file);
      setSections(data.sections);
      setCurrentSectionIndex(0);
      setViewMode('editor');
      console.log(`✅ Loaded presentation with ${data.sections.length} sections`);

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Error loading presentation:', error);
      alert(error instanceof Error ? error.message : 'Failed to load presentation');
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
        isListeningForQuestions={isListeningForQuestions}
        onToggleQuestions={() => setIsListeningForQuestions(!isListeningForQuestions)}
      />

      {/* Floating status indicator */}
      <StatusIndicator isStreaming={isStreaming} />

      <div className="container mx-auto p-4 space-y-4">
        {/* View Mode Tabs */}
        {!isStreaming && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('create-from-scratch')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-semibold ${
                    viewMode === 'create-from-scratch'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  Create from Scratch
                </button>
                <button
                  onClick={() => setViewMode('ai-processor')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-semibold ${
                    viewMode === 'ai-processor'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  AI Processor
                </button>
                <button
                  onClick={() => setViewMode('editor')}
                  disabled={sections.length === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                    viewMode === 'editor'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  Edit Sections ({sections.length})
                </button>
                <button
                  onClick={() => setViewMode('presenter')}
                  disabled={sections.length === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                    viewMode === 'presenter'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Present
                </button>

                {sections.length > 0 && viewMode !== 'presenter' && (
                  <>
                    <div className="ml-auto flex items-center gap-2">
                      {/* Save Button */}
                      <button
                        onClick={handleSavePresentation}
                        className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        title="Save presentation"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>

                      {/* Start Presenting Button */}
                      <button
                        onClick={handleStartPresenting}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        Start Presenting
                      </button>
                    </div>
                  </>
                )}

                {/* Load Button (always visible) */}
                <div className={sections.length === 0 || viewMode === 'presenter' ? 'ml-auto' : ''}>
                  <input
                    type="file"
                    accept=".verbadeck,.json"
                    onChange={handleLoadPresentation}
                    className="hidden"
                    id="load-presentation"
                  />
                  <label htmlFor="load-presentation">
                    <button
                      onClick={() => document.getElementById('load-presentation')?.click()}
                      className="px-5 py-2.5 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                      title="Load presentation"
                      type="button"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Load
                    </button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create from Scratch View */}
        {viewMode === 'create-from-scratch' && !isStreaming && (
          <CreateFromScratch
            onGenerate={(config: PresentationConfig) => {
              console.log('Create from Scratch config:', config);
              // TODO: Implement backend generation
              alert('Create from Scratch feature coming soon! Config logged to console.');
            }}
          />
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
                currentQuestion={currentQuestion}
                questionTalkingPoints={questionTalkingPoints}
                isLoadingQA={isLoadingQA}
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
            <div>Q&A Mode: {isListeningForQuestions ? 'ON' : 'OFF'}</div>
          </div>
        )}
      </div>

      {/* Q&A Panel Modal */}
      {currentQuestion && (
        <QAPanel
          question={currentQuestion}
          talkingPoints={questionTalkingPoints}
          isLoading={isLoadingQA}
          onDismiss={handleDismissQuestion}
        />
      )}
    </div>
  );
}

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
import { KnowledgeBaseEditor } from './components/KnowledgeBaseEditor';
import { TransitionEffects } from './components/TransitionEffects';
import { StatusIndicator } from './components/StatusIndicator';
import { TriggerCarousel } from './components/TriggerCarousel';
import { QAPanel } from './components/QAPanel';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { FileText, Sparkles, Edit, Save, FolderOpen, Info, Wand2, MessageCircle, ImagePlus } from 'lucide-react';
import { CreateFromScratch } from './components/CreateFromScratch';
import { ToneSelector } from './components/ToneSelector';
import { CreatePresentation } from './components/CreatePresentation';
import { useImageGeneration } from './hooks/useImageGeneration';
import { Footer } from './components/Footer';

type ViewMode = 'create' | 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch';

export default function App() {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('create');
  const [editorTab, setEditorTab] = useState<'sections' | 'knowledge'>('sections');
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('verbadeck-selected-model') || 'anthropic/claude-3.5-sonnet';
  });

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('verbadeck-selected-model', modelId);
  };

  // Broadcast channel for audience view sync
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // No mode/wake/stop word states needed - always listening when streaming

  // Live transcript
  const [transcript, setTranscript] = useState<string[]>([]);
  const [lastTranscript, setLastTranscript] = useState('');

  // Q&A Feature
  const [isListeningForQuestions, setIsListeningForQuestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<{ answer1: string; answer2: string } | null>(null);
  const [isLoadingQA, setIsLoadingQA] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<{ question: string; answer: string }[]>([]);
  const [isGeneratingFAQs, setIsGeneratingFAQs] = useState(false);
  const [qaDialogOpen, setQaDialogOpen] = useState(false);
  const [manualQuestion, setManualQuestion] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const { answerQuestion, generateFAQs } = useOpenRouter();
  const { generateImage, suggestPrompt } = useImageGeneration();

  // Bulk image generation state
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkStatus, setBulkStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Debounce to prevent double-advance/back on echo
  const lastNavTimeRef = useRef<number>(0);
  const NAV_DEBOUNCE_MS = 2000;

  // Transitions
  const { shouldFlash, triggerTransition } = useTransitions();

  // Q&A Handlers
  const handleQuestionDetected = async (question: string) => {
    setCurrentQuestion(question);
    setIsLoadingQA(true);
    setQuestionAnswers(null);

    try {
      // Get full presentation content
      const presentationContent = sections.map(s => s.content).join('\n\n');

      // Use the proper answerQuestion API with tone support
      const answers = await answerQuestion(
        question,
        presentationContent,
        knowledgeBase,
        selectedModel,
        selectedTone
      );
      setQuestionAnswers(answers);
    } catch (error) {
      console.error('Failed to generate answer:', error);
      setQuestionAnswers({
        answer1: 'Unable to generate answer. Please respond manually.',
        answer2: 'Error occurred while processing the question.'
      });
    } finally {
      setIsLoadingQA(false);
    }
  };

  const handleDismissQuestion = () => {
    setCurrentQuestion(null);
    setQuestionAnswers(null);
    setIsLoadingQA(false);
    setQaDialogOpen(false);
  };

  const handleManualQuestion = async () => {
    if (!manualQuestion.trim()) {
      alert('Please enter a question');
      return;
    }
    // Close the dialog immediately
    setQaDialogOpen(false);
    // Process the question
    await handleQuestionDetected(manualQuestion);
    // Clear the question
    setManualQuestion('');
  };

  const handleGenerateFAQs = async () => {
    if (sections.length === 0) {
      alert('Please create sections first');
      return;
    }

    setIsGeneratingFAQs(true);
    try {
      const presentationContent = sections.map(s => s.content).join('\n\n');
      const faqs = await generateFAQs(presentationContent, selectedModel);

      // Replace existing FAQs with newly generated ones
      setKnowledgeBase(faqs);

      // Switch to knowledge base tab to show results
      setEditorTab('knowledge');

      console.log(`✅ Generated ${faqs.length} FAQs`);
    } catch (error) {
      console.error('Failed to generate FAQs:', error);
      alert('Failed to generate FAQs. Please try again.');
    } finally {
      setIsGeneratingFAQs(false);
    }
  };

  // Bulk generate images for all sections without images
  const handleBulkGenerateImages = async () => {
    setBulkStatus(null); // Clear any previous status

    if (sections.length === 0) {
      setBulkStatus({ type: 'error', message: 'Please create sections first' });
      return;
    }

    console.log('📊 Checking sections for images...');
    sections.forEach((section, idx) => {
      console.log(`Section ${idx + 1}: imageUrl =`, section.imageUrl ? 'HAS IMAGE' : 'NO IMAGE');
    });

    // Find sections without images (check for both undefined and empty string)
    const sectionsNeedingImages = sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => !section.imageUrl || section.imageUrl.trim() === '');

    console.log(`📝 Found ${sectionsNeedingImages.length} sections needing images out of ${sections.length} total`);

    if (sectionsNeedingImages.length === 0) {
      setBulkStatus({ type: 'info', message: 'All sections already have images!' });
      return;
    }

    setBulkStatus({ type: 'info', message: `Starting generation for ${sectionsNeedingImages.length} section(s)...` });

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: sectionsNeedingImages.length });

    const presentationContext = sections.map(s => s.content).join('\n\n');

    try {
      for (let i = 0; i < sectionsNeedingImages.length; i++) {
        const { section, index } = sectionsNeedingImages[i];
        setBulkProgress({ current: i + 1, total: sectionsNeedingImages.length });

        console.log(`🎨 Generating image ${i + 1}/${sectionsNeedingImages.length} for section ${index + 1}`);

        // Generate AI prompt with full context
        const prompt = await suggestPrompt(section.content, presentationContext, selectedModel);
        console.log(`📝 Generated prompt for section ${index + 1}:`, prompt);

        // Generate image with default settings (1:1, JPG)
        const imageUrl = await generateImage(prompt, {
          aspectRatio: '1:1',
          outputFormat: 'jpg',
        });

        if (!imageUrl || imageUrl.trim() === '') {
          console.error(`❌ Generated image URL is empty for section ${index + 1}!`);
          throw new Error(`Image generation returned empty URL for section ${index + 1}`);
        }

        console.log(`✅ Generated image for section ${index + 1}`);
        console.log(`   Length: ${imageUrl.length} chars`);
        console.log(`   Starts with: ${imageUrl.substring(0, 30)}`);

        // Update sections state incrementally - create new array with the updated section
        setSections(prevSections => {
          console.log(`🔄 Updating section ${index + 1}...`);
          console.log(`   Previous imageUrl: ${prevSections[index].imageUrl ? 'EXISTS' : 'NONE'}`);

          const newSections = [...prevSections];
          newSections[index] = {
            ...newSections[index],
            imageUrl,
          };

          console.log(`   New imageUrl set: ${newSections[index].imageUrl ? 'SUCCESS' : 'FAILED'}`);
          console.log(`   New imageUrl length: ${newSections[index].imageUrl?.length || 0}`);

          return newSections;
        });

        // Give React time to process the state update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Force a complete re-render by creating entirely new section objects
      setSections(prevSections => prevSections.map(s => ({ ...s })));

      setBulkStatus({
        type: 'success',
        message: `Successfully generated ${sectionsNeedingImages.length} image${sectionsNeedingImages.length > 1 ? 's' : ''}!`
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => setBulkStatus(null), 5000);
    } catch (error) {
      console.error('Bulk generation error:', error);
      setBulkStatus({
        type: 'error',
        message: `Failed to generate images. Generated ${bulkProgress.current} of ${bulkProgress.total}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsBulkGenerating(false);
      setBulkProgress({ current: 0, total: 0 });
    }
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
      await savePresentation(
        sections,
        undefined, // title (use default)
        knowledgeBase,
        {
          selectedTone,
          selectedModel,
          currentSectionIndex,
          viewMode
        }
      );
      console.log('✅ Presentation saved with complete state');
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

      // Restore knowledge base if present
      if (data.knowledgeBase) {
        setKnowledgeBase(data.knowledgeBase);
      }

      // Restore settings if present
      if (data.settings) {
        if (data.settings.selectedTone) setSelectedTone(data.settings.selectedTone);
        if (data.settings.selectedModel) setSelectedModel(data.settings.selectedModel);
        if (data.settings.currentSectionIndex !== undefined) {
          setCurrentSectionIndex(data.settings.currentSectionIndex);
        }
        if (data.settings.viewMode) setViewMode(data.settings.viewMode as ViewMode);
      } else {
        // If no settings, use defaults
        setCurrentSectionIndex(0);
        setViewMode('editor');
      }

      console.log(`✅ Loaded presentation with ${data.sections.length} sections and complete state`);

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
        onManualQuestion={() => setQaDialogOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sectionsCount={sections.length}
        onSavePresentation={handleSavePresentation}
        onLoadPresentation={handleLoadPresentation}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
      />

      {/* Floating status indicator */}
      <StatusIndicator isStreaming={isStreaming} />

      <div className="container mx-auto p-4 space-y-4 pb-20 sm:pb-4">

        {/* Create Presentation View - Choice between From Scratch or Process Content */}
        {viewMode === 'create' && !isStreaming && (
          <CreatePresentation
            onSelectFromScratch={() => setViewMode('create-from-scratch')}
            onSelectProcessContent={() => setViewMode('ai-processor')}
          />
        )}

        {/* Create from Scratch View */}
        {viewMode === 'create-from-scratch' && !isStreaming && (
          <CreateFromScratch
            onSectionsGenerated={handleSectionsGenerated}
            selectedModel={selectedModel}
          />
        )}

        {/* AI Script Processor View */}
        {viewMode === 'ai-processor' && !isStreaming && (
          <AIScriptProcessor
            onSectionsGenerated={handleSectionsGenerated}
            selectedModel={selectedModel}
          />
        )}

        {/* Section Editor View */}
        {viewMode === 'editor' && !isStreaming && sections.length > 0 && (
          <div className="space-y-4">
            {/* Tab Navigation */}
            <Card>
              <CardContent className="p-0">
                <div className="flex border-b">
                  <button
                    onClick={() => setEditorTab('sections')}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      editorTab === 'sections'
                        ? 'border-b-2 border-primary text-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    📝 Edit Content & Triggers
                  </button>
                  <button
                    onClick={() => setEditorTab('knowledge')}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      editorTab === 'knowledge'
                        ? 'border-b-2 border-primary text-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    💡 Knowledge Base
                    {knowledgeBase.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                        {knowledgeBase.length}
                      </span>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Sections Tab Content */}
            {editorTab === 'sections' && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold">Edit Your Sections</h2>
                          <p className="text-sm text-muted-foreground">
                            Click words to select trigger points, or use AI to suggest better options
                          </p>
                        </div>
                        <button
                          onClick={handleBulkGenerateImages}
                          disabled={isBulkGenerating || sections.length === 0}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBulkGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Generating {bulkProgress.current}/{bulkProgress.total}...
                            </>
                          ) : (
                            <>
                              <ImagePlus className="w-4 h-4" />
                              Generate All Images with AI
                            </>
                          )}
                        </button>
                      </div>

                      {/* Status Message */}
                      {bulkStatus && (
                        <div
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            bulkStatus.type === 'success'
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : bulkStatus.type === 'error'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {bulkStatus.message}
                        </div>
                      )}
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
                    allSections={sections}
                  />
                ))}
              </div>
            )}

            {/* Knowledge Base Tab Content */}
            {editorTab === 'knowledge' && (
              <KnowledgeBaseEditor
                knowledgeBase={knowledgeBase}
                sections={sections}
                onUpdate={setKnowledgeBase}
                onGenerateFAQs={handleGenerateFAQs}
                isGenerating={isGeneratingFAQs}
              />
            )}
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
            <div>Q&A Mode: {isListeningForQuestions ? 'ON' : 'OFF'}</div>
          </div>
        )}
      </div>

      {/* Q&A Panel Modal */}
      {currentQuestion && (
        <QAPanel
          question={currentQuestion}
          answers={questionAnswers}
          isLoading={isLoadingQA}
          onDismiss={handleDismissQuestion}
        />
      )}

      {/* Manual Q&A Dialog */}
      {qaDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Ask a Question
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Question:</label>
                <input
                  type="text"
                  value={manualQuestion}
                  onChange={(e) => setManualQuestion(e.target.value)}
                  placeholder="e.g., What is the pricing for this product?"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualQuestion.trim()) {
                      handleManualQuestion();
                    }
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Response Tone:</label>
                <ToneSelector
                  selectedTone={selectedTone}
                  onToneChange={setSelectedTone}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setQaDialogOpen(false);
                    setManualQuestion('');
                  }}
                  className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualQuestion}
                  disabled={!manualQuestion.trim() || isLoadingQA}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingQA ? 'Generating...' : 'Get AI Answers'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

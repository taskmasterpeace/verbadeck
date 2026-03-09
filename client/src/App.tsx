import { useState, useEffect, useRef } from 'react';
import { useAudioStreaming } from './hooks/useAudioStreaming';
import { useOpenRouter } from './hooks/useOpenRouter';
import { useFileOperations } from './hooks/useFileOperations';
import { useBulkImageGeneration } from './hooks/useBulkImageGeneration';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardShortcuts, type KeyboardShortcut } from './hooks/useKeyboardShortcuts';
import { usePresentation } from './hooks/usePresentation';
import { useQASession } from './hooks/useQASession';
import { useLibraryOperations } from './hooks/useLibraryOperations';
import { useVoiceNavigation } from './hooks/useVoiceNavigation';
import { useRouteSync } from './hooks/useRouteSync';
import { useModelManagement } from './hooks/useModelManagement';
import { useBroadcastChannel } from './hooks/useBroadcastChannel';
import { useKnowledgeBase } from './hooks/useKnowledgeBase';
import { usePresentationStyle } from './hooks/usePresentationStyle';
import { useModalState } from './hooks/useModalState';
import { usePresentationStore } from './stores';
import { type Section } from './lib/script-parser';
import { VoiceController } from './lib/voice-controller';
import { TranscriptTicker } from './components/TranscriptTicker';
import { AIScriptProcessor } from './components/AIScriptProcessor';
import { StatusIndicator } from './components/StatusIndicator';
import { TriggerCarousel } from './components/TriggerCarousel';
import { QAPanel } from './components/QAPanel';
import { LibraryBrowser } from './components/LibraryBrowser';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { MessageCircle, RotateCcw, X } from 'lucide-react';
import { CreateFromScratch } from './components/CreateFromScratch';
import { ToneSelector } from './components/ToneSelector';
import { CreatePresentation } from './components/CreatePresentation';
import { useImageGeneration } from './hooks/useImageGeneration';
import { Footer } from './components/Footer';
import { PresentationStyleManager, type PresentationStyle } from './components/PresentationStyleManager';
import { KnowItAllMode } from './components/KnowItAllMode';
import { MainLayout } from './layouts/MainLayout';
import { TopBar } from './components/layout/TopBar';
import { TranscriptBar } from './components/layout/TranscriptBar';
import { EditorPage } from './pages/EditorPage';
import { PresenterPage } from './pages/PresenterPage';

function getRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  if (isNaN(diff)) return 'recently';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export default function App() {
  // Zustand store - ALL state now managed centrally
  const editorTab = usePresentationStore(state => state.editorTab);
  const setEditorTab = usePresentationStore(state => state.setEditorTab);
  const selectedTone = usePresentationStore(state => state.selectedTone);
  const setSelectedTone = usePresentationStore(state => state.setSelectedTone);
  const cancelWord = usePresentationStore(state => state.cancelWord);
  const setCancelWord = usePresentationStore(state => state.setCancelWord);

  // Route management
  const { viewMode, setViewMode: setViewModeWithRoute } = useRouteSync();

  // Model management
  const { selectedModel, setSelectedModel, getOperationModel } = useModelManagement();

  // Modal state
  const {
    showLibraryBrowser,
    setShowLibraryBrowser,
    showKeyboardHelp,
    setShowKeyboardHelp,
    shortcutFeedback,
    setShortcutFeedback,
  } = useModalState();

  // API hooks
  const { generateTitles } = useOpenRouter();
  const { generateImage, suggestPrompt } = useImageGeneration();

  // Initialize voice controller (needed for presentation hook)
  const voiceControllerRef = useRef(new VoiceController());
  const voiceController = voiceControllerRef.current;

  // Initialize presentation management hook
  const presentation = usePresentation({ voiceController });
  const {
    sections,
    setSections,
    currentSectionIndex,
    setCurrentSectionIndex,
    draggedIndex,
    dragOverIndex,
    shouldFlash,
    progress,
    currentSection,
    previousSection,
    nextSection,
    advanceSection,
    goBackSection,
    goToSection,
    updateSection: handleUpdateSection,
    deleteSection: handleDeleteSection,
    addSection: handleAddSection,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    reorderSections: handleReorderSections,
  } = presentation;

  // Knowledge base management
  const {
    knowledgeBase,
    setKnowledgeBase,
    sharedKnowledgeBase,
    setSharedKnowledgeBase,
    isGeneratingFAQs,
    handleGenerateFAQs,
  } = useKnowledgeBase({
    sections,
    getOperationModel,
    onTabChange: (tab) => setEditorTab(tab),
  });

  // Initialize Q&A session hook
  const qaSession = useQASession({
    sections,
    currentSectionIndex,
    knowledgeBase,
    sharedKnowledgeBase,
    selectedTone,
    getOperationModel,
    mode: viewMode === 'know-it-all' ? 'know-it-all' : 'presenter'
  });
  const {
    isListeningForQuestions,
    setIsListeningForQuestions,
    currentQuestion,
    questionAnswers,
    isLoadingQA,
    qaDialogOpen,
    setQaDialogOpen,
    manualQuestion,
    setManualQuestion,
    handleQuestionDetected,
    handleCancelQuestion,
    handleDismissQuestion,
    handleManualQuestion,
  } = qaSession;

  // Auto-save hook - always enabled for now (streaming check removed due to hook ordering)
  const { status: autoSaveStatus, loadAutoSave, clearAutoSave } = useAutoSave({
    sections,
    knowledgeBase,
    settings: {
      selectedTone,
      selectedModel,
      currentSectionIndex,
      viewMode,
    },
    enabled: true, // Always enabled (TODO: Disable during streaming once hook order resolved)
  });

  // Auto-recovery state
  const [recoveryData, setRecoveryData] = useState<{
    sectionCount: number;
    savedAt: string;
  } | null>(null);

  // Check for auto-save data on mount (Dashboard recovery)
  useEffect(() => {
    if (viewMode !== 'create') return;
    const saved = loadAutoSave();
    if (saved && saved.sections && saved.sections.length > 0) {
      setRecoveryData({
        sectionCount: saved.sections.length,
        savedAt: saved.modified || saved.created || new Date().toISOString(),
      });
    }
  }, [viewMode]);

  const handleResumeRecovery = () => {
    const saved = loadAutoSave();
    if (!saved) return;
    setSections(saved.sections);
    if (saved.knowledgeBase) setKnowledgeBase(saved.knowledgeBase);
    setCurrentSectionIndex(0);
    setRecoveryData(null);
    clearAutoSave();
    setViewModeWithRoute('editor');
  };

  const handleDismissRecovery = () => {
    setRecoveryData(null);
    clearAutoSave();
  };

  // File operations - now uses Zustand store directly
  const { handleSavePresentation, handleLoadPresentation } = useFileOperations();

  // Initialize library operations hook
  const libraryOps = useLibraryOperations({
    sections,
    knowledgeBase,
    selectedTone,
    selectedModel,
    currentSectionIndex,
    viewMode,
    setSections,
    setKnowledgeBase,
    setSelectedTone,
    setSelectedModel,
    setCurrentSectionIndex,
    setViewMode: setViewModeWithRoute,
    clearAutoSave,
  });
  const {
    handleSaveToLibrary,
    handleLoadFromLibrary: handleLoadFromLibraryId,
  } = libraryOps;

  // Initialize voice navigation hook
  const voiceNav = useVoiceNavigation({
    sections,
    currentSectionIndex,
    advanceSection,
    goBackSection,
    isListeningForQuestions,
    handleQuestionDetected,
    isLoadingQA,
    handleCancelQuestion,
    cancelWord,
  });
  const {
    transcript,
    setTranscript,
    lastTranscript,
    setLastTranscript,
    handleTranscript,
  } = voiceNav;

  // Audio streaming hook (comes after voiceNav so handleTranscript is available)
  const { isStreaming, status, startStreaming, stopStreaming } = useAudioStreaming({
    onTranscript: handleTranscript,
    onError: (error) => {
      console.error('Streaming error:', error);
      alert(`Error: ${error}`);
    },
  });

  // Presentation style and bulk image generation
  const {
    presentationStyle,
    handleStyleSelect,
    handleApplyStyleToAll,
    bulkStatus,
    setBulkStatus,
  } = usePresentationStyle({
    sections,
    setSections,
    selectedModel,
    generateImage,
    suggestPrompt,
  });

  // Bulk image generation (legacy hook, wraps presentation style logic)
  const { isBulkGenerating, bulkProgress, handleBulkGenerateImages } = useBulkImageGeneration({
    sections,
    setSections,
    selectedModel,
    presentationStyle,
    generateImage,
    suggestPrompt,
  });

  // Auto-fix old sections that don't have selectedTriggers populated
  useEffect(() => {
    setSections(prevSections =>
      prevSections.map(section => {
        // If selectedTriggers is missing, populate it with ONLY the primary trigger
        if (!section.selectedTriggers || section.selectedTriggers.length === 0) {
          const fixed = {
            ...section,
            selectedTriggers: [section.advanceToken] // ONLY primary trigger active by default
          };
          console.log(`🔧 Auto-fixed section "${section.id}" - set primary trigger only: ${section.advanceToken}`);
          return fixed;
        }
        return section;
      })
    );
  }, []); // Run once on mount

  // Warn user before leaving if they have unsaved work
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sections.length > 0) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return ''; // Some browsers use return value
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sections.length]);

  // Keyboard shortcuts configuration
  const keyboardShortcuts: KeyboardShortcut[] = [
    // File operations
    {
      key: 's',
      ctrl: true,
      description: 'Save presentation',
      category: 'File',
      action: () => {
        if (sections.length > 0) {
          handleSavePresentation();
        }
      },
      enabled: sections.length > 0,
    },
    {
      key: 'o',
      ctrl: true,
      description: 'Open/Load presentation',
      category: 'File',
      action: () => {
        const input = document.getElementById('load-presentation-statusbar') as HTMLInputElement;
        input?.click();
      },
    },
    {
      key: 'n',
      ctrl: true,
      description: 'New presentation',
      category: 'File',
      action: () => {
        if (confirm('Create a new presentation? Unsaved changes will be lost.')) {
          setSections([]);
          setCurrentSectionIndex(0);
          setViewModeWithRoute('create');
        }
      },
    },
    {
      key: 'l',
      ctrl: true,
      description: 'Open library',
      category: 'File',
      action: () => {
        setShowLibraryBrowser(true);
      },
    },

    // Navigation
    {
      key: 'e',
      ctrl: true,
      description: 'Focus editor',
      category: 'Navigation',
      action: () => {
        if (sections.length > 0) {
          setViewModeWithRoute('editor');
          setEditorTab('sections');
        }
      },
      enabled: sections.length > 0,
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Start presenter mode',
      category: 'Navigation',
      action: () => {
        if (sections.length > 0) {
          handleStartPresenting();
        }
      },
      enabled: sections.length > 0,
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Open Know It All',
      category: 'Navigation',
      action: () => {
        setViewModeWithRoute('know-it-all');
      },
    },
    {
      key: 'h',
      ctrl: true,
      description: 'Go to home/create',
      category: 'Navigation',
      action: () => {
        setViewModeWithRoute('create');
      },
    },

    // Editor operations
    {
      key: 't',
      ctrl: true,
      description: 'Test triggers',
      category: 'Editor',
      action: () => {
        if (sections.length > 0 && viewMode === 'editor') {
          setEditorTab('testing');
        }
      },
      enabled: sections.length > 0 && viewMode === 'editor',
    },
    {
      key: 'q',
      ctrl: true,
      description: 'Knowledge base',
      category: 'Editor',
      action: () => {
        if (sections.length > 0 && viewMode === 'editor') {
          setEditorTab('knowledge');
        }
      },
      enabled: sections.length > 0 && viewMode === 'editor',
    },

    // Voice control
    {
      key: ' ',
      ctrl: true,
      description: 'Toggle voice control',
      category: 'Voice',
      action: () => {
        if (isStreaming) {
          stopStreaming();
        } else {
          startStreaming();
        }
      },
    },
    {
      key: 'm',
      ctrl: true,
      description: 'Toggle Q&A mode',
      category: 'Voice',
      action: () => {
        if (viewMode === 'presenter') {
          setIsListeningForQuestions(!isListeningForQuestions);
        }
      },
      enabled: viewMode === 'presenter',
    },

    // Help
    {
      key: '/',
      ctrl: true,
      description: 'Show keyboard shortcuts',
      category: 'Help',
      action: () => {
        setShowKeyboardHelp(!showKeyboardHelp);
      },
    },
  ];

  // Show shortcut feedback briefly
  useEffect(() => {
    if (shortcutFeedback) {
      const timer = setTimeout(() => setShortcutFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [shortcutFeedback]);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: keyboardShortcuts,
    enabled: true,
    preventInInputs: true,
    showFeedback: (message) => setShortcutFeedback(message),
  });


  // Handle AI-generated sections
  const handleSectionsGenerated = async (newSections: Section[]) => {
    console.log('📋 handleSectionsGenerated - Received sections:', newSections.length);

    // Fix sections to only have primary trigger selected by default
    let fixedSections = newSections.map(sec => {
      const fixed = {
        ...sec,
        selectedTriggers: [sec.advanceToken] // ONLY primary trigger active
      };
      console.log(`  Section ${sec.id}: Primary="${sec.advanceToken}", Alternatives=${sec.alternativeTriggers?.join(', ')}`);
      return fixed;
    });

    // Auto-generate titles for sections that don't have them
    try {
      console.log('📋 Generating titles for sections...');
      const titles = await generateTitles(fixedSections, selectedModel);
      console.log('✅ Generated titles:', titles);

      // Apply titles to sections that don't already have one
      fixedSections = fixedSections.map((sec, i) => ({
        ...sec,
        heading: sec.heading || titles[i] // Only set if not already present
      }));
    } catch (error) {
      console.error('❌ Failed to generate titles:', error);
      // Continue without titles on error - not critical
    }

    // Update Zustand store (single source of truth)
    console.log('🔄 Syncing new presentation to Zustand store and localStorage');
    setSections(fixedSections);
    setCurrentSectionIndex(0);

    setViewModeWithRoute('editor'); // Show editor to allow customization
  };


  // Start presenting
  const handleStartPresenting = () => {
    if (sections.length === 0) {
      alert('Please create sections first');
      return;
    }
    setViewModeWithRoute('presenter');
    setCurrentSectionIndex(0);
  };

  // Broadcast channel for audience view sync
  const { openAudienceView } = useBroadcastChannel(currentSectionIndex, sections);



  // Determine if we should use MainLayout (not for presenter in fullscreen mode)
  const useMainLayout = viewMode !== 'presenter' || !isStreaming;

  // TopBar configuration
  const topBarElement = (
    <TopBar
      isStreaming={isStreaming}
      streamStatus={status}
      onToggleStream={isStreaming ? stopStreaming : startStreaming}
      isListeningForQuestions={isListeningForQuestions}
      onToggleQuestions={() => setIsListeningForQuestions(!isListeningForQuestions)}
      onManualQuestion={() => setQaDialogOpen(true)}
      showQAControls={viewMode === 'presenter' || viewMode === 'know-it-all'}
      onSavePresentation={handleSavePresentation}
      onLoadPresentation={handleLoadPresentation}
      showFileControls={viewMode === 'editor' || viewMode === 'create'}
      selectedModel={selectedModel}
      onModelChange={setSelectedModel}
      cancelWord={cancelWord}
      onCancelWordChange={setCancelWord}
    />
  );

  // TranscriptBar configuration
  const transcriptBarElement = (
    <TranscriptBar
      transcript={transcript}
      lastTranscript={lastTranscript}
      isVisible={isStreaming && viewMode !== 'know-it-all'}
    />
  );

  // Floating status indicator
  const statusIndicator = <StatusIndicator isStreaming={isStreaming} />;

  // Main content area
  const mainContent = (
    <>
      {statusIndicator}

      <div className={
        viewMode === 'presenter' || (isStreaming && sections.length > 0) ? 'h-screen overflow-hidden' :
        viewMode === 'know-it-all' ? 'p-4 space-y-4 pb-20 sm:pb-4' :
        'container mx-auto p-4 space-y-4 pb-20 sm:pb-4'
      }>

        {/* Create Presentation View - Choice between From Scratch, Process Content, or Know It All */}
        {viewMode === 'create' && !isStreaming && (
          <>
            {recoveryData && (
              <div
                data-testid="auto-recovery-banner"
                className="container mx-auto max-w-7xl px-8 pt-8 pb-0"
              >
                <div className="flex items-center justify-between gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Resume your last presentation?
                      </p>
                      <p className="text-xs text-blue-700">
                        {recoveryData.sectionCount} slide{recoveryData.sectionCount !== 1 ? 's' : ''} • saved {getRelativeTime(recoveryData.savedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      data-testid="resume-recovery"
                      onClick={handleResumeRecovery}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Resume
                    </button>
                    <button
                      data-testid="dismiss-recovery"
                      onClick={handleDismissRecovery}
                      className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                      aria-label="Dismiss recovery"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            <CreatePresentation
              onSelectFromScratch={() => setViewModeWithRoute('create-from-scratch')}
              onSelectProcessContent={() => setViewModeWithRoute('ai-processor')}
              onSelectKnowItAll={() => setViewModeWithRoute('know-it-all')}
            />
          </>
        )}

        {/* Create from Scratch View */}
        {viewMode === 'create-from-scratch' && !isStreaming && (
          <CreateFromScratch
            onSectionsGenerated={handleSectionsGenerated}
            selectedModel={selectedModel}
          />
        )}

        {/* Know It All Wall - Standalone Q&A Mode */}
        {viewMode === 'know-it-all' && (
          <KnowItAllMode
            startStreaming={startStreaming}
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
          <EditorPage
              sections={sections}
              editorTab={editorTab}
              setEditorTab={setEditorTab}
              knowledgeBase={knowledgeBase}
              setKnowledgeBase={setKnowledgeBase}
              isGeneratingFAQs={isGeneratingFAQs}
              handleGenerateFAQs={handleGenerateFAQs}
              handleUpdateSection={handleUpdateSection}
              handleDeleteSection={handleDeleteSection}
              handleReorderSections={handleReorderSections}
              handleAddSection={handleAddSection}
              selectedModel={selectedModel}
              presentationStyle={presentationStyle}
              isStreaming={isStreaming}
              stopStreaming={stopStreaming}
              startStreaming={startStreaming}
              status={status}
              lastTranscript={lastTranscript}
              setSharedKnowledgeBase={setSharedKnowledgeBase}
              setViewMode={setViewModeWithRoute}
            />
        )}

        {/* Presenter View */}
        {(viewMode === 'presenter' || isStreaming) && sections.length > 0 && (
          <PresenterPage
            sections={sections}
            currentSectionIndex={currentSectionIndex}
            currentSection={currentSection}
            previousSection={previousSection}
            nextSection={nextSection}
            shouldFlash={shouldFlash}
            openAudienceView={openAudienceView}
            goToSection={goToSection}
            advanceSection={advanceSection}
            goBackSection={goBackSection}
            stopStreaming={stopStreaming}
            isStreaming={isStreaming}
            viewMode={viewMode}
          />
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
        {/* Hide in Know It All mode since questions are displayed in the wall */}
        {isStreaming && viewMode !== 'know-it-all' && (
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

      {/* Q&A Side Panel */}
      {currentQuestion && (
        <QAPanel
          question={currentQuestion}
          answers={questionAnswers}
          isLoading={isLoadingQA}
          onDismiss={handleDismissQuestion}
          onCancel={handleCancelQuestion}
          cancelWord={cancelWord}
          selectedModel={getOperationModel('answerQuestion')}
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

      {/* Library Browser Modal */}
      <LibraryBrowser
        isOpen={showLibraryBrowser}
        onClose={() => setShowLibraryBrowser(false)}
        onLoad={handleLoadFromLibraryId}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        shortcuts={keyboardShortcuts}
      />

      {/* Shortcut Feedback Toast */}
      {shortcutFeedback && (
        <div className="fixed top-20 right-4 z-[250] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl border border-gray-700 flex items-center gap-2">
            <span className="text-sm font-medium">{shortcutFeedback}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </>
  );

  // Render with or without MainLayout
  if (useMainLayout) {
    return (
      <MainLayout topBar={topBarElement} transcriptBar={transcriptBarElement}>
        {mainContent}
      </MainLayout>
    );
  }

  // Full-screen presenter mode without MainLayout
  return (
    <div className="min-h-screen bg-background text-foreground">
      {statusIndicator}
      {mainContent}
    </div>
  );
}

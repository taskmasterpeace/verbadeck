/**
 * Know It All Mode - Standalone Q&A mode for rapid-fire question answering
 * Use cases: job interviews, product Q&A sessions, rapid information retrieval
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, Square, Download, Trash2, MessageCircleQuestion, CheckCircle2, Clock } from 'lucide-react';
import { KnowItAllWall } from './KnowItAllWall';
import { QuestionCard } from '../lib/know-it-all-types';
import { AlertDialog } from './ui/alert-dialog';
import { ConfirmDialog } from './ui/confirm-dialog';
import { PromptDialog } from './ui/prompt-dialog';
import { KnowledgeBaseInput } from './know-it-all/KnowledgeBaseInput';
import { PresetSelector } from './know-it-all/PresetSelector';
import { SetupWizardContainer } from './know-it-all/SetupWizardContainer';
import { ToneSelector } from './ToneSelector';
import { useKnowItAllSetup } from '@/hooks/useKnowItAllSetup';
import { useVoiceStore } from '@/stores/voice';
import { usePresentationStore } from '@/stores/usePresentationStore';

interface KnowledgeBasePreset {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface KnowItAllModeProps {
  /** Function to start voice streaming */
  startStreaming: () => void;

  /** Test mode bypasses voice streaming requirement (for automated testing) */
  testMode?: boolean;
}

export function KnowItAllMode({
  startStreaming,
  testMode = false,
}: KnowItAllModeProps) {
  // Get data from stores
  const transcript = useVoiceStore((state) => state.lastTranscript);
  const isStreaming = useVoiceStore((state) => state.isStreaming);
  const selectedModel = usePresentationStore((state) => state.selectedModel);
  const getOperationModel = usePresentationStore((state) => state.getOperationModel);
  const sharedKnowledgeBase = usePresentationStore((state) => state.sharedKnowledgeBase);
  const setSharedKnowledgeBase = usePresentationStore((state) => state.setSharedKnowledgeBase);

  // Check for test mode from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const isTestMode = testMode ||
    urlParams.get('testMode') === 'true' ||
    localStorage.getItem('verbadeck-test-mode') === 'true';

  // Knowledge base content
  const [knowledgeBase, setKnowledgeBase] = useState<string>(() => {
    // Prioritize shared knowledge base from presentation mode
    return sharedKnowledgeBase || localStorage.getItem('verbadeck-kia-knowledge-base') || '';
  });

  // Sync with shared knowledge base when it changes
  useEffect(() => {
    if (sharedKnowledgeBase !== undefined) {
      setKnowledgeBase(sharedKnowledgeBase);
    }
  }, [sharedKnowledgeBase]);

  // Preset management
  const [presets, setPresets] = useState<KnowledgeBasePreset[]>(() => {
    const saved = localStorage.getItem('verbadeck-kia-presets');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [loadedPresets, setLoadedPresets] = useState<{ id: string; name: string; icon: string }[]>([]);

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [questions, setQuestions] = useState<QuestionCard[]>([]);

  // Tone selection for AI responses
  const [selectedTone, setSelectedTone] = useState<string>('professional');

  // Dialog state
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }>({ isOpen: false, title: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; type?: 'info' | 'danger'; onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [promptDialog, setPromptDialog] = useState<{ isOpen: boolean; title: string; message: string; placeholder?: string; onSubmit: (value: string) => void }>({ isOpen: false, title: '', message: '', onSubmit: () => {} });


  // Setup wizard hook
  const {
    setupPhase,
    startSetup: _startSetup,
  } = useKnowItAllSetup({
    knowledgeBase,
    getOperationModel,
    onSessionReady: () => setIsSessionActive(true),
  });


  // Helper function to update knowledge base and sync with store
  const updateKnowledgeBase = (content: string) => {
    setKnowledgeBase(content);
    setSharedKnowledgeBase(content);
  };

  // Save knowledge base to localStorage
  useEffect(() => {
    localStorage.setItem('verbadeck-kia-knowledge-base', knowledgeBase);
  }, [knowledgeBase]);

  // Save presets to localStorage
  useEffect(() => {
    localStorage.setItem('verbadeck-kia-presets', JSON.stringify(presets));
  }, [presets]);

  // Load sample data presets on first mount
  useEffect(() => {
    const loadSamplePresets = async () => {
      // Only load if no presets exist
      if (presets.length > 0) return;

      const samplePresets: KnowledgeBasePreset[] = [];

      try {
        const resumeResponse = await fetch('/sample-data/resume-robert-smith.txt');
        if (resumeResponse.ok) {
          const resumeContent = await resumeResponse.text();
          samplePresets.push({
            id: 'sample-resume',
            name: '📄 Resume - Robert Smith (AI Architect)',
            content: resumeContent,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to load resume sample:', error);
      }

      try {
        const caoResponse = await fetch('/sample-data/job-description-chief-ai-officer.txt');
        if (caoResponse.ok) {
          const caoContent = await caoResponse.text();
          samplePresets.push({
            id: 'sample-job-cao',
            name: '💼 Job: Chief AI Officer (Fortune 500)',
            content: caoContent,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to load CAO job description:', error);
      }

      try {
        const productResponse = await fetch('/sample-data/job-description-ai-product-lead.txt');
        if (productResponse.ok) {
          const productContent = await productResponse.text();
          samplePresets.push({
            id: 'sample-job-product',
            name: '🚀 Job: AI Product Lead (Series B Startup)',
            content: productContent,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to load Product Lead job description:', error);
      }

      try {
        const freddieMacResponse = await fetch('/sample-data/job-description-principal-genai-scientist-freddie-mac.txt');
        if (freddieMacResponse.ok) {
          const freddieMacContent = await freddieMacResponse.text();
          samplePresets.push({
            id: 'sample-job-freddie-mac',
            name: '🎯 Job: Principal GenAI Scientist (Freddie Mac)',
            content: freddieMacContent,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to load Freddie Mac job description:', error);
      }

      if (samplePresets.length > 0) {
        setPresets(samplePresets);
      }
    };

    loadSamplePresets();
  }, []); // Only run once on mount

  // Handle starting a session with AI context analysis
  const handleStartSession = async () => {
    if (!knowledgeBase.trim()) {
      setAlertDialog({
        isOpen: true,
        title: 'Knowledge Base Required',
        message: 'Please provide knowledge base content before starting a session.',
        type: 'warning',
      });
      return;
    }

    // Auto-start voice streaming if not already active (and not in test mode)
    if (!isStreaming && !isTestMode) {
      console.log('🎤 Auto-starting voice streaming...');
      startStreaming();
    }

    setQuestions([]); // Clear previous session questions

    // Skip the setup wizard and go straight to the session
    // Users want to start asking questions immediately
    setIsSessionActive(true);
  };

  // Handle stopping a session
  const handleStopSession = () => {
    setIsSessionActive(false);
  };

  // Handle clearing all questions
  const handleClearQuestions = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Questions',
      message: 'Clear all questions from this session? This cannot be undone.',
      type: 'danger',
      onConfirm: () => setQuestions([]),
    });
  };

  // Handle exporting answered questions
  const handleExport = (format: 'json' | 'markdown') => {
    const answeredQuestions = questions.filter(q => q.status === 'answered');

    if (answeredQuestions.length === 0) {
      setAlertDialog({
        isOpen: true,
        title: 'No Answered Questions',
        message: 'No answered questions to export. Answer some questions by saying their keywords first.',
        type: 'info',
      });
      return;
    }

    if (format === 'json') {
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        answeredQuestions: answeredQuestions.map(q => ({
          question: q.question,
          timestamp: q.timestamp,
          selectedAnswer: q.selectedAnswer,
          answer: q.selectedAnswer === 1 ? {
            heading: q.answers.answer1.heading,
            brief: q.answers.answer1.brief,
            bullets: q.answers.answer1.bullets,
            full: q.answers.answer1.full,
          } : {
            heading: q.answers.answer2.heading,
            brief: q.answers.answer2.brief,
            bullets: q.answers.answer2.bullets,
            full: q.answers.answer2.full,
          },
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `know-it-all-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Markdown format
      let markdown = `# Know It All Session - ${new Date().toLocaleDateString()}\n\n`;
      markdown += `Total Questions: ${questions.length} | Answered: ${answeredQuestions.length}\n\n`;
      markdown += `---\n\n`;

      answeredQuestions.forEach((q, index) => {
        const answer = q.selectedAnswer === 1 ? q.answers.answer1 : q.answers.answer2;
        markdown += `## ${index + 1}. ${q.question}\n\n`;
        markdown += `**${answer.heading}**\n\n`;
        markdown += `${answer.brief}\n\n`;
        answer.bullets.forEach(bullet => {
          markdown += `- ${bullet}\n`;
        });
        markdown += `\n${answer.full}\n\n`;
        markdown += `---\n\n`;
      });

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `know-it-all-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Handle loading knowledge base from file
  const handleLoadKnowledgeBase = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          updateKnowledgeBase(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Handle clearing knowledge base
  const handleClearKnowledgeBase = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Knowledge Base',
      message: 'Clear knowledge base? This will remove all loaded content.',
      type: 'danger',
      onConfirm: () => {
        updateKnowledgeBase('');
        setLoadedPresets([]);
        setSelectedPresetId(null);
      },
    });
  };

  // Handle loading a preset
  const handleLoadPreset = (presetId: string, mode: 'replace' | 'append' = 'replace') => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      // Extract icon emoji from name (first emoji character)
      const iconMatch = preset.name.match(/[\p{Emoji}]/u);
      const icon = iconMatch ? iconMatch[0] : '📄';
      const displayName = preset.name.replace(/[\p{Emoji}]/gu, '').trim();

      if (mode === 'append' && knowledgeBase.trim()) {
        // Combine: append with separator
        updateKnowledgeBase(knowledgeBase + '\n\n---\n\n' + preset.content);
        // Add to loaded presets if not already there
        if (!loadedPresets.some(p => p.id === presetId)) {
          setLoadedPresets([...loadedPresets, { id: presetId, name: displayName, icon }]);
        }
      } else {
        // Replace
        updateKnowledgeBase(preset.content);
        setLoadedPresets([{ id: presetId, name: displayName, icon }]);
      }
      setSelectedPresetId(presetId);
    }
  };

  // Handle saving current KB as a new preset
  const handleSaveAsPreset = () => {
    if (!knowledgeBase.trim()) {
      setAlertDialog({
        isOpen: true,
        title: 'Empty Knowledge Base',
        message: 'Cannot save an empty knowledge base.',
        type: 'error',
      });
      return;
    }

    setPromptDialog({
      isOpen: true,
      title: 'Save as Preset',
      message: 'Enter a name for this knowledge base preset:',
      placeholder: 'e.g., My Resume + Job Description',
      onSubmit: (name) => {
        const newPreset: KnowledgeBasePreset = {
          id: `custom-${Date.now()}`,
          name: name.trim(),
          content: knowledgeBase,
          createdAt: new Date().toISOString(),
        };

        setPresets([...presets, newPreset]);
        setSelectedPresetId(newPreset.id);
        setAlertDialog({
          isOpen: true,
          title: 'Preset Saved',
          message: `Preset "${name}" saved successfully!`,
          type: 'success',
        });
      },
    });
  };

  // Handle deleting a preset
  const handleDeletePreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Preset',
      message: `Delete preset "${preset.name}"? This cannot be undone.`,
      type: 'danger',
      onConfirm: () => {
        setPresets(presets.filter(p => p.id !== presetId));
        if (selectedPresetId === presetId) {
          setSelectedPresetId(null);
        }
        setAlertDialog({
          isOpen: true,
          title: 'Preset Deleted',
          message: `Preset "${preset.name}" deleted.`,
          type: 'info',
        });
      },
    });
  };

  const showWarning = (title: string, message: string) => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      type: 'warning',
    });
  };

  return (
    <div className="space-y-2">
      {/* Compact Header when session active, full Card when inactive */}
      {isSessionActive ? (
        <div className="bg-white border rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <h3 className="font-semibold flex items-center gap-2 flex-shrink-0">
              <span className="text-xl">💬</span>
              Know It All Wall
            </h3>
            <div className="flex items-center gap-3 text-sm flex-shrink-0">
              <div className="flex items-center gap-1 text-gray-600" title="Total questions">
                <MessageCircleQuestion className="w-4 h-4" />
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex items-center gap-1 text-green-600" title="Answered">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">{questions.filter(q => q.status === 'answered').length}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-600" title="Pending">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{questions.filter(q => q.status === 'ready').length}</span>
              </div>
            </div>
            {/* Live Transcript - Compact */}
            {isStreaming && transcript && (
              <div className="flex items-center gap-1.5 ml-3 flex-1 min-w-0 border-l pl-3">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="text-xs text-gray-500 truncate">
                  {transcript}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStopSession}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
            <button
              onClick={handleClearQuestions}
              disabled={questions.length === 0}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={questions.filter(q => q.status === 'answered').length === 0}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => handleExport('markdown')}
              disabled={questions.filter(q => q.status === 'answered').length === 0}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              MD
            </button>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              Know It All Wall
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                Rapid-fire Q&A mode
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Setup Flow - Show when analyzing or answering questions */}
            {setupPhase !== 'idle' ? (
              <SetupWizardContainer
                knowledgeBase={knowledgeBase}
                getOperationModel={getOperationModel}
                onSessionReady={() => setIsSessionActive(true)}
                onWarning={showWarning}
              />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Upload your knowledge base (resume, product info, company docs) and let AI answer questions in real-time.
                  Perfect for interviews, product demos, or Q&A sessions.
                </p>

                {/* Preset Management */}
                {!isSessionActive && (
                  <PresetSelector
                    presets={presets}
                    selectedPresetId={selectedPresetId}
                    onSelectPreset={setSelectedPresetId}
                    onLoadPreset={handleLoadPreset}
                    onDeletePreset={handleDeletePreset}
                    hasContent={knowledgeBase.trim().length > 0}
                  />
                )}

                {/* Knowledge Base Input */}
                {!isSessionActive && (
                  <KnowledgeBaseInput
                    value={knowledgeBase}
                    onChange={updateKnowledgeBase}
                    loadedPresets={loadedPresets}
                    onLoadFile={handleLoadKnowledgeBase}
                    onClear={handleClearKnowledgeBase}
                    onSaveAsPreset={handleSaveAsPreset}
                  />
                )}

                {/* Tone Selector - Compact pills */}
                {!isSessionActive && (
                  <ToneSelector
                    selectedTone={selectedTone}
                    onToneChange={setSelectedTone}
                    compact
                  />
                )}

                {/* Start Session */}
                <div className="space-y-3">
                  {isTestMode && (
                    <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded" data-testid="test-mode-indicator">
                      🧪 Test Mode Active - Voice streaming requirement bypassed
                    </p>
                  )}

                  <button
                    onClick={handleStartSession}
                    disabled={!knowledgeBase.trim()}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    data-testid="start-session-button"
                  >
                    <Play className="w-5 h-5" />
                    Start Session
                  </button>
                  <p className="text-xs text-center text-muted-foreground">Voice listening starts automatically</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}


      {/* Question Wall */}
      {isSessionActive && (
        <KnowItAllWall
          questions={questions}
          onQuestionsChange={setQuestions}
          transcript={transcript}
          knowledgeBase={knowledgeBase}
          selectedModel={selectedModel}
          selectedTone={selectedTone}
        />
      )}

      {/* Dialog Components */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
      <PromptDialog
        isOpen={promptDialog.isOpen}
        onClose={() => setPromptDialog({ ...promptDialog, isOpen: false })}
        onSubmit={promptDialog.onSubmit}
        title={promptDialog.title}
        message={promptDialog.message}
        placeholder={promptDialog.placeholder}
      />
    </div>
  );
}

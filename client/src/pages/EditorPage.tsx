import { type Section } from '../lib/script-parser';
import { type PresentationStyle } from '../components/PresentationStyleManager';
import { type ViewMode } from '../hooks/useRouteSync';
import { Card, CardContent } from '../components/ui/card';
import { EditorWorkspace } from '../components/editor/EditorWorkspace';
import { KnowledgeBaseEditor } from '../components/KnowledgeBaseEditor';
import { TriggerTestingMode } from '../components/TriggerTestingMode';

interface KnowledgeItem {
  question: string;
  answer: string;
}

interface EditorPageProps {
  sections: Section[];
  editorTab: 'sections' | 'knowledge' | 'testing';
  setEditorTab: (tab: 'sections' | 'knowledge' | 'testing') => void;
  knowledgeBase: KnowledgeItem[];
  setKnowledgeBase: (kb: KnowledgeItem[]) => void;
  isGeneratingFAQs: boolean;
  handleGenerateFAQs: () => Promise<void>;
  handleUpdateSection: (index: number, updatedSection: Section) => void;
  handleDeleteSection: (index: number) => void;
  handleReorderSections: (startIndex: number, endIndex: number) => void;
  handleAddSection: () => void;
  selectedModel: string;
  presentationStyle: PresentationStyle | null;
  isStreaming: boolean;
  stopStreaming: () => void;
  startStreaming: () => void;
  status: 'connecting' | 'connected' | 'disconnected';
  lastTranscript: string;
  setSharedKnowledgeBase: (content: string) => void;
  setViewMode: (mode: ViewMode) => void;
}

export function EditorPage({
  sections,
  editorTab,
  setEditorTab,
  knowledgeBase,
  setKnowledgeBase,
  isGeneratingFAQs,
  handleGenerateFAQs,
  handleUpdateSection,
  handleDeleteSection,
  handleReorderSections,
  handleAddSection,
  selectedModel,
  presentationStyle,
  isStreaming,
  stopStreaming,
  startStreaming,
  status,
  lastTranscript,
  setSharedKnowledgeBase,
  setViewMode,
}: EditorPageProps) {
  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center border-b">
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
            <button
              onClick={() => setEditorTab('testing')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                editorTab === 'testing'
                  ? 'border-b-2 border-primary text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              🎤 Test Triggers
            </button>
            <button
              onClick={() => {
                // Copy presentation content to shared knowledge base
                const presentationContent = sections.map(s => s.content).join('\n\n');
                setSharedKnowledgeBase(presentationContent);
                // Navigate to Know It All Wall
                setViewMode('know-it-all');
              }}
              className="mx-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 whitespace-nowrap text-sm font-semibold"
            >
              🧠 Practice Q&A
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Sections Tab Content - New 3-Panel Workspace */}
      {editorTab === 'sections' && (
        <EditorWorkspace
          sections={sections}
          onUpdateSection={handleUpdateSection}
          onDeleteSection={handleDeleteSection}
          onReorderSections={handleReorderSections}
          onAddSection={handleAddSection}
          selectedModel={selectedModel}
          presentationStyle={presentationStyle}
        />
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

      {/* Trigger Testing Tab Content */}
      {editorTab === 'testing' && (
        <TriggerTestingMode
          triggers={sections.flatMap(s => s.selectedTriggers || [s.advanceToken])}
          isStreaming={isStreaming}
          onToggleStream={isStreaming ? stopStreaming : startStreaming}
          transcript={lastTranscript}
          streamStatus={status}
        />
      )}
    </div>
  );
}

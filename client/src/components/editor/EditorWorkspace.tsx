import { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { SectionsList } from './SectionsList';
import { SectionEditor } from './SectionEditor';
import { PropertiesPanel } from './PropertiesPanel';
import type { Section } from '@/lib/script-parser';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EditorWorkspaceProps {
  sections: Section[];
  onUpdateSection: (index: number, section: Section) => void;
  onDeleteSection: (index: number) => void;
  onReorderSections?: (startIndex: number, endIndex: number) => void;
  onAddSection?: () => void;
  selectedModel: string;
  presentationStyle: any;
}

export function EditorWorkspace({
  sections,
  onUpdateSection,
  onDeleteSection,
  onReorderSections,
  onAddSection,
  selectedModel,
  presentationStyle,
}: EditorWorkspaceProps) {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load saved panel sizes from localStorage
  const [savedSizes, setSavedSizes] = useState<number[]>(() => {
    const saved = localStorage.getItem('editor-panel-sizes');
    return saved ? JSON.parse(saved) : [20, 55, 25];
  });

  // Save panel sizes to localStorage
  const handleLayoutChange = (sizes: number[]) => {
    setSavedSizes(sizes);
    localStorage.setItem('editor-panel-sizes', JSON.stringify(sizes));
  };

  const activeSection = sections[activeSectionIndex];

  // Handle section reorder
  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (onReorderSections) {
      onReorderSections(fromIndex, toIndex);
      // Update active section index if it was moved
      if (fromIndex === activeSectionIndex) {
        setActiveSectionIndex(toIndex);
      } else if (fromIndex < activeSectionIndex && toIndex >= activeSectionIndex) {
        setActiveSectionIndex(activeSectionIndex - 1);
      } else if (fromIndex > activeSectionIndex && toIndex <= activeSectionIndex) {
        setActiveSectionIndex(activeSectionIndex + 1);
      }
    }
  };

  // Mobile stacked layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-full space-y-4 p-4">
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Sections</h3>
          <SectionsList
            sections={sections}
            activeSectionIndex={activeSectionIndex}
            onSectionClick={setActiveSectionIndex}
            onReorder={handleReorder}
            onAddSection={onAddSection}
          />
        </div>

        <div className="bg-background border rounded-lg p-4 flex-1">
          <h3 className="text-sm font-semibold mb-3">Editor</h3>
          {activeSection && (
            <SectionEditor
              section={activeSection}
              sectionIndex={activeSectionIndex}
              totalSections={sections.length}
              onUpdate={(section) => onUpdateSection(activeSectionIndex, section)}
              onDelete={() => onDeleteSection(activeSectionIndex)}
              selectedModel={selectedModel}
              allSections={sections}
              presentationStyle={presentationStyle}
            />
          )}
        </div>

        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Properties</h3>
          {activeSection && (
            <PropertiesPanel
              section={activeSection}
              onUpdate={(section) => onUpdateSection(activeSectionIndex, section)}
              selectedModel={selectedModel}
              allSections={sections}
              presentationStyle={presentationStyle}
            />
          )}
        </div>
      </div>
    );
  }

  // Desktop resizable panel layout
  return (
    <div className="h-full w-full bg-muted/30">
      <PanelGroup
        direction="horizontal"
        onLayout={handleLayoutChange}
        className="h-full"
      >
        {/* Left Panel - Sections List */}
        {!leftCollapsed && (
          <>
            <Panel
              defaultSize={savedSizes[0]}
              minSize={15}
              maxSize={35}
              className="bg-background"
            >
              <div className="h-full flex flex-col border-r">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Sections</h3>
                    <button
                      onClick={() => setLeftCollapsed(true)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="Collapse panel"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <SectionsList
                    sections={sections}
                    activeSectionIndex={activeSectionIndex}
                    onSectionClick={setActiveSectionIndex}
                    onReorder={handleReorder}
                    onAddSection={onAddSection}
                  />
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
          </>
        )}

        {/* Collapsed Left Panel Button */}
        {leftCollapsed && (
          <div className="w-8 border-r bg-background flex items-center justify-center">
            <button
              onClick={() => setLeftCollapsed(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Expand sections panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Center Panel - Section Editor */}
        <Panel
          defaultSize={leftCollapsed ? savedSizes[1] + savedSizes[0] : savedSizes[1]}
          minSize={30}
          className="bg-background"
        >
          <div className="h-full overflow-y-auto">
            {activeSection ? (
              <SectionEditor
                section={activeSection}
                sectionIndex={activeSectionIndex}
                totalSections={sections.length}
                onUpdate={(section) => onUpdateSection(activeSectionIndex, section)}
                onDelete={() => onDeleteSection(activeSectionIndex)}
                selectedModel={selectedModel}
                allSections={sections}
                presentationStyle={presentationStyle}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No sections available. Add a section to get started.</p>
              </div>
            )}
          </div>
        </Panel>

        {/* Right Panel - Properties */}
        {!rightCollapsed && (
          <>
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
            <Panel
              defaultSize={savedSizes[2]}
              minSize={20}
              maxSize={40}
              className="bg-background"
            >
              <div className="h-full flex flex-col border-l">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Properties</h3>
                    <button
                      onClick={() => setRightCollapsed(true)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="Collapse panel"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {activeSection && (
                    <PropertiesPanel
                      section={activeSection}
                      onUpdate={(section) => onUpdateSection(activeSectionIndex, section)}
                      selectedModel={selectedModel}
                      allSections={sections}
                      presentationStyle={presentationStyle}
                    />
                  )}
                </div>
              </div>
            </Panel>
          </>
        )}

        {/* Collapsed Right Panel Button */}
        {rightCollapsed && (
          <div className="w-8 border-l bg-background flex items-center justify-center">
            <button
              onClick={() => setRightCollapsed(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Expand properties panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </PanelGroup>
    </div>
  );
}

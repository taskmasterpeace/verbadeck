import { useRef } from 'react';
import { MarkdownToolbar } from '@/components/MarkdownToolbar';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { SpeakerNoteToolbar } from '@/components/SpeakerNoteToolbar';

interface SpeakerNotesEditorProps {
  speakerNotes: string;
  tab: 'edit' | 'preview';
  slideContent?: string; // NEW: needed for AI transformations
  selectedTone?: string; // NEW: needed for tone-aware expansions
  onNotesChange: (value: string) => void;
  onTabChange: (tab: 'edit' | 'preview') => void;
}

export function SpeakerNotesEditor({
  speakerNotes,
  tab,
  slideContent = '',
  selectedTone = 'professional',
  onNotesChange,
  onTabChange,
}: SpeakerNotesEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  const handleTextareaResize = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Insert markdown formatting at cursor position
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = speakerNotes.substring(start, end);
    const beforeText = speakerNotes.substring(0, start);
    const afterText = speakerNotes.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    onNotesChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Speaker Notes (optional - what you'll say):
        </label>
        {/* Edit/Preview Tabs */}
        <div className="flex gap-1 bg-muted/30 rounded-md p-1">
          <button
            type="button"
            onClick={() => onTabChange('edit')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              tab === 'edit'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onTabChange('preview')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              tab === 'preview'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* AI Speaker Note Transformations Toolbar (NEW!) */}
      {slideContent && (
        <SpeakerNoteToolbar
          currentNotes={speakerNotes}
          slideContent={slideContent}
          selectedTone={selectedTone}
          onNotesUpdate={onNotesChange}
        />
      )}

      <div className="border border-dashed rounded-md overflow-hidden bg-amber-50/30">
        {tab === 'edit' ? (
          <>
            <MarkdownToolbar onInsert={insertMarkdown} />
            <textarea
              ref={textareaRef}
              value={speakerNotes}
              onChange={(e) => {
                onNotesChange(e.target.value);
                handleTextareaResize(e.target);
              }}
              onFocus={(e) => handleTextareaResize(e.target)}
              placeholder="Leave empty to use slide content... Add your own script here if you want to say something different from what's on the slide."
              className="w-full min-h-24 p-3 bg-transparent text-sm resize-none focus:outline-none border-none"
              style={{ height: 'auto' }}
            />
          </>
        ) : (
          <div className="p-4 min-h-24 bg-amber-50/50">
            <p className="text-xs font-semibold text-amber-900 mb-3">📝 Preview (how notes will look):</p>
            <div className="prose prose-sm max-w-none text-amber-900">
              {speakerNotes ? (
                <MarkdownRenderer content={speakerNotes} />
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  No speaker notes - will use slide content for voice navigation
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground italic">
        💡 Tip: Voice navigation will use your speaker notes (if provided) instead of slide content
      </p>
    </div>
  );
}

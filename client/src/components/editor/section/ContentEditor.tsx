import { useRef } from 'react';
import { MarkdownToolbar } from '@/components/MarkdownToolbar';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface ContentEditorProps {
  heading: string;
  content: string;
  tab: 'edit' | 'preview';
  onHeadingChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTabChange: (tab: 'edit' | 'preview') => void;
}

export function ContentEditor({
  heading,
  content,
  tab,
  onHeadingChange,
  onContentChange,
  onTabChange,
}: ContentEditorProps) {
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
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    onContentChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Slide Title/Heading (optional):
        </label>
        <input
          type="text"
          value={heading}
          onChange={(e) => onHeadingChange(e.target.value)}
          placeholder="e.g., Introduction, Key Benefits, Next Steps..."
          className="w-full p-3 rounded-md border bg-background text-base font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground italic">
          💡 This heading will appear prominently at the top of your slide
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            Slide Content (what audience sees):
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

        <div className="border rounded-md overflow-hidden">
          {tab === 'edit' ? (
            <>
              <MarkdownToolbar onInsert={insertMarkdown} />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  onContentChange(e.target.value);
                  handleTextareaResize(e.target);
                }}
                onFocus={(e) => handleTextareaResize(e.target)}
                placeholder="Type your content... Use the toolbar above to add formatting"
                className="w-full min-h-32 p-3 bg-background text-sm resize-none focus:outline-none border-none"
                style={{ height: 'auto' }}
              />
            </>
          ) : (
            <div className="p-4 min-h-32 bg-blue-50/30">
              <p className="text-xs font-semibold text-blue-900 mb-3">📺 Preview (how it will look):</p>
              <div className="prose prose-sm max-w-none">
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-muted-foreground italic text-sm">No content yet...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

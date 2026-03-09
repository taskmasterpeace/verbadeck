import { useState, useRef, useEffect } from 'react';
import { Eye } from 'lucide-react';
import type { Section } from '@/lib/script-parser';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { MarkdownToolbar } from '../MarkdownToolbar';
import { SlidePreview } from '../SlidePreview';

interface SectionEditorProps {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  onUpdate: (section: Section) => void;
  onDelete: () => void;
  selectedModel: string;
  allSections?: Section[];
  presentationStyle?: any;
}

export function SectionEditor({
  section,
  sectionIndex,
  totalSections,
  onUpdate,
  selectedModel,
  allSections,
  presentationStyle,
}: SectionEditorProps) {
  const [heading, setHeading] = useState(section.heading || '');
  const [content, setContent] = useState(section.content);
  const [speakerNotes, setSpeakerNotes] = useState(section.speakerNotes || '');
  const [showPreview, setShowPreview] = useState(false);

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Tab state for Edit/Preview toggle - default to Edit for main workspace
  const [contentTab, setContentTab] = useState<'edit' | 'preview'>('edit');
  const [notesTab, setNotesTab] = useState<'edit' | 'preview'>('edit');

  // Clean HTML formatting tags from content
  const cleanHtmlTags = (text: string): string => {
    return text
      .replace(/<div style="text-align:\s*(left|center|right)">\s*/gi, '')
      .replace(/<\/div>\s*/gi, '')
      .replace(/<\/?span[^>]*>/gi, '')
      .replace(/<\/?p[^>]*>/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Sync state with section prop changes
  useEffect(() => {
    setHeading(section.heading || '');
    setContent(cleanHtmlTags(section.content));
    setSpeakerNotes(section.speakerNotes ? cleanHtmlTags(section.speakerNotes) : '');
  }, [section.id]); // Only sync when section changes, not on every render

  // Auto-save on changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only save if there are actual changes
      if (
        heading !== (section.heading || '') ||
        content !== section.content ||
        speakerNotes !== (section.speakerNotes || '')
      ) {
        onUpdate({
          ...section,
          heading: heading.trim() || undefined,
          content,
          speakerNotes: speakerNotes.trim() || undefined,
        });
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [heading, content, speakerNotes]);

  // Auto-resize textarea to fit content
  const handleTextareaResize = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Insert markdown formatting at cursor position
  const insertMarkdown = (
    textareaRef: React.RefObject<HTMLTextAreaElement>,
    before: string,
    after: string = '',
    setValue: (value: string) => void,
    currentValue: string
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentValue.substring(start, end);
    const beforeText = currentValue.substring(0, start);
    const afterText = currentValue.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    setValue(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleContentInsert = (before: string, after: string = '') => {
    insertMarkdown(contentTextareaRef, before, after, setContent, content);
  };

  const handleNotesInsert = (before: string, after: string = '') => {
    insertMarkdown(notesTextareaRef, before, after, setSpeakerNotes, speakerNotes);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-base font-bold">
            {sectionIndex + 1}
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              Section {sectionIndex + 1} of {totalSections}
            </h2>
            <p className="text-xs text-muted-foreground">
              Changes auto-save as you type
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPreview(true)}
          className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm font-medium"
          title="Preview how this slide will look to the audience"
        >
          <Eye className="w-4 h-4" />
          Preview Slide
        </button>
      </div>

      {/* Slide Title/Heading */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Slide Title/Heading
        </label>
        <input
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="e.g., Introduction, Key Benefits, Next Steps..."
          className="w-full p-3 rounded-lg border-2 bg-background text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">
          Optional - appears prominently at the top of your slide
        </p>
      </div>

      {/* Slide Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Slide Content
          </label>
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setContentTab('edit')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                contentTab === 'edit'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setContentTab('preview')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                contentTab === 'preview'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="border-2 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
          {contentTab === 'edit' ? (
            <>
              <MarkdownToolbar onInsert={handleContentInsert} />
              <textarea
                ref={contentTextareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleTextareaResize(e.target);
                }}
                onFocus={(e) => handleTextareaResize(e.target)}
                placeholder="Type your content... Use the toolbar above to add formatting"
                className="w-full min-h-[200px] p-4 bg-background text-sm resize-none focus:outline-none border-none"
                style={{ height: 'auto' }}
              />
            </>
          ) : (
            <div className="p-6 min-h-[200px] bg-blue-50/30">
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
        <p className="text-xs text-muted-foreground">
          What the audience will see on the slide
        </p>
      </div>

      {/* Speaker Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Speaker Notes
          </label>
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setNotesTab('edit')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                notesTab === 'edit'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setNotesTab('preview')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                notesTab === 'preview'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="border-2 border-dashed rounded-lg overflow-hidden bg-amber-50/20 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent">
          {notesTab === 'edit' ? (
            <>
              <MarkdownToolbar onInsert={handleNotesInsert} />
              <textarea
                ref={notesTextareaRef}
                value={speakerNotes}
                onChange={(e) => {
                  setSpeakerNotes(e.target.value);
                  handleTextareaResize(e.target);
                }}
                onFocus={(e) => handleTextareaResize(e.target)}
                placeholder="Leave empty to use slide content... Add your own script here if you want to say something different from what's on the slide."
                className="w-full min-h-[150px] p-4 bg-transparent text-sm resize-none focus:outline-none border-none"
                style={{ height: 'auto' }}
              />
            </>
          ) : (
            <div className="p-6 min-h-[150px]">
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
        <p className="text-xs text-muted-foreground">
          Optional - what you'll say (used for voice navigation if provided)
        </p>
      </div>

      {/* Slide Preview Modal */}
      {showPreview && (
        <SlidePreview
          section={{
            ...section,
            heading,
            content,
            speakerNotes: speakerNotes.trim() || undefined,
          }}
          sectionIndex={sectionIndex}
          totalSections={totalSections}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Link, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (before: string, after?: string) => void;
}

export function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
  const buttons = [
    { icon: Bold, label: 'Bold', before: '**', after: '**', tooltip: 'Bold (Ctrl+B)' },
    { icon: Italic, label: 'Italic', before: '*', after: '*', tooltip: 'Italic (Ctrl+I)' },
    { icon: Heading1, label: 'H1', before: '# ', after: '', tooltip: 'Heading 1' },
    { icon: Heading2, label: 'H2', before: '## ', after: '', tooltip: 'Heading 2' },
    { icon: List, label: 'Bullet', before: '- ', after: '', tooltip: 'Bullet List' },
    { icon: ListOrdered, label: 'Number', before: '1. ', after: '', tooltip: 'Numbered List' },
    { icon: Link, label: 'Link', before: '[', after: '](url)', tooltip: 'Insert Link' },
  ];

  const alignButtons = [
    { icon: AlignLeft, label: 'Left', before: '[left]', after: '[/left]', tooltip: 'Align Left' },
    { icon: AlignCenter, label: 'Center', before: '[center]', after: '[/center]', tooltip: 'Align Center' },
    { icon: AlignRight, label: 'Right', before: '[right]', after: '[/right]', tooltip: 'Align Right' },
  ];

  return (
    <div className="flex items-center gap-1 p-2 bg-muted/30 rounded-t-md border border-b-0">
      <span className="text-xs text-muted-foreground mr-2">Format:</span>
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={() => onInsert(btn.before, btn.after)}
          className="p-1.5 hover:bg-background rounded transition-colors flex items-center justify-center"
          title={btn.tooltip}
          aria-label={btn.label}
        >
          <btn.icon className="w-4 h-4 text-foreground" />
        </button>
      ))}

      {/* Divider */}
      <div className="h-6 w-px bg-border mx-1" />

      {/* Alignment buttons */}
      <span className="text-xs text-muted-foreground mr-2">Align:</span>
      {alignButtons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={() => onInsert(btn.before, btn.after)}
          className="p-1.5 hover:bg-background rounded transition-colors flex items-center justify-center"
          title={btn.tooltip}
          aria-label={btn.label}
        >
          <btn.icon className="w-4 h-4 text-foreground" />
        </button>
      ))}

      <div className="ml-auto text-xs text-muted-foreground">
        Use Preview tab to see result
      </div>
    </div>
  );
}

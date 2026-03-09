import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  highlightTrigger?: { word: string; index: number };
  className?: string;
  style?: React.CSSProperties;
}

export function MarkdownRenderer({ content, highlightTrigger: _highlightTrigger, className = '', style }: MarkdownRendererProps) {
  // Process alignment tags before rendering
  const processedContent = content
    .replace(/\[left\]([\s\S]*?)\[\/left\]/g, '<div style="text-align: left">$1</div>')
    .replace(/\[center\]([\s\S]*?)\[\/center\]/g, '<div style="text-align: center">$1</div>')
    .replace(/\[right\]([\s\S]*?)\[\/right\]/g, '<div style="text-align: right">$1</div>');

  return (
    <div className={className} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 last:mb-0 whitespace-pre-wrap leading-relaxed">
              {children}
            </p>
          ),

          // Unordered lists
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 mb-4 text-left">
              {children}
            </ul>
          ),

          // Ordered lists
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 mb-4 text-left">
              {children}
            </ol>
          ),

          // List items
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),

          // Bold text
          strong: ({ children }) => (
            <strong className="font-bold text-primary">
              {children}
            </strong>
          ),

          // Italic text
          em: ({ children }) => (
            <em className="italic">
              {children}
            </em>
          ),

          // Headings
          h1: ({ children }) => (
            <h1 className="text-5xl font-bold mb-4">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="text-4xl font-semibold mb-3">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="text-3xl font-semibold mb-2">
              {children}
            </h3>
          ),

          // Code blocks
          code: ({ node, className, children, ...props }: any) => {
            const inline = !(props as any).inline === false;
            return inline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props}>
                {children}
              </code>
            );
          },

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4">
              {children}
            </blockquote>
          ),

          // Horizontal rules
          hr: () => (
            <hr className="my-8 border-t-2 border-muted" />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

// Helper function to detect if content has markdown formatting
export function hasMarkdown(content: string): boolean {
  const markdownPatterns = [
    /\*\*.*?\*\*/,  // Bold
    /\*.*?\*/,      // Italic
    /_.*?_/,        // Italic/Bold
    /^#+\s/m,       // Headers
    /^[-*+]\s/m,    // Unordered lists
    /^\d+\.\s/m,    // Ordered lists
    /```/,          // Code blocks
    /`.*?`/,        // Inline code
  ];

  return markdownPatterns.some(pattern => pattern.test(content));
}

// Helper function to render text with trigger word highlighting
// This is a specialized version that works with markdown
export function renderWithTriggerHighlight(
  content: string,
  trigger: { word: string; index: number }
) {
  const before = content.substring(0, trigger.index);
  const word = content.substring(trigger.index, trigger.index + trigger.word.length);
  const after = content.substring(trigger.index + trigger.word.length);

  return (
    <span>
      {before}
      <strong className="font-bold text-primary underline decoration-2 underline-offset-4">
        {word}
      </strong>
      {after}
    </span>
  );
}

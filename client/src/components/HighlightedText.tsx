/**
 * HighlightedText - Renders text with inline keyword highlighting
 * Keywords are highlighted based on their detection status
 */

import { parseTextWithKeywords, isKeywordDetected } from '../lib/text-highlighter';
import { cn } from '../lib/utils';

interface HighlightedTextProps {
  /** Text content to render with highlighting */
  text: string;

  /** Keywords to highlight in the text */
  keywords: string[];

  /** Keywords that have been detected via voice */
  detectedKeywords: string[];

  /** Additional CSS classes for the container */
  className?: string;

  /** Component to use for the text container */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'li';
}

export function HighlightedText({
  text,
  keywords,
  detectedKeywords,
  className,
  as: Component = 'span',
}: HighlightedTextProps) {
  const segments = parseTextWithKeywords(text, keywords);

  return (
    <Component className={className}>
      {segments.map((segment, index) => {
        if (!segment.isKeyword) {
          return <span key={index}>{segment.text}</span>;
        }

        // Check if this keyword has been detected
        const isDetected = segment.keyword
          ? isKeywordDetected(segment.keyword, detectedKeywords)
          : false;

        return (
          <span
            key={index}
            className={cn(
              'inline-block px-1 rounded transition-all duration-300',
              isDetected
                ? 'bg-green-100 text-green-800 ring-2 ring-green-500 font-semibold'
                : 'bg-blue-50 text-blue-700 font-medium'
            )}
          >
            {segment.text}
          </span>
        );
      })}
    </Component>
  );
}

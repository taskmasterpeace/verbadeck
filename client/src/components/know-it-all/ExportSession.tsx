/**
 * ExportSession - Export Know It All Wall session data
 * Supports JSON and Markdown formats
 */

import { QuestionCard } from '../../lib/know-it-all-types';
import { Download, FileJson, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface ExportSessionProps {
  /** All questions in the current session */
  questions: QuestionCard[];

  /** Total elapsed session time in seconds */
  elapsedTime: number;
}

export function ExportSession({ questions, elapsedTime }: ExportSessionProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Format elapsed time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  // Export as JSON
  const exportJSON = () => {
    const answeredQuestions = questions.filter(q => q.status === 'answered');

    const exportData = {
      exportedAt: new Date().toISOString(),
      sessionDuration: formatTime(elapsedTime),
      statistics: {
        totalQuestions: questions.length,
        answeredQuestions: answeredQuestions.length,
        pendingQuestions: questions.filter(q => q.status !== 'answered' && q.status !== 'error').length,
        errorQuestions: questions.filter(q => q.status === 'error').length,
      },
      questions: questions.map(q => {
        const selectedAnswer = q.selectedAnswer === 1 ? q.answers.answer1 : q.answers.answer2;
        return {
          id: q.id,
          question: q.question,
          timestamp: q.timestamp.toISOString(),
          status: q.status,
          selectedAnswer: q.selectedAnswer,
          answer: q.status === 'answered' ? {
            heading: selectedAnswer?.heading,
            brief: selectedAnswer?.brief,
            bullets: selectedAnswer?.bullets,
            full: selectedAnswer?.full,
            keywords: selectedAnswer?.keywords,
          } : null,
          triggerWord: q.triggerWord,
          lockWord: q.lockWord,
        };
      }),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `know-it-all-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  // Export as Markdown
  const exportMarkdown = () => {
    const answeredQuestions = questions.filter(q => q.status === 'answered');
    const pendingQuestions = questions.filter(q => q.status !== 'answered' && q.status !== 'error');
    const errorQuestions = questions.filter(q => q.status === 'error');

    let markdown = `# Know It All Wall - Session Export\n\n`;
    markdown += `**Exported:** ${new Date().toLocaleString()}\n\n`;
    markdown += `**Session Duration:** ${formatTime(elapsedTime)}\n\n`;
    markdown += `---\n\n`;
    markdown += `## Session Statistics\n\n`;
    markdown += `- **Total Questions:** ${questions.length}\n`;
    markdown += `- **Answered:** ${answeredQuestions.length}\n`;
    markdown += `- **Pending:** ${pendingQuestions.length}\n`;
    if (errorQuestions.length > 0) {
      markdown += `- **Errors:** ${errorQuestions.length}\n`;
    }
    markdown += `\n---\n\n`;

    // Answered questions
    if (answeredQuestions.length > 0) {
      markdown += `## Answered Questions\n\n`;
      answeredQuestions.forEach((q, idx) => {
        const selectedAnswer = q.selectedAnswer === 1 ? q.answers.answer1 : q.answers.answer2;
        markdown += `### ${idx + 1}. ${q.question}\n\n`;
        markdown += `**Time:** ${new Date(q.timestamp).toLocaleTimeString()}\n\n`;
        markdown += `**Answer:** ${selectedAnswer.heading}\n\n`;
        markdown += `${selectedAnswer.brief}\n\n`;

        if (selectedAnswer.bullets.length > 0) {
          markdown += `**Key Points:**\n\n`;
          selectedAnswer.bullets.forEach(bullet => {
            markdown += `- ${bullet}\n`;
          });
          markdown += `\n`;
        }

        if (selectedAnswer.full) {
          markdown += `**Full Response:**\n\n`;
          markdown += `${selectedAnswer.full}\n\n`;
        }

        markdown += `**Keywords Used:** ${selectedAnswer.keywords.join(', ')}\n\n`;
        markdown += `---\n\n`;
      });
    }

    // Pending questions
    if (pendingQuestions.length > 0) {
      markdown += `## Unanswered Questions\n\n`;
      pendingQuestions.forEach((q, idx) => {
        markdown += `${idx + 1}. ${q.question}\n`;
        markdown += `   - Trigger word: **${q.triggerWord}**\n`;
        markdown += `   - Status: ${q.status}\n\n`;
      });
      markdown += `\n`;
    }

    // Error questions
    if (errorQuestions.length > 0) {
      markdown += `## Failed Questions\n\n`;
      errorQuestions.forEach((q, idx) => {
        markdown += `${idx + 1}. ${q.question}\n`;
        markdown += `   - Error: ${q.errorMessage || 'Unknown error'}\n\n`;
      });
    }

    markdown += `---\n\n`;
    markdown += `*Generated by VerbaDeck Know It All Wall*\n`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `know-it-all-session-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  // Don't show export button if no questions
  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
      >
        <Download className="w-4 h-4" />
        Export Session
      </button>

      {/* Export menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <button
              onClick={exportJSON}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-200"
            >
              <FileJson className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">Export as JSON</div>
                <div className="text-xs text-gray-500">Machine-readable format</div>
              </div>
            </button>

            <button
              onClick={exportMarkdown}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">Export as Markdown</div>
                <div className="text-xs text-gray-500">Human-readable format</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

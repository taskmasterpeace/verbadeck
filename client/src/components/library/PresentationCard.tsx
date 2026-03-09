import { useState } from 'react';
import { Trash2, FolderOpen, Clock, Download, Edit2 } from 'lucide-react';
import type { LibraryEntry } from '@/lib/presentation-library';
import { exportPresentationJSON } from '@/lib/file-storage';

interface PresentationCardProps {
  entry: LibraryEntry;
  onLoad: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onRename?: (id: string, newName: string) => void;
}

export function PresentationCard({ entry, onLoad, onDelete, onRename }: PresentationCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(entry.name);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const json = exportPresentationJSON(
        entry.data.sections,
        entry.name,
        entry.data.knowledgeBase,
        entry.data.settings
      );

      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entry.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.verbadeck`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export presentation:', error);
      alert('Failed to export presentation');
    }
  };

  const handleRename = () => {
    if (onRename && newName.trim() && newName !== entry.name) {
      onRename(entry.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewName(entry.name);
      setIsRenaming(false);
    }
  };

  // Generate thumbnail preview from first section with image
  const thumbnailSection = entry.data.sections.find(s => s.imageUrl);
  const thumbnailUrl = thumbnailSection?.imageUrl;

  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${entry.name} thumbnail`}
            className="w-full h-full object-cover"
          />
        ) : (
          <FolderOpen className="w-12 h-12 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="font-semibold text-lg border border-blue-500 rounded px-2 py-1 w-full mb-1"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg truncate">{entry.name}</h3>
            {onRename && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                title="Rename presentation"
              >
                <Edit2 className="w-3 h-3 text-gray-600" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(entry.savedAt)}
          </span>
          <span>{entry.data.sections.length} slides</span>
          {entry.data.knowledgeBase && entry.data.knowledgeBase.length > 0 && (
            <span>{entry.data.knowledgeBase.length} FAQs</span>
          )}
          {entry.data.metadata?.model && (
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              {entry.data.metadata.model.split('/')[1] || entry.data.metadata.model}
            </span>
          )}
        </div>

        {/* First section preview */}
        {entry.data.sections[0] && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {entry.data.sections[0].content.substring(0, 150)}...
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-start gap-2">
        <button
          onClick={() => onLoad(entry.id)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
          title="Load presentation"
        >
          Load
        </button>
        <button
          onClick={handleExport}
          className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Export to file"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.id, entry.name);
          }}
          className="p-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          title="Delete presentation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

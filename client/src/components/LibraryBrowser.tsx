import { useState } from 'react';
import { getLibrary, deleteFromLibrary, type LibraryEntry } from '@/lib/presentation-library';
import { Trash2, FolderOpen, Clock, X } from 'lucide-react';

interface LibraryBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (id: string) => void;
}

export function LibraryBrowser({ isOpen, onClose, onLoad }: LibraryBrowserProps) {
  const [library, setLibrary] = useState<LibraryEntry[]>(getLibrary());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}" from library?`)) {
      deleteFromLibrary(id);
      setLibrary(getLibrary());
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleLoad = (id: string) => {
    onLoad(id);
    onClose();
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Refresh library when dialog opens
  if (isOpen && library.length !== getLibrary().length) {
    setLibrary(getLibrary());
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Presentation Library</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {library.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No presentations saved to library yet.</p>
              <p className="text-sm mt-2">Use "Save to Library" to quickly save presentations.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {library.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{entry.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(entry.savedAt)}
                      </span>
                      <span>{entry.data.sections.length} slides</span>
                      {entry.data.knowledgeBase && entry.data.knowledgeBase.length > 0 && (
                        <span>{entry.data.knowledgeBase.length} FAQs</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoad(entry.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id, entry.name)}
                      className="p-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

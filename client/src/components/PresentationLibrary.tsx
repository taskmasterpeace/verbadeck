import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getAllPresentations, deletePresentationFromStorage, type SavedPresentation } from '@/lib/presentation-storage';
import { Trash2, FileText, Calendar, Layers } from 'lucide-react';

interface PresentationLibraryProps {
  onLoad: (presentation: SavedPresentation) => void;
  onClose: () => void;
}

export function PresentationLibrary({ onLoad, onClose }: PresentationLibraryProps) {
  const [presentations, setPresentations] = useState<SavedPresentation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = () => {
    const all = getAllPresentations();
    // Sort by most recent first
    all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setPresentations(all);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete presentation "${name}"? This cannot be undone.`)) {
      deletePresentationFromStorage(id);
      loadPresentations();
    }
  };

  const filteredPresentations = presentations.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPreview = (presentation: SavedPresentation): string => {
    if (presentation.sections.length === 0) return 'No content';
    const firstSection = presentation.sections[0].content;
    // Strip HTML tags for preview
    const text = firstSection.replace(/<[^>]*>/g, '');
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Presentation Library
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search presentations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          {filteredPresentations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? (
                <p>No presentations found matching "{searchTerm}"</p>
              ) : (
                <>
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No saved presentations yet</p>
                  <p className="text-sm mt-2">Create a presentation and click "Save" to store it here</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPresentations.map((presentation) => (
                <div
                  key={presentation.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {presentation.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {getPreview(presentation)}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>{presentation.metadata.totalSections} sections</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Modified: {formatDate(presentation.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onLoad(presentation)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(presentation.id, presentation.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredPresentations.length} presentation{filteredPresentations.length !== 1 ? 's' : ''}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-100 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

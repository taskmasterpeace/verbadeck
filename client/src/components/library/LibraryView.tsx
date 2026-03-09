import { useState, useMemo } from 'react';
import { getLibrary, deleteFromLibrary, renameInLibrary, type LibraryEntry } from '@/lib/presentation-library';
import { PresentationCard } from './PresentationCard';
import { Search, SortAsc, SortDesc, Grid, List, Upload, Plus } from 'lucide-react';

interface LibraryViewProps {
  onLoad: (id: string) => void;
  onImportFile?: () => void;
  onNewPresentation?: () => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'slides-desc' | 'slides-asc';
type ViewLayout = 'grid' | 'list';

export function LibraryView({ onLoad, onImportFile, onNewPresentation }: LibraryViewProps) {
  const [library, setLibrary] = useState<LibraryEntry[]>(getLibrary());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('list');

  const refreshLibrary = () => {
    setLibrary(getLibrary());
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}" from library?\n\nThis action cannot be undone.`)) {
      deleteFromLibrary(id);
      refreshLibrary();
    }
  };

  const handleRename = (id: string, newName: string) => {
    renameInLibrary(id, newName);
    refreshLibrary();
  };

  // Filter and sort library
  const filteredAndSortedLibrary = useMemo(() => {
    let result = [...library];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(entry =>
        entry.name.toLowerCase().includes(query) ||
        entry.data.sections.some(s => s.content.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        case 'date-asc':
          return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'slides-desc':
          return b.data.sections.length - a.data.sections.length;
        case 'slides-asc':
          return a.data.sections.length - b.data.sections.length;
        default:
          return 0;
      }
    });

    return result;
  }, [library, searchQuery, sortOption]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date-desc', label: 'Newest first' },
    { value: 'date-asc', label: 'Oldest first' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'slides-desc', label: 'Most slides' },
    { value: 'slides-asc', label: 'Fewest slides' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Presentation Library</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {library.length} {library.length === 1 ? 'presentation' : 'presentations'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onNewPresentation && (
            <button
              onClick={onNewPresentation}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Presentation
            </button>
          )}
          {onImportFile && (
            <button
              onClick={onImportFile}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Import from File
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search presentations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Layout Toggle */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewLayout('list')}
            className={`p-2 ${viewLayout === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'} transition-colors`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewLayout('grid')}
            className={`p-2 ${viewLayout === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'} transition-colors`}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Library Content */}
      {filteredAndSortedLibrary.length === 0 ? (
        <div className="text-center py-16">
          {searchQuery.trim() ? (
            <div className="text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No presentations match your search.</p>
              <p className="text-sm mt-2">Try a different search term.</p>
            </div>
          ) : (
            <div className="text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p>No presentations saved to library yet.</p>
              <p className="text-sm mt-2">Create a new presentation or import an existing file to get started.</p>
            </div>
          )}
        </div>
      ) : (
        <div className={viewLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
          {filteredAndSortedLibrary.map((entry) => (
            <PresentationCard
              key={entry.id}
              entry={entry}
              onLoad={onLoad}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {filteredAndSortedLibrary.length > 0 && (
        <div className="text-sm text-gray-500 text-center pt-4 border-t">
          {searchQuery.trim() && (
            <p>
              Showing {filteredAndSortedLibrary.length} of {library.length} presentations
            </p>
          )}
          {!searchQuery.trim() && library.length > 0 && (
            <p>
              Total slides: {library.reduce((sum, entry) => sum + entry.data.sections.length, 0)} •
              Total FAQs: {library.reduce((sum, entry) => sum + (entry.data.knowledgeBase?.length || 0), 0)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

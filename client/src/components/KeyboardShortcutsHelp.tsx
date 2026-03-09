import { useState, useMemo } from 'react';
import { X, Search, Keyboard } from 'lucide-react';
import { KeyboardShortcut, formatShortcutKey, isMac } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

/**
 * Keyboard Shortcuts Help Modal
 *
 * Displays all available keyboard shortcuts in a searchable, categorized modal.
 * Features:
 * - Categorized shortcuts
 * - Search/filter functionality
 * - Visual keyboard style display (Ctrl+K)
 * - Cross-platform support (shows Cmd on Mac, Ctrl on Windows)
 * - Responsive design
 */
export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsHelpProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Group shortcuts by category
  const categorizedShortcuts = useMemo(() => {
    const filtered = shortcuts.filter(shortcut => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      const matchesDescription = shortcut.description.toLowerCase().includes(query);
      const matchesKey = shortcut.key.toLowerCase().includes(query);
      const matchesCategory = shortcut.category.toLowerCase().includes(query);

      return matchesDescription || matchesKey || matchesCategory;
    });

    // Group by category
    const grouped: Record<string, KeyboardShortcut[]> = {};
    filtered.forEach(shortcut => {
      if (!grouped[shortcut.category]) {
        grouped[shortcut.category] = [];
      }
      grouped[shortcut.category].push(shortcut);
    });

    return grouped;
  }, [shortcuts, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6" />
            <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close shortcuts help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
              {isMac() ? '⌘' : 'Ctrl'}+/
            </kbd> to toggle this help anytime
          </p>
        </div>

        {/* Shortcuts List */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
          {Object.keys(categorizedShortcuts).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Keyboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No shortcuts found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(categorizedShortcuts).map(([category, shortcuts]) => (
                <div key={category}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <div
                        key={`${category}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-700 font-medium">
                          {shortcut.description}
                        </span>
                        <KeyboardKey shortcut={shortcut} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {shortcuts.length} shortcuts available
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Visual keyboard key display component
 */
function KeyboardKey({ shortcut }: { shortcut: KeyboardShortcut }) {
  const keys = formatShortcutKey(shortcut).split('+');

  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <span key={index} className="flex items-center gap-1">
          <kbd className="px-2.5 py-1.5 bg-white border-2 border-gray-300 rounded-md shadow-sm text-xs font-mono font-bold text-gray-700 min-w-[2rem] text-center">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-gray-400 text-sm font-bold">+</span>
          )}
        </span>
      ))}
    </div>
  );
}

import type { PresentationData } from './file-storage';
import type { Section } from './script-parser';

const LIBRARY_KEY = 'verbadeck-presentation-library';

export interface LibraryEntry {
  id: string;
  name: string;
  data: PresentationData;
  savedAt: string;
}

/**
 * Get all saved presentations from library
 */
export function getLibrary(): LibraryEntry[] {
  try {
    const stored = localStorage.getItem(LIBRARY_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as LibraryEntry[];
  } catch (error) {
    console.error('Failed to load library:', error);
    return [];
  }
}

/**
 * Save presentation to library with a name
 */
export function saveToLibrary(
  name: string,
  sections: Section[],
  knowledgeBase?: { question: string; answer: string }[],
  settings?: {
    selectedTone?: string;
    selectedModel?: string;
    currentSectionIndex?: number;
    viewMode?: string;
    cancelWord?: string;
    presentationStyle?: any;
  }
): void {
  const library = getLibrary();

  const data: PresentationData = {
    version: '1.0',
    title: name,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    sections,
    knowledgeBase,
    settings,
    metadata: {
      totalSlides: sections.length,
      model: settings?.selectedModel,
    },
  };

  const entry: LibraryEntry = {
    id: `lib-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    data,
    savedAt: new Date().toISOString(),
  };

  // Check if name already exists, update it
  const existingIndex = library.findIndex(e => e.name === name);
  if (existingIndex >= 0) {
    library[existingIndex] = entry;
  } else {
    library.push(entry);
  }

  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
}

/**
 * Load presentation from library by ID
 */
export function loadFromLibrary(id: string): PresentationData | null {
  const library = getLibrary();
  const entry = library.find(e => e.id === id);
  return entry ? entry.data : null;
}

/**
 * Delete presentation from library
 */
export function deleteFromLibrary(id: string): void {
  const library = getLibrary();
  const filtered = library.filter(e => e.id !== id);
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(filtered));
}

/**
 * Rename presentation in library
 */
export function renameInLibrary(id: string, newName: string): void {
  const library = getLibrary();
  const entry = library.find(e => e.id === id);
  if (entry) {
    entry.name = newName;
    entry.data.title = newName;
    entry.data.modified = new Date().toISOString();
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  }
}

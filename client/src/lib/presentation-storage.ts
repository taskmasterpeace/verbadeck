import type { Section } from './script-parser';

export interface SavedPresentation {
  id: string;
  name: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
  metadata: {
    totalSections: number;
    estimatedDuration?: string;
  };
}

const STORAGE_KEY = 'verbadeck-presentations';

/**
 * Save a presentation to localStorage
 */
export function savePresentationToStorage(name: string, sections: Section[]): SavedPresentation {
  const presentations = getAllPresentations();

  const presentation: SavedPresentation = {
    id: `pres-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      totalSections: sections.length,
    },
  };

  presentations.push(presentation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));

  return presentation;
}

/**
 * Load a specific presentation from localStorage
 */
export function loadPresentationFromStorage(id: string): SavedPresentation | null {
  const presentations = getAllPresentations();
  return presentations.find(p => p.id === id) || null;
}

/**
 * Get all presentations from localStorage
 */
export function getAllPresentations(): SavedPresentation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading presentations:', error);
    return [];
  }
}

/**
 * Delete a presentation from localStorage
 */
export function deletePresentationFromStorage(id: string): void {
  const presentations = getAllPresentations();
  const filtered = presentations.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Update an existing presentation in localStorage
 */
export function updatePresentationInStorage(id: string, sections: Section[]): void {
  const presentations = getAllPresentations();
  const index = presentations.findIndex(p => p.id === id);

  if (index !== -1) {
    presentations[index].sections = sections;
    presentations[index].updatedAt = new Date().toISOString();
    presentations[index].metadata.totalSections = sections.length;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));
  }
}

/**
 * Check if a presentation name already exists
 */
export function presentationNameExists(name: string): boolean {
  const presentations = getAllPresentations();
  return presentations.some(p => p.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get presentation count
 */
export function getPresentationCount(): number {
  return getAllPresentations().length;
}

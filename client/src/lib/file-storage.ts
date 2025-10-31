import type { Section } from './script-parser';

export interface PresentationData {
  version: string;
  title: string;
  created: string;
  modified: string;
  sections: Section[];
  metadata?: {
    model?: string;
    totalSlides?: number;
  };
}

/**
 * Save presentation to a .verbadeck JSON file
 */
export async function savePresentation(sections: Section[], title?: string): Promise<void> {
  const data: PresentationData = {
    version: '1.0',
    title: title || `Presentation ${new Date().toLocaleDateString()}`,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    sections,
    metadata: {
      totalSlides: sections.length,
    },
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.verbadeck`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Load presentation from a .verbadeck or .json file
 */
export async function loadPresentation(file: File): Promise<PresentationData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json) as PresentationData;

        // Validate data structure
        if (!data.sections || !Array.isArray(data.sections)) {
          throw new Error('Invalid presentation file: missing sections');
        }

        // Validate each section has required fields
        for (const section of data.sections) {
          if (!section.id || !section.content || !section.advanceToken) {
            throw new Error('Invalid presentation file: malformed section');
          }
        }

        resolve(data);
      } catch (error) {
        reject(new Error(`Failed to load presentation: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Export presentation metadata as JSON string
 */
export function exportPresentationJSON(sections: Section[], title?: string): string {
  const data: PresentationData = {
    version: '1.0',
    title: title || `Presentation ${new Date().toLocaleDateString()}`,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    sections,
    metadata: {
      totalSlides: sections.length,
    },
  };

  return JSON.stringify(data, null, 2);
}

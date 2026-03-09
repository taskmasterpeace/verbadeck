import { CreateFromScratch } from '@/components/CreateFromScratch';
import type { Section } from '@/lib/script-parser';

interface CreateFromScratchPageProps {
  onSectionsGenerated: (sections: Section[]) => void;
  selectedModel: string;
  onNavigate: (path: string) => void;
}

export function CreateFromScratchPage({
  onSectionsGenerated,
  selectedModel,
  onNavigate,
}: CreateFromScratchPageProps) {
  const handleSectionsGenerated = (sections: Section[]) => {
    onSectionsGenerated(sections);
    // Navigate to editor after sections are generated
    onNavigate('/editor');
  };

  return (
    <CreateFromScratch
      onSectionsGenerated={handleSectionsGenerated}
      selectedModel={selectedModel}
    />
  );
}

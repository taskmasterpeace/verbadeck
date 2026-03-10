import { CreateFromScratch } from '@/components/CreateFromScratch';
import { ArrowLeft } from 'lucide-react';
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
    onNavigate('/editor');
  };

  return (
    <div>
      <div className="px-4 pt-4">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
      <CreateFromScratch
        onSectionsGenerated={handleSectionsGenerated}
        selectedModel={selectedModel}
      />
    </div>
  );
}

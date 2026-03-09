import { AIScriptProcessor } from '@/components/AIScriptProcessor';
import type { Section } from '@/lib/script-parser';

interface AIScriptProcessorPageProps {
  onSectionsGenerated: (sections: Section[]) => void;
  selectedModel: string;
  onNavigate: (path: string) => void;
}

export function AIScriptProcessorPage({
  onSectionsGenerated,
  selectedModel,
  onNavigate,
}: AIScriptProcessorPageProps) {
  const handleSectionsGenerated = (sections: Section[]) => {
    onSectionsGenerated(sections);
    // Navigate to editor after sections are generated
    onNavigate('/editor');
  };

  return (
    <AIScriptProcessor
      onSectionsGenerated={handleSectionsGenerated}
      selectedModel={selectedModel}
    />
  );
}

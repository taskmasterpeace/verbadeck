import { CreatePresentation } from '@/components/CreatePresentation';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <CreatePresentation
        onSelectFromScratch={() => onNavigate('/create/scratch')}
        onSelectProcessContent={() => onNavigate('/create/process')}
        onSelectKnowItAll={() => onNavigate('/know-it-all')}
      />
    </div>
  );
}

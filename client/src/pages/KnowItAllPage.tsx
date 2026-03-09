import { KnowItAllMode } from '@/components/KnowItAllMode';

interface KnowItAllPageProps {
  startStreaming: () => void;
}

export function KnowItAllPage({
  startStreaming,
}: KnowItAllPageProps) {
  return (
    <div className="p-4 space-y-4 pb-20 sm:pb-4">
      <KnowItAllMode
        startStreaming={startStreaming}
      />
    </div>
  );
}

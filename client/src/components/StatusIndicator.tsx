import { Badge } from './ui/badge';
import { CheckCircle } from 'lucide-react';

interface StatusIndicatorProps {
  isStreaming: boolean;
}

export function StatusIndicator({ isStreaming }: StatusIndicatorProps) {
  if (!isStreaming) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50">
      <Badge
        variant="default"
        className="text-lg px-6 py-3 shadow-lg animate-pulse"
      >
        <CheckCircle className="w-5 h-5 mr-2" />
        Listening
      </Badge>
    </div>
  );
}

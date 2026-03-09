import { Loader2 } from 'lucide-react';

export function ProcessingAnswersStep() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <div className="text-center">
        <p className="font-medium">Processing your answers...</p>
        <p className="text-sm text-muted-foreground mt-1">
          Generating precision follow-up questions
        </p>
      </div>
    </div>
  );
}

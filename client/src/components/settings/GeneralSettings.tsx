import { useState } from 'react';
import { X } from 'lucide-react';

interface GeneralSettingsProps {
  streamStatus: 'connecting' | 'connected' | 'disconnected';
  cancelWord?: string;
  onCancelWordChange?: (word: string) => void;
}

export function GeneralSettings({
  streamStatus,
  cancelWord = 'cancel',
  onCancelWordChange,
}: GeneralSettingsProps) {
  const [localCancelWord, setLocalCancelWord] = useState(cancelWord);
  const [newCancelWordInput, setNewCancelWordInput] = useState('');

  const handleCancelWordChange = (word: string) => {
    setLocalCancelWord(word);
    if (onCancelWordChange) {
      onCancelWordChange(word);
      localStorage.setItem('verbadeck-cancel-word', word);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Connection Status</h3>
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
            streamStatus === 'connected'
              ? 'bg-green-100 text-green-800'
              : streamStatus === 'connecting'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {streamStatus === 'connected' && '🟢 Connected to AssemblyAI'}
          {streamStatus === 'connecting' && '🟡 Connecting...'}
          {streamStatus === 'disconnected' && '⚫ Disconnected'}
        </div>
      </div>

      {/* Cancel Words */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold mb-3">Q&A Cancel Words</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Set words to cancel AI answer generation. Say any of these words during Q&A to stop processing a question.
        </p>

        {/* Visual badges for current cancel words */}
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-muted rounded-lg min-h-[3rem]">
          {localCancelWord.split(',').map((word, index) => {
            const trimmed = word.trim();
            if (!trimmed) return null;

            return (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-300"
              >
                <span>{trimmed}</span>
                <button
                  onClick={() => {
                    const words = localCancelWord
                      .split(',')
                      .map((w) => w.trim())
                      .filter((w) => w);
                    const newWords = words.filter((_, i) => i !== index);
                    handleCancelWordChange(
                      newWords.length > 0 ? newWords.join(', ') : 'cancel'
                    );
                  }}
                  className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                  title={`Remove "${trimmed}"`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          {localCancelWord.split(',').filter((w) => w.trim()).length === 0 && (
            <span className="text-muted-foreground text-sm italic">
              No cancel words set
            </span>
          )}
        </div>

        {/* Input for adding new cancel words */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newCancelWordInput}
            onChange={(e) => setNewCancelWordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const newWord = newCancelWordInput.trim();
                if (newWord) {
                  const words = localCancelWord
                    .split(',')
                    .map((w) => w.trim())
                    .filter((w) => w);
                  if (!words.includes(newWord)) {
                    handleCancelWordChange([...words, newWord].join(', '));
                    setNewCancelWordInput('');
                  }
                }
              }
            }}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Type a word and press Enter to add"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Default: "cancel"
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Say any of these words to cancel Q&A answer generation immediately.
        </p>
      </div>

      {/* Voice Settings - Placeholder for future */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold mb-3">Voice Settings</h3>
        <p className="text-xs text-muted-foreground">
          Voice sensitivity and audio settings coming soon.
        </p>
      </div>

      {/* Auto-save Settings - Placeholder for future */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold mb-3">Auto-save</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Auto-save presentations</p>
            <p className="text-xs text-muted-foreground">
              Automatically save your work as you edit
            </p>
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
            Enabled
          </div>
        </div>
      </div>
    </div>
  );
}

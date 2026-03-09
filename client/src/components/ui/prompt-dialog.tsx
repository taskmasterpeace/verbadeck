import { useState } from 'react';
import { X } from 'lucide-react';

interface PromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  submitText?: string;
  cancelText?: string;
}

export function PromptDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      onClose();
      setValue('');
    }
  };

  const handleClose = () => {
    onClose();
    setValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

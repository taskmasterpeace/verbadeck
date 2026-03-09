import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'danger';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const colors = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      button: 'bg-red-600 hover:bg-red-700',
    },
  };

  const colorScheme = colors[type];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`${colorScheme.bg} ${colorScheme.border} border rounded-lg p-4`}>
          <h3 className={`font-semibold mb-2 ${colorScheme.text}`}>{title}</h3>
          <p className="text-sm text-gray-700">{message}</p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 ${colorScheme.button} text-white rounded-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

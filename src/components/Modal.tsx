import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction: {
    label: string;
    onClick: () => void;
  };
}

export function Modal({
  isOpen,
  onClose,
  title,
  content,
  primaryAction,
  secondaryAction,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{content}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={secondaryAction.onClick}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {secondaryAction.label}
          </button>
          <button
            onClick={primaryAction.onClick}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            {primaryAction.label}
          </button>
        </div>
      </div>
    </div>
  );
}

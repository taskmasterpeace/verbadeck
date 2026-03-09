import { Check, Eye, X, ImageIcon } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';

interface SectionHeaderProps {
  sectionIndex: number;
  totalSections: number;
  hasImage: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onPreview: () => void;
  showPreviewButton: boolean;
}

export function SectionHeader({
  sectionIndex,
  totalSections,
  hasImage,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onPreview,
  showPreviewButton,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-base font-semibold flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {sectionIndex + 1}
        </span>
        <span className="text-muted-foreground font-normal text-sm">of {totalSections}</span>
        {hasImage && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-normal">
            <ImageIcon className="w-3 h-3" />
            Has Image
          </span>
        )}
      </CardTitle>
      <div className="flex items-center gap-2">
        {!isEditing ? (
          <>
            {showPreviewButton && (
              <button
                onClick={onPreview}
                className="text-xs px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                title="Preview how this slide will look to the audience"
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            )}
            <button
              onClick={onEdit}
              className="text-xs px-3 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-xs px-2 py-1 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            {showPreviewButton && (
              <button
                onClick={onPreview}
                className="text-xs px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                title="Preview how this slide will look to the audience"
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            )}
            <button
              onClick={onSave}
              className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Save
            </button>
            <button
              onClick={onCancel}
              className="text-xs px-3 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

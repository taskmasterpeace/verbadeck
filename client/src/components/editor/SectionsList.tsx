import { useState } from 'react';
import { GripVertical, Plus, Image as ImageIcon } from 'lucide-react';
import type { Section } from '@/lib/script-parser';

interface SectionsListProps {
  sections: Section[];
  activeSectionIndex: number;
  onSectionClick: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onAddSection?: () => void;
}

export function SectionsList({
  sections,
  activeSectionIndex,
  onSectionClick,
  onReorder,
  onAddSection,
}: SectionsListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Defensive check: ensure sections is an array
  const safeSections = Array.isArray(sections) ? sections : [];

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === toIndex) return;

    if (onReorder) {
      onReorder(draggedIndex, toIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Get first line of content for preview
  const getPreviewText = (section: Section): string => {
    const text = section.heading || section.content || 'Empty section';
    const firstLine = text.split('\n')[0];
    return firstLine.length > 50 ? firstLine.slice(0, 50) + '...' : firstLine;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {safeSections.map((section, index) => {
          const isActive = index === activeSectionIndex;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSectionClick(index)}
              className={`
                group relative rounded-lg border-2 transition-all cursor-pointer
                ${isActive
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/50'
                }
                ${isDragging ? 'opacity-40' : 'opacity-100'}
                ${isDragOver ? 'border-primary border-dashed' : ''}
              `}
            >
              {/* Drag handle */}
              <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="p-3 pl-7">
                {/* Section number and thumbnail */}
                <div className="flex items-start gap-3">
                  {/* Section number badge */}
                  <div className={`
                    flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Preview text */}
                    <p className={`
                      text-sm font-medium line-clamp-2 mb-1
                      ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                    `}>
                      {getPreviewText(section)}
                    </p>

                    {/* Image indicator */}
                    {section.imageUrl && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Has image</span>
                      </div>
                    )}

                    {/* Triggers preview */}
                    {section.selectedTriggers && section.selectedTriggers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {section.selectedTriggers.slice(0, 3).map((trigger, i) => (
                          <span
                            key={i}
                            className={`
                              text-xs px-1.5 py-0.5 rounded
                              ${i === 0
                                ? 'bg-primary/20 text-primary font-semibold'
                                : 'bg-muted text-muted-foreground'
                              }
                            `}
                          >
                            {trigger}
                          </span>
                        ))}
                        {section.selectedTriggers.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{section.selectedTriggers.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add section button */}
      {onAddSection && (
        <div className="p-3 border-t bg-muted/30">
          <button
            onClick={onAddSection}
            className="w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      )}
    </div>
  );
}

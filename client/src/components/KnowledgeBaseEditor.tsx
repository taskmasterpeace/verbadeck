import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BookOpen, Plus, X, Sparkles, Loader2, Edit2, Check } from 'lucide-react';
import type { Section } from '@/lib/script-parser';

interface KnowledgeBaseEntry {
  question: string;
  answer: string;
}

interface KnowledgeBaseEditorProps {
  knowledgeBase: KnowledgeBaseEntry[];
  sections: Section[];
  onUpdate: (kb: KnowledgeBaseEntry[]) => void;
  onGenerateFAQs: () => Promise<void>;
  isGenerating: boolean;
}

export function KnowledgeBaseEditor({
  knowledgeBase,
  sections,
  onUpdate,
  onGenerateFAQs,
  isGenerating,
}: KnowledgeBaseEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    setEditQuestion('');
    setEditAnswer('');
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditQuestion(knowledgeBase[index].question);
    setEditAnswer(knowledgeBase[index].answer);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      alert('Both question and answer are required');
      return;
    }

    const newEntry = { question: editQuestion.trim(), answer: editAnswer.trim() };

    if (isAdding) {
      // Add new entry
      onUpdate([...knowledgeBase, newEntry]);
    } else if (editingIndex !== null) {
      // Update existing entry
      const updated = [...knowledgeBase];
      updated[editingIndex] = newEntry;
      onUpdate(updated);
    }

    // Reset
    setIsAdding(false);
    setEditingIndex(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this FAQ entry?')) {
      const updated = knowledgeBase.filter((_, i) => i !== index);
      onUpdate(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Knowledge Base</h2>
              <p className="text-sm text-muted-foreground">
                Prepare answers to frequently asked questions during your presentation
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onGenerateFAQs}
                disabled={isGenerating || sections.length === 0}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Auto-Generate FAQs
                  </>
                )}
              </button>
              <button
                onClick={handleAdd}
                disabled={isAdding || editingIndex !== null}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {(isAdding || editingIndex !== null) && (
        <Card className="border-2 border-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {isAdding ? 'Add New FAQ' : 'Edit FAQ'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Question:</label>
              <input
                type="text"
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                placeholder="e.g., What is the pricing for this product?"
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Answer:</label>
              <textarea
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                placeholder="Provide a clear, concise answer that you can reference during the presentation..."
                className="w-full h-24 p-3 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isAdding ? 'Add' : 'Save'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {knowledgeBase.length === 0 && !isAdding && (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-4xl">💡</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">No FAQ entries yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add questions you might be asked during your presentation, or let AI suggest some based on your content
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={onGenerateFAQs}
                  disabled={isGenerating || sections.length === 0}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Auto-Generate FAQs
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Manually
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ List */}
      {knowledgeBase.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {knowledgeBase.length} {knowledgeBase.length === 1 ? 'entry' : 'entries'}
            </Badge>
          </div>

          {knowledgeBase.map((entry, index) => (
            <Card key={index} className={editingIndex === index ? 'opacity-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="text-xs font-semibold text-blue-600 mb-1">QUESTION:</div>
                      <div className="text-sm font-medium">{entry.question}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-green-600 mb-1">ANSWER:</div>
                      <div className="text-sm text-muted-foreground">{entry.answer}</div>
                    </div>
                  </div>

                  {editingIndex !== index && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        disabled={isAdding || editingIndex !== null}
                        className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        disabled={isAdding || editingIndex !== null}
                        className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

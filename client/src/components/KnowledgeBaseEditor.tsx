import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BookOpen, Plus, X, Sparkles } from 'lucide-react';

export interface KnowledgeBaseItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface KnowledgeBaseEditorProps {
  items: KnowledgeBaseItem[];
  onUpdate: (items: KnowledgeBaseItem[]) => void;
  onClose: () => void;
}

export function KnowledgeBaseEditor({ items, onUpdate, onClose }: KnowledgeBaseEditorProps) {
  const [editingItems, setEditingItems] = useState<KnowledgeBaseItem[]>(items);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const handleAdd = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert('Please enter both question and answer');
      return;
    }

    const newItem: KnowledgeBaseItem = {
      id: `kb-${Date.now()}`,
      question: newQuestion,
      answer: newAnswer,
    };

    setEditingItems([...editingItems, newItem]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleDelete = (id: string) => {
    setEditingItems(editingItems.filter(item => item.id !== id));
  };

  const handleSave = () => {
    onUpdate(editingItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Knowledge Base & FAQs
            </CardTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Add frequently asked questions and answers. The AI will use these to provide better responses during Q&A.
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add New FAQ */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 space-y-3 bg-blue-50">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <Plus className="w-4 h-4" />
              Add New FAQ
            </div>
            <input
              type="text"
              placeholder="Question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Answer (2-3 sentences recommended)..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-white text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAdd}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Add to Knowledge Base
            </button>
          </div>

          {/* Existing FAQs */}
          {editingItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No FAQs yet</p>
              <p className="text-sm mt-2">Add your first FAQ above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {editingItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">Q: {item.question}</div>
                          <div className="text-sm text-gray-700">A: {item.answer}</div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="border-t p-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Save Knowledge Base
          </button>
        </div>
      </Card>
    </div>
  );
}

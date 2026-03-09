import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

export function HelpSection() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="w-full bg-gray-50 hover:bg-gray-100 p-4 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">Model Information & Tips</span>
        </div>
        {showHelp ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {showHelp && (
        <div className="p-4 bg-white space-y-4">
          {/* Icon Legend */}
          <div>
            <h5 className="font-semibold text-gray-900 mb-2 text-sm">🔖 Model Capability Icons</h5>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div><span className="font-bold">⚡⚡⚡</span> Ultra-Fast (&lt;1s Groq LPU)</div>
              <div><span className="font-bold">⚡⚡</span> Fast (1-3s)</div>
              <div><span className="font-bold">💭</span> Reasoning (o1, o3)</div>
              <div><span className="font-bold">🆓</span> Free model</div>
              <div><span className="font-bold">🌐</span> Internet access</div>
              <div><span className="font-bold">✓</span> Quality model</div>
            </div>
          </div>

          {/* Model Strategy */}
          <div className="border-t pt-4">
            <h5 className="font-semibold text-gray-900 mb-2 text-sm">📊 Recommended Strategy</h5>
            <ul className="space-y-1 text-xs text-gray-700">
              <li>• <strong>Groq Llama 3.1 8B:</strong> Ultra-fast Q&A and quick operations (~438ms)</li>
              <li>• <strong>GPT-4o Mini:</strong> Best balance of cost and quality for most operations</li>
              <li>• <strong>Claude 3.5 Sonnet:</strong> Premium quality for critical content generation</li>
              <li>• <strong>Free Models:</strong> Limited rate but good for testing</li>
              <li>• All changes save automatically to localStorage</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

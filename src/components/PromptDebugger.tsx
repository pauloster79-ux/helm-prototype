import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Save, RotateCcw } from 'lucide-react';

interface PromptDebuggerProps {
  systemPrompt: string;
  onSave: (newPrompt: string) => void;
  onReset: () => void;
  defaultPrompt: string;
}

export default function PromptDebugger({
  systemPrompt,
  onSave,
  onReset
}: PromptDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(systemPrompt);
  const [isDirty, setIsDirty] = useState(false);

  // Update local state when prop changes (e.g. external update or initial load)
  useEffect(() => {
    setEditedPrompt(systemPrompt);
    setIsDirty(false);
  }, [systemPrompt]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedPrompt(e.target.value);
    setIsDirty(e.target.value !== systemPrompt);
  };

  const handleSave = () => {
    onSave(editedPrompt);
    // isDirty will be reset by the useEffect above once the parent updates the prop
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the system prompt to the default?')) {
      onReset();
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg transition-all duration-300 flex flex-col z-50 ${isOpen ? 'h-96' : 'h-12'}`}>
      {/* Header / Toggle Bar */}
      <div
        className="flex items-center justify-between px-4 h-12 bg-gray-100 cursor-pointer hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 font-medium text-gray-700">
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          <span>Prompt Debugger</span>
          {isDirty && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Unsaved Changes</span>}
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Edit the system prompt below to change how Helm behaves.
              Changes affect the next message you send.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded border border-gray-300"
                title="Reset to default prompt"
              >
                <RotateCcw size={14} />
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </div>

          <textarea
            value={editedPrompt}
            onChange={handleChange}
            className="flex-1 w-full p-4 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="System prompt..."
          />
        </div>
      )}
    </div>
  );
}



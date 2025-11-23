import React, { useState } from 'react';
import { Project } from '../lib/types';

interface ResetProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string, budget: number) => void;
  currentProject: Project | null;
}

export default function ResetProjectModal({ isOpen, onClose, onConfirm, currentProject }: ResetProjectModalProps) {
  const [title, setTitle] = useState(currentProject?.title || '');
  const [budget, setBudget] = useState(currentProject?.settings?.budget || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Start Fresh Project</h2>
        <p className="text-gray-600 mb-6">
          This will clear all current tasks and messages, allowing you to start planning a new project from scratch.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Kitchen Renovation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(title, budget)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Project
          </button>
        </div>
      </div>
    </div>
  );
}


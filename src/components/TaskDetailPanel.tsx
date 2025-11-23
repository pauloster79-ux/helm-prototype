import React from 'react';
import { Task } from '../lib/types';
import { User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const isOverdue = (endDate: string | null, status: string) => {
    if (status === 'complete' || !endDate) return false;
    return new Date(endDate) < new Date();
  };

  return (
    <div className="w-96 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto h-full shadow-xl z-10">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <h3 className="font-semibold text-gray-900">Task Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">WBS Code</div>
          <div className="text-sm font-mono text-gray-900">{task.wbs_code}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Title</div>
          <div className="text-sm font-medium text-gray-900">{task.title}</div>
        </div>

        {!task.is_phase && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-900 capitalize">
                {task.status.replace('-', ' ')}
              </span>
            </div>
          </div>
        )}

        {task.assignee && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Assignee</div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{task.assignee}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {task.start_date && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start</div>
              <div className="text-sm text-gray-900">{format(new Date(task.start_date), 'MMM d, yyyy')}</div>
            </div>
          )}

          {task.end_date && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">End</div>
              <div className={`text-sm font-medium ${isOverdue(task.end_date, task.status)
                  ? 'text-red-600'
                  : 'text-gray-900'
                }`}>
                {format(new Date(task.end_date), 'MMM d, yyyy')}
              </div>
            </div>
          )}
        </div>

        {task.latest_position && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Latest Position</div>
            <div className="text-sm text-gray-700 leading-relaxed bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                <span>{task.latest_position}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



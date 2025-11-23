import React from 'react';
import { Task } from '../lib/types';
import { CheckCircle, Circle, Clock, Layers, User } from 'lucide-react';
import { format } from 'date-fns';

interface WBSViewProps {
  tasks: Task[];
  selectedTask: Task | null;
  onSelectTask: (task: Task) => void;
}

export default function WBSView({ tasks, selectedTask, onSelectTask }: WBSViewProps) {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'on-track':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'off-track':
        return <Circle className="w-4 h-4 text-red-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Helper to find children
  const getChildTasks = (parentId: string | null) => tasks.filter(t => t.parent_id === parentId);

  const renderTask = (task: Task, level = 0): React.ReactNode => {
    const children = getChildTasks(task.id);
    const hasChildren = children.length > 0;

    return (
      <div key={task.id} className="border-b border-gray-100 last:border-0">
        <div
          className={`flex items-center gap-3 py-3 px-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedTask?.id === task.id ? 'bg-blue-50' : ''
            }`}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
          onClick={() => onSelectTask(task)}
        >
          <div className="w-12 text-xs text-gray-500 font-mono">{task.wbs_code}</div>



          {task.is_phase && (
            <Layers className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className={`text-sm ${task.is_phase ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
              {task.title}
            </div>
          </div>

          {task.assignee && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <User className="w-3.5 h-3.5" />
              <span>{task.assignee.split(' ')[0]}</span>
            </div>
          )}

          {task.start_date && (
            <div className={`flex items-center gap-1.5 text-xs text-gray-600 w-24`}>
              <span>{format(new Date(task.start_date), 'MMM d')}</span>
            </div>
          )}

          {task.end_date && (
            <div className={`flex items-center gap-1.5 text-xs text-gray-600 w-24`}>
              <span>{format(new Date(task.end_date), 'MMM d')}</span>
            </div>
          )}

          <div className="w-24 flex items-center gap-1.5">
            {!task.is_phase && (
              <>
                {getStatusIcon(task.status)}
                <span className="text-xs text-gray-600 capitalize">{task.status.replace('-', ' ')}</span>
              </>
            )}
          </div>
        </div>

        {hasChildren && (
          <div>
            {children.map(child => renderTask(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3 text-xs font-medium text-gray-700 uppercase tracking-wide">
          <div className="w-12">WBS</div>
          <div className="flex-1">Task</div>
          <div className="w-24">Assignee</div>
          <div className="w-24">Start Date</div>
          <div className="w-24">End Date</div>
          <div className="w-24">Status</div>
        </div>
      </div>
      <div>
        {getChildTasks(null).map(task => renderTask(task))}
      </div>
    </div>
  );
};



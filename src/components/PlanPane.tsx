import React, { useState } from 'react';
import { Project, Task } from '../lib/types';
import { LayoutList, GanttChart, Layers, RefreshCw } from 'lucide-react';
import WBSView from './WBSView';
import GanttView from './GanttView';
import TaskDetailPanel from './TaskDetailPanel';
import ResetProjectModal from './ResetProjectModal';
import { clearAndCreateProject } from '../lib/demo-data';

interface PlanPaneProps {
  project: Project | null;
  tasks: Task[];
  selectedTask: Task | null;
  onSelectTask: (task: Task | null) => void;
}

type ViewMode = 'wbs' | 'gantt' | 'both';

export default function PlanPane({ project, tasks, selectedTask, onSelectTask }: PlanPaneProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const completedTasks = tasks.filter(t => t.status === 'completed' && !t.is_phase).length;
  const totalTasks = tasks.filter(t => !t.is_phase).length;
  const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

  const handleResetConfirm = async (title: string, budget: number) => {
    try {
      const newId = await clearAndCreateProject(title, budget);
      localStorage.setItem('helm_project_id', newId);
      window.location.reload(); // Simple reload to pick up new project
    } catch (error) {
      console.error('Failed to reset project:', error);
      alert('Failed to create new project');
    }
    setIsResetModalOpen(false);
  };
  
  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Main plan view */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{project?.title || 'Loading...'}</h2>
                <p className="text-sm text-gray-500 mt-1">
                   Budget: £{project?.settings?.budget?.toLocaleString() ?? '0'}
                </p>
              </div>
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Start New Project"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="text-lg font-semibold text-gray-900">
                  {completedTasks} / {totalTasks}
                </div>
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* View toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('wbs')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'wbs'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              WBS
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <GanttChart className="w-4 h-4" />
              Gantt
            </button>
            <button
              onClick={() => setViewMode('both')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'both'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Both
            </button>
          </div>
        </div>
        
        {/* Views */}
        <div className="flex-1 overflow-auto p-6">
          {viewMode === 'wbs' && (
            <WBSView tasks={tasks} selectedTask={selectedTask} onSelectTask={onSelectTask} />
          )}
          {viewMode === 'gantt' && (
            <GanttView tasks={tasks} project={project} selectedTask={selectedTask} onSelectTask={onSelectTask} />
          )}
          {viewMode === 'both' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Work Breakdown Structure
                </h3>
                <WBSView tasks={tasks} selectedTask={selectedTask} onSelectTask={onSelectTask} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Timeline
                </h3>
                <GanttView tasks={tasks} project={project} selectedTask={selectedTask} onSelectTask={onSelectTask} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel task={selectedTask} onClose={() => onSelectTask(null)} />
      )}

      {/* Reset Modal */}
      <ResetProjectModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        currentProject={project}
      />
    </div>
  );
}

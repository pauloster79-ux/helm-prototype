import { Task, Project } from '../lib/types';
import { Layers, CheckCircle, Circle, Clock } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';

interface GanttViewProps {
  tasks: Task[];
  project: Project | null;
  selectedTask: Task | null;
  onSelectTask: (task: Task) => void;
}

export default function GanttView({ tasks, project: _project, selectedTask, onSelectTask }: GanttViewProps) {
  // Calculate project bounds
  const dates = tasks
    .flatMap(t => [t.start_date, t.end_date])
    .filter(Boolean)
    .map(d => new Date(d!));

  const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
  const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();

  // Pad dates
  const projectStart = addDays(minDate, -7);
  const projectEnd = addDays(maxDate, 7);
  const totalDays = Math.max(1, differenceInDays(projectEnd, projectStart));

  const getTaskPosition = (task: Task) => {
    if (!task.start_date || !task.end_date) return { left: '0%', width: '0%' };

    const start = new Date(task.start_date);
    const end = new Date(task.end_date);
    const startOffset = differenceInDays(start, projectStart);
    const duration = differenceInDays(end, start) + 1;

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const getBarColor = (status: Task['status']) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'on-track': return 'bg-blue-500';
      case 'off-track': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'on-track': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'off-track': return <Circle className="w-4 h-4 text-red-600" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Generate week markers
  const weekMarkers: { date: Date; offset: number }[] = [];
  let current = new Date(projectStart);
  while (current <= projectEnd) {
    const offset = differenceInDays(current, projectStart);
    weekMarkers.push({
      date: new Date(current),
      offset: (offset / totalDays) * 100
    });
    current = addDays(current, 7);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Gantt Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex">
          <div className="w-64 px-4 py-2 border-r border-gray-200">
            <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">Task</div>
          </div>
          <div className="flex-1 relative px-4 py-2 h-8">
            <div className="flex justify-between text-xs text-gray-600">
              {weekMarkers.map((marker, i) => (
                <div key={i} style={{ position: 'absolute', left: `${marker.offset}%` }} className="text-xs text-gray-500 whitespace-nowrap transform -translate-x-1/2">
                  {format(marker.date, 'd MMM')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Rows */}
      <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
        {tasks.map(task => {
          const position = getTaskPosition(task);

          return (
            <div
              key={task.id}
              className={`flex border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${selectedTask?.id === task.id ? 'bg-blue-50' : ''
                }`}
              onClick={() => onSelectTask(task)}
            >
              <div className="w-64 px-4 py-3 border-r border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {!task.is_phase && getStatusIcon(task.status)}
                  {task.is_phase && <Layers className="w-4 h-4 text-gray-400" />}
                  <span className={`text-sm ${task.is_phase ? 'font-semibold' : ''} truncate`}>
                    {task.title}
                  </span>
                </div>
              </div>
              <div className="flex-1 relative px-4 py-3 min-w-[400px]">
                {/* Week grid lines */}
                {weekMarkers.map((marker, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-gray-100"
                    style={{ left: `${marker.offset}%` }}
                  />
                ))}

                {/* Task bar */}
                <div
                  className={`absolute h-6 rounded ${getBarColor(task.status)} ${task.is_phase ? 'opacity-20 border-2 border-gray-400' : ''
                    }`}
                  style={{
                    left: position.left,
                    width: position.width,
                    top: '6px'
                  }}
                >
                  {task.assignee && !task.is_phase && (
                    <div className="px-2 py-0.5 text-xs text-white truncate">
                      {task.assignee.split(' ')[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

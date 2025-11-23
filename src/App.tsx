import { useState } from 'react';
import ChatPane from './components/ChatPane';
import PlanPane from './components/PlanPane';
import { useProject, useTasks, useMessages } from './lib/hooks';
import { callClaude, applyChanges } from './lib/ai';
import { generateProjectPlan, detectPlanningIntent } from './lib/planning';
import { supabase } from './lib/supabase';
import { resetToSample } from './lib/demo-data';
import { defaultSystemPrompt } from './data/system-prompt';
import { Task } from './lib/types';
import PromptDebugger from './components/PromptDebugger';

function App() {
  const [projectId, setProjectId] = useState<string | null>(localStorage.getItem('helm_project_id'));
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { project, loading: projectLoading } = useProject(projectId || '');
  const { tasks, loading: tasksLoading } = useTasks(projectId || '');
  const { messages } = useMessages(projectId || '');

  const handleCreateDemo = async () => {
    setIsProcessing(true);
    try {
      const newId = await resetToSample();
      setProjectId(newId);
      localStorage.setItem('helm_project_id', newId);
    } catch (e) {
      console.error(e);
      alert('Failed to create demo project');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!project || !projectId) return;

    // Optimistic add user message
    const { error } = await supabase.from('messages').insert({
      project_id: projectId,
      role: 'user',
      content
    });

    if (error) {
      console.error('Failed to send message', error);
      return;
    }

    setIsProcessing(true);

    try {
      // Detect mode
      const isPlanningRequest = detectPlanningIntent(
        content,
        tasks.length > 0
      );

      if (isPlanningRequest) {
        // PLANNING MODE
        console.log('Planning mode detected');

        // Add interim message for user feedback
        // Note: We can't easily insert a temporary message into Supabase without dirtying the DB history,
        // but for now we'll just rely on the isProcessing state to show activity.
        // Alternatively, we could insert a message saying "I'm working on a plan for you..."

        await supabase.from('messages').insert({
          project_id: projectId,
          role: 'assistant',
          content: '🔨 I am creating a comprehensive project plan for you. This may take a moment as I think through the phases and tasks...'
        });

        // Generate plan
        const { tasks: newTasks, explanation } = await generateProjectPlan(
          content,
          project
        );

        // Insert new tasks into Supabase
        if (newTasks.length > 0) {
          const { error: tasksError } = await supabase
            .from('tasks')
            .insert(newTasks);

          if (tasksError) {
            throw new Error(`Failed to save tasks: ${tasksError.message}`);
          }
        }

        // Add assistant response with explanation
        await supabase.from('messages').insert({
          project_id: projectId,
          role: 'assistant',
          content: explanation
        });

      } else {
        // MANAGEMENT MODE (existing logic)
        console.log('Management mode detected');

        const response = await callClaude(
          content,
          project,
          tasks,
          messages,
          project.settings?.system_prompt || defaultSystemPrompt
        );

        // Apply changes
        if (response.changes && response.changes.length > 0) {
          await applyChanges(response.changes);
        }

        // Add assistant response
        await supabase.from('messages').insert({
          project_id: projectId,
          role: 'assistant',
          content: response.explanation
        });
      }

    } catch (e: any) {
      console.error(e);
      // Add error message
      await supabase.from('messages').insert({
        project_id: projectId,
        role: 'assistant',
        content: `I'm sorry, I encountered an error processing your request: ${e.message || 'Unknown error'}. Please try again.`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePrompt = async (newPrompt: string) => {
    if (!projectId || !project) return;

    const currentSettings = project.settings || {};
    const updatedSettings = {
      ...currentSettings,
      system_prompt: newPrompt
    };

    const { error } = await supabase
      .from('projects')
      .update({ settings: updatedSettings })
      .eq('id', projectId);

    if (error) {
      console.error('Failed to update prompt:', error);
      alert('Failed to save prompt changes');
    }
  };

  const handleResetPrompt = async () => {
    await handleUpdatePrompt(defaultSystemPrompt);
  };

  if (!projectId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Helm Prototype</h1>
          <button
            onClick={handleCreateDemo}
            disabled={isProcessing}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? 'Creating Project...' : 'Create Demo Project'}
          </button>
        </div>
      </div>
    );
  }

  if (projectLoading || (projectId && tasksLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  // If project failed to load (deleted?)
  if (projectId && !project && !projectLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">Project not found</h1>
          <button
            onClick={() => {
              localStorage.removeItem('helm_project_id');
              setProjectId(null);
            }}
            className="text-blue-600 hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left: Chat */}
      <div className="w-1/3 min-w-[400px] border-r border-gray-200 bg-white flex flex-col">
        <ChatPane
          messages={messages}
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
        />
      </div>

      {/* Right: Plan */}
      <div className="flex-1 overflow-hidden">
        <PlanPane
          project={project}
          tasks={tasks}
          selectedTask={selectedTask}
          onSelectTask={setSelectedTask}
        />
      </div>

      <PromptDebugger
        systemPrompt={project?.settings?.system_prompt || defaultSystemPrompt}
        onSave={handleUpdatePrompt}
        onReset={handleResetPrompt}
        defaultPrompt={defaultSystemPrompt}
      />
    </div>
  );
}

export default App;

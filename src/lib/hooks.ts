import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Project, Task, Message } from './types';

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) console.error('Error fetching project:', error);
      if (data) setProject(data);
      setLoading(false);
    };

    fetchProject();

    const subscription = supabase
      .channel(`project:${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'projects', 
        filter: `id=eq.${projectId}` 
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setProject(null);
        } else {
          setProject(payload.new as Project);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  return { project, loading };
}

export function useTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('wbs_code', { ascending: true });
      
      if (error) console.error('Error fetching tasks:', error);
      if (data) setTasks(data);
      setLoading(false);
    };

    fetchTasks();

    const subscription = supabase
      .channel(`tasks:${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks', 
        filter: `project_id=eq.${projectId}` 
      }, () => {
        // Refetch all tasks to ensure correct order and state
        fetchTasks();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  return { tasks, loading };
}

export function useMessages(projectId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) console.error('Error fetching messages:', error);
      if (data) setMessages(data);
      setLoading(false);
    };

    fetchMessages();

    const subscription = supabase
      .channel(`messages:${projectId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `project_id=eq.${projectId}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  return { messages, loading };
}



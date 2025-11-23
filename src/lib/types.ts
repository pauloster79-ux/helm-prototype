export interface Project {
  id: string;
  title: string;
  settings: {
    system_prompt?: string;
    budget?: number;
    startDate?: string; // ISO
    endDate?: string; // ISO
  };
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  wbs_code: string;
  title: string;
  status: 'not-started' | 'on-track' | 'off-track' | 'complete';
  assignee: string | null;
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  completed_date: string | null; // YYYY-MM-DD
  dependencies: string[]; // Array of task IDs
  parent_id: string | null;
  is_phase: boolean;
  latest_position: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  project_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// AI Response types (still useful for the AI part)
export interface AIResponse {
  understanding: {
    entities: {
      people: Array<{ name: string; role: string }>;
      tasks: Array<{ reference: string; taskId: string }>;
      dates: Array<{ text: string; parsed: string }>;
    };
    intent: string;
    confidence: number;
  };
  impact: {
    affectedTasks: string[];
    timelineChange: string;
    criticalPathAffected: boolean;
  };
  changes: Array<{
    taskId: string;
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;
  explanation: string;
}



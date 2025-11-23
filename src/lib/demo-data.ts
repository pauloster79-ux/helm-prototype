import { supabase } from './supabase';

export const resetToSample = async () => {
  console.log('Resetting to sample data...');

  // 1. Clear existing data (delete current project if exists, or just create new)
  // For simplicity in prototype, we'll just create a new one and let the user switch

  // 2. Create Project
  const { data: project, error: projError } = await supabase.from('projects').insert({
    title: "Garden Shed Construction",
    settings: {
      budget: 2500,
      startDate: "2025-11-01",
      endDate: "2025-12-15",
      system_prompt: ""
    }
  }).select().single();

  if (projError) throw projError;
  const projectId = project.id;

  // 3. Create Tasks
  const tasks = [
    {
      id: "1",
      wbs_code: "1.0",
      title: "Submit planning notification to council",
      status: "complete",
      assignee: "Sarah Mitchell",
      start_date: "2025-10-28",
      end_date: "2025-11-08",
      completed_date: "2025-11-05",
      dependencies: [],
      parent: null,
      is_phase: false,
      latest_position: "Planning notification submitted on Nov 5. Council confirmed receipt and said typical turnaround is 3-5 days."
    },
    {
      id: "2",
      wbs_code: "1.1",
      title: "Obtain planning approval",
      status: "complete",
      assignee: "Council Planning",
      start_date: "2025-11-05",
      end_date: "2025-11-08",
      completed_date: "2025-11-07",
      dependencies: [],
      parent: null,
      is_phase: false,
      latest_position: "Approval granted Nov 7! No conditions attached. Can proceed with site work."
    },
    {
      id: "3",
      wbs_code: "2.0",
      title: "Order shed kit and materials",
      status: "complete",
      assignee: "Sarah Mitchell",
      start_date: "2025-11-08",
      end_date: "2025-11-10",
      completed_date: "2025-11-09",
      dependencies: [],
      parent: null,
      is_phase: false,
      latest_position: "Ordered from BuildBase. Delivery confirmed for Nov 12. Total cost £1,180."
    },
    {
      id: "4",
      wbs_code: "3.0",
      title: "Site Preparation",
      status: "on-track",
      assignee: null,
      start_date: "2025-11-09",
      end_date: "2025-11-16",
      completed_date: null,
      dependencies: [],
      parent: null,
      is_phase: true,
      latest_position: null
    },
    {
      id: "5",
      wbs_code: "3.1",
      title: "Clear site and prepare foundation area",
      status: "on-track",
      assignee: "James Mitchell",
      start_date: "2025-11-09",
      end_date: "2025-11-15",
      completed_date: null,
      dependencies: [],
      parent: "4",
      is_phase: false,
      latest_position: "Site cleared over weekend. Ground is more sloped than expected - may need extra leveling work."
    },
    {
      id: "6",
      wbs_code: "3.2",
      title: "Lay concrete base/foundation",
      status: "not-started",
      assignee: "Thompson Construction",
      start_date: "2025-11-16",
      end_date: "2025-11-16",
      completed_date: null,
      dependencies: ["5"],
      parent: "4",
      is_phase: false,
      latest_position: "Thompson scheduled for Saturday Nov 16. Weather forecast looks good."
    },
    {
      id: "7",
      wbs_code: "4.0",
      title: "Shed Construction",
      status: "not-started",
      assignee: null,
      start_date: "2025-11-22",
      end_date: "2025-11-29",
      completed_date: null,
      dependencies: [],
      parent: null,
      is_phase: true,
      latest_position: null
    },
    {
      id: "8",
      wbs_code: "4.1",
      title: "Erect shed frame",
      status: "not-started",
      assignee: "Thompson Construction",
      start_date: "2025-11-22",
      end_date: "2025-11-22",
      completed_date: null,
      dependencies: ["6"],
      parent: "7",
      is_phase: false,
      latest_position: null
    },
    {
      id: "9",
      wbs_code: "4.2",
      title: "Install roof and cladding",
      status: "not-started",
      assignee: "Thompson Construction",
      start_date: "2025-11-25",
      end_date: "2025-11-29",
      completed_date: null,
      dependencies: ["8"],
      parent: "7",
      is_phase: false,
      latest_position: null
    },
    {
      id: "10",
      wbs_code: "5.0",
      title: "Schedule electrician",
      status: "complete",
      assignee: "Sarah Mitchell",
      start_date: "2025-11-01",
      end_date: "2025-11-15",
      completed_date: "2025-11-08",
      dependencies: [],
      parent: null,
      is_phase: false,
      latest_position: "Brighton Electrical confirmed for Dec 3-4. £400 fixed quote."
    },
    {
      id: "11",
      wbs_code: "6.0",
      title: "Finishing Work",
      status: "not-started",
      assignee: null,
      start_date: "2025-12-03",
      end_date: "2025-12-10",
      completed_date: null,
      dependencies: [],
      parent: null,
      is_phase: true,
      latest_position: null
    },
    {
      id: "12",
      wbs_code: "6.1",
      title: "Complete electrical installation",
      status: "not-started",
      assignee: "Brighton Electrical",
      start_date: "2025-12-03",
      end_date: "2025-12-04",
      completed_date: null,
      dependencies: ["9"],
      parent: "11",
      is_phase: false,
      latest_position: null
    },
    {
      id: "13",
      wbs_code: "6.2",
      title: "Install internal shelving",
      status: "not-started",
      assignee: "James Mitchell",
      start_date: "2025-12-05",
      end_date: "2025-12-08",
      completed_date: null,
      dependencies: ["9"],
      parent: "11",
      is_phase: false,
      latest_position: null
    },
    {
      id: "14",
      wbs_code: "6.3",
      title: "Paint/stain exterior",
      status: "not-started",
      assignee: "James Mitchell",
      start_date: "2025-12-05",
      end_date: "2025-12-10",
      completed_date: null,
      dependencies: ["9"],
      parent: "11",
      is_phase: false,
      latest_position: null
    },
    {
      id: "15",
      wbs_code: "7.0",
      title: "Final inspection and handover",
      status: "not-started",
      assignee: "Sarah Mitchell",
      start_date: "2025-12-15",
      end_date: "2025-12-15",
      completed_date: null,
      dependencies: ["12", "13", "14"],
      parent: null,
      is_phase: false,
      latest_position: null
    }
  ];

  const idMap = new Map<string, string>();

  // Generate new UUIDs
  for (const task of tasks) {
    idMap.set(task.id, crypto.randomUUID());
  }

  const tasksToInsert = tasks.map(t => ({
    id: idMap.get(t.id),
    project_id: projectId,
    wbs_code: t.wbs_code,
    title: t.title,
    status: t.status,
    assignee: t.assignee,
    start_date: t.start_date,
    end_date: t.end_date,
    completed_date: t.completed_date,
    dependencies: t.dependencies.map(d => idMap.get(d)),
    parent_id: t.parent ? idMap.get(t.parent) : null,
    is_phase: t.is_phase,
    latest_position: t.latest_position
  }));

  const { error: taskError } = await supabase.from('tasks').insert(tasksToInsert);
  if (taskError) throw taskError;

  return projectId;
};

export const clearAndCreateProject = async (title: string, budget: number) => {
  console.log('Creating new empty project...');

  // Create New Project
  const { data: project, error: projError } = await supabase.from('projects').insert({
    title: title,
    settings: {
      budget: budget,
      startDate: new Date().toISOString().split('T')[0], // Default to today
      endDate: null,
      system_prompt: ""
    }
  }).select().single();

  if (projError) throw projError;

  return project.id;
};

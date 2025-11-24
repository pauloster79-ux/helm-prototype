import Anthropic from '@anthropic-ai/sdk';
import { Project, Task } from './types';
// importing markdown as raw text
import planningPromptRaw from '../data/planning-prompt.md?raw';
// importing markdown as raw text
import conversionPromptRaw from '../data/conversion-prompt.md?raw';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

// Must use full URL for the SDK to parse it correctly, similar to ai.ts
const anthropic = new Anthropic({
  apiKey: apiKey,
  baseURL: typeof window !== 'undefined' ? `${window.location.origin}/api/anthropic` : '/api/anthropic',
  defaultHeaders: {
    'anthropic-dangerous-direct-browser-access': 'true'
  }
});

interface ConversionResult {
  tasks: any[]; // We'll type check and transform this
  summary: {
    total_tasks: number;
    total_phases: number;
    estimated_duration: string;
    critical_path: string[];
    key_constraints: string[];
  };
  explanation: string;
}

/**
 * Generate a project plan from natural language request
 * Uses two-step process: planning → conversion
 */
export async function generateProjectPlan(
  userRequest: string,
  project: Project
): Promise<{ tasks: Partial<Task>[]; explanation: string }> {

  if (!apiKey) {
    throw new Error('Missing VITE_ANTHROPIC_API_KEY');
  }

  // STEP 1: Natural planning (unconstrained creativity)
  console.log('Step 1: Generating project outline...');

  const planningResponse = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4000,
    temperature: 0.5, // Slightly creative for planning
    system: planningPromptRaw,
    messages: [{
      role: 'user',
      content: `USER REQUEST: "${userRequest}"\n\nPROJECT DETAILS:\n${JSON.stringify(project, null, 2)}`
    }]
  });

  const outline = planningResponse.content[0].type === 'text' ? planningResponse.content[0].text : '';
  console.log('Generated outline:', outline.substring(0, 200) + '...');

  // STEP 2: Convert to structured tasks
  console.log('Step 2: Converting to structured tasks...');

  const conversionResponse = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4000,
    temperature: 0.2, // Lower temperature for precise structuring
    system: conversionPromptRaw,
    messages: [{
      role: 'user',
      content: `PROJECT OUTLINE:\n\n${outline}\n\nPROJECT DETAILS:\n${JSON.stringify(project, null, 2)}`
    }]
  });

  // Parse JSON response
  let responseText = conversionResponse.content[0].type === 'text' ? conversionResponse.content[0].text : '';

  // Clean up any markdown formatting
  responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Handle potential unescaped newlines in strings
  responseText = responseText.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');

  try {
    const result: ConversionResult = JSON.parse(responseText);

    console.log(`Created ${result.tasks.length} tasks across ${result.summary.total_phases} phases`);

    // STEP 3: ID Mapping (Simple IDs "1", "2" -> UUIDs)
    const idMap = new Map<string, string>();

    // First pass: Generate UUIDs for all tasks
    result.tasks.forEach(task => {
      const newId = crypto.randomUUID();
      idMap.set(task.id, newId);
    });

    // Second pass: Create final tasks with remapped IDs
    const finalTasks: Partial<Task>[] = result.tasks.map(task => {
      // Map dependencies
      const newDependencies = (task.dependencies || []).map((depId: string) => {
        return idMap.get(depId) || depId; // Fallback to original if not found (shouldn't happen)
      });

      // Map parent_id
      const newParentId = task.parent_id ? idMap.get(task.parent_id) : null;

      return {
        id: idMap.get(task.id), // Use the mapped UUID
        project_id: project.id,
        wbs_code: task.wbs_code,
        title: task.title,
        status: 'not-started', // Enforce start status
        assignee: task.assignee,
        start_date: task.start_date,
        end_date: task.end_date,
        completed_date: null,
        dependencies: newDependencies,
        parent_id: newParentId,
        is_phase: task.is_phase,
        latest_position: null
      };
    });

    return {
      tasks: finalTasks,
      explanation: `I've created a comprehensive project plan with ${finalTasks.length} tasks across ${result.summary.total_phases} phases.\n\n${result.explanation}\n\nKey constraints: ${result.summary.key_constraints.join(', ')}`
    };
  } catch (error) {
    console.error('Failed to parse conversion response:', responseText);
    throw new Error('AI returned invalid task structure. Please try again.');
  }
}

/**
 * Detect if user message is requesting planning vs management
 */
export function detectPlanningIntent(message: string, hasExistingTasks: boolean): boolean {
  const planningTriggers = [
    'create a project plan',
    'create a plan',
    'plan a project',
    'plan for',
    'break down',
    'what tasks',
    'generate a plan',
    'generate plan',
    'build a project',
    'organize a',
    'schedule for'
  ];

  const messageLower = message.toLowerCase();

  // Check for explicit planning triggers
  const hasExplicitTrigger = planningTriggers.some(trigger =>
    messageLower.includes(trigger)
  );

  // If no tasks and asking about creating something, assume planning
  const noTasksAndAsking = !hasExistingTasks && (
    messageLower.includes('create') ||
    messageLower.includes('build') ||
    messageLower.includes('make') ||
    messageLower.includes('start')
  );

  return hasExplicitTrigger || noTasksAndAsking;
}



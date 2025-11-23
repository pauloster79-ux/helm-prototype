import Anthropic from '@anthropic-ai/sdk';
import { supabase } from './supabase';
import { Project, Task, Message, AIResponse } from './types';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

// Must use full URL for the SDK to parse it correctly
const anthropic = new Anthropic({
  apiKey: apiKey,
  baseURL: '/api/anthropic',
  defaultHeaders: {
    'anthropic-dangerous-direct-browser-access': 'true'
  }
});

export async function callClaude(
  userMessage: string,
  project: Project,
  tasks: Task[],
  recentMessages: Message[],
  systemPrompt: string
): Promise<AIResponse> {

  if (!apiKey) {
    throw new Error('Missing VITE_ANTHROPIC_API_KEY');
  }

  const context = {
    project: {
      ...project,
      settings: undefined
    },
    tasks,
    recentMessages: recentMessages.map(m => ({ role: m.role, content: m.content }))
  };

  const userPrompt = `
CURRENT PROJECT STATE:
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

USER MESSAGE: "${userMessage}"

Respond with your analysis and changes as JSON.
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Try to parse JSON (handle markdown code blocks)
    let jsonText = responseText.trim();

    // More robust markdown block removal (non-greedy match)
    const jsonBlockMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      jsonText = jsonBlockMatch[1].trim();
    } else {
      const codeBlockMatch = jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }
    }

    // Handle potential unescaped newlines in strings which is common with LLMs
    // This is a simple heuristic to fix newlines inside string values
    jsonText = jsonText.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');

    try {
      return JSON.parse(jsonText) as AIResponse;
    } catch (error) {
      console.error('Failed to parse AI response:', responseText);
      console.error('Cleaned JSON text:', jsonText);

      // Fallback: If parsing fails, try to construct a simple error response
      // This handles cases where the AI refuses to output JSON (e.g. "I cannot do that")
      if (!jsonText.startsWith('{')) {
        return {
          understanding: {
            entities: { people: [], tasks: [], dates: [] },
            intent: 'error',
            confidence: 0
          },
          impact: { affectedTasks: [], timelineChange: '', criticalPathAffected: false },
          changes: [],
          explanation: responseText // Use the raw text as the explanation
        };
      }

      throw new Error('AI returned invalid JSON');
    }
  } catch (error) {
    console.error('Error calling Claude:', error);
    throw error;
  }
}

export async function applyChanges(changes: AIResponse['changes']) {
  console.log('Applying changes:', changes);

  for (const change of changes) {
    const { taskId, field, newValue } = change;

    // Update the task in Supabase
    const { error } = await supabase
      .from('tasks')
      .update({ [field]: newValue })
      .eq('id', taskId);

    if (error) {
      console.error(`Failed to update task ${taskId} field ${field}:`, error);
    } else {
      console.log(`Updated task ${taskId}: ${field} = ${newValue}`);
    }
  }
}

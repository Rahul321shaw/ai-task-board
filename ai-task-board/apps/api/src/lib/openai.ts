import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface DecomposedTask {
  title: string;
  description: string;
  priority: number;
}

export async function decomposeGoal(goalTitle: string, goalDescription?: string): Promise<DecomposedTask[]> {
  const prompt = `You are a project management assistant. Break down this goal into 5-8 concrete, actionable tasks.

Goal: ${goalTitle}
${goalDescription ? `Description: ${goalDescription}` : ""}

Return a JSON array of tasks with this structure:
[
  {
    "title": "short task title",
    "description": "1-2 sentence description of what needs to be done",
    "priority": 1  // 1=highest, 5=lowest
  }
]

Return only the JSON array, no other text.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(content);
  const tasks = Array.isArray(parsed) ? parsed : parsed.tasks || [];
  return tasks as DecomposedTask[];
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { decomposeGoal } from "../lib/openai";

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify([
                  { title: "Set up project", description: "Initialize repo and tooling", priority: 1 },
                  { title: "Build API", description: "Create REST endpoints", priority: 2 },
                  { title: "Build UI", description: "Create frontend pages", priority: 3 },
                ]),
              },
            },
          ],
        }),
      },
    },
  })),
}));

describe("decomposeGoal", () => {
  it("returns an array of tasks", async () => {
    const tasks = await decomposeGoal("Build a task board", "A kanban board with AI decomposition");
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
  });

  it("each task has required fields", async () => {
    const tasks = await decomposeGoal("Ship MVP");
    for (const task of tasks) {
      expect(task).toHaveProperty("title");
      expect(task).toHaveProperty("description");
      expect(task).toHaveProperty("priority");
    }
  });

  it("tasks have numeric priority", async () => {
    const tasks = await decomposeGoal("Launch product");
    for (const task of tasks) {
      expect(typeof task.priority).toBe("number");
    }
  });
});

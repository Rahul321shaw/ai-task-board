import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { decomposeGoal } from "../lib/openai";

async function getSession(request: FastifyRequest) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value[0] : value);
  }
  const webRequest = new Request(url.toString(), { method: request.method, headers });
  return auth.api.getSession({ headers: webRequest.headers });
}

const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  decompose: z.boolean().default(true),
});

const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

export async function goalRoutes(app: FastifyInstance) {
  // GET /api/goals - list user's goals
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const session = await getSession(request);
    if (!session) return reply.status(401).send({ error: "Unauthorized" });

    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      include: {
        tasks: { orderBy: [{ priority: "asc" }, { createdAt: "asc" }] },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return goals;
  });

  // POST /api/goals - create goal + optionally decompose via AI
  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const session = await getSession(request);
    if (!session) return reply.status(401).send({ error: "Unauthorized" });

    const body = createGoalSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const { title, description, decompose } = body.data;

    const goal = await prisma.goal.create({
      data: { title, description, userId: session.user.id },
    });

    let tasks: any[] = [];
    if (decompose && process.env.OPENAI_API_KEY) {
      try {
        const decomposed = await decomposeGoal(title, description);
        tasks = await prisma.$transaction(
          decomposed.map((t) =>
            prisma.task.create({
              data: { title: t.title, description: t.description, priority: t.priority, goalId: goal.id },
            })
          )
        );
      } catch (err) {
        console.error("AI decomposition failed:", err);
        // Non-fatal: return goal without tasks
      }
    }

    return { ...goal, tasks };
  });

  // GET /api/goals/:id
  app.get("/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await getSession(request);
    if (!session) return reply.status(401).send({ error: "Unauthorized" });

    const goal = await prisma.goal.findFirst({
      where: { id: request.params.id, userId: session.user.id },
      include: { tasks: { orderBy: [{ priority: "asc" }, { createdAt: "asc" }] } },
    });

    if (!goal) return reply.status(404).send({ error: "Not found" });
    return goal;
  });

  // PATCH /api/goals/:id
  app.patch("/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await getSession(request);
    if (!session) return reply.status(401).send({ error: "Unauthorized" });

    const body = updateGoalSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const goal = await prisma.goal.findFirst({
      where: { id: request.params.id, userId: session.user.id },
    });
    if (!goal) return reply.status(404).send({ error: "Not found" });

    const updated = await prisma.goal.update({
      where: { id: request.params.id },
      data: body.data,
      include: { tasks: true },
    });

    return updated;
  });

  // DELETE /api/goals/:id
  app.delete("/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await getSession(request);
    if (!session) return reply.status(401).send({ error: "Unauthorized" });

    const goal = await prisma.goal.findFirst({
      where: { id: request.params.id, userId: session.user.id },
    });
    if (!goal) return reply.status(404).send({ error: "Not found" });

    await prisma.goal.delete({ where: { id: request.params.id } });
    return { success: true };
  });

  // POST /api/goals/:id/decompose - re-run AI decomposition
  app.post("/:id/decompose", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await getSession(request);
    if (!session) return reply.status(401).send({ error: "Unauthorized" });

    const goal = await prisma.goal.findFirst({
      where: { id: request.params.id, userId: session.user.id },
    });
    if (!goal) return reply.status(404).send({ error: "Not found" });

    if (!process.env.OPENAI_API_KEY) {
      return reply.status(503).send({ error: "OpenAI not configured" });
    }

    const decomposed = await decomposeGoal(goal.title, goal.description ?? undefined);
    const tasks = await prisma.$transaction(
      decomposed.map((t) =>
        prisma.task.create({
          data: { title: t.title, description: t.description, priority: t.priority, goalId: goal.id },
        })
      )
    );

    return tasks;
  });
}

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { auth } from "../lib/auth.js";

async function getSession(request: FastifyRequest) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value[0] : value);
  }
  const webRequest = new Request(url.toString(), { method: request.method, headers });
  return auth.api.getSession({ headers: webRequest.headers });
}

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.number().int().min(1).max(5).optional(),
});

export async function taskRoutes(app: FastifyInstance) {
  // PATCH /api/tasks/:id - update task status/fields
  app.patch("/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await getSession(request);
    if (!session) return reply.status(401).send({ error: "Unauthorized" });

    const body = updateTaskSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    // Verify task belongs to user via goal
    const task = await prisma.task.findFirst({
      where: { id: request.params.id, goal: { userId: session.user.id } },
    });
    if (!task) return reply.status(404).send({ error: "Not found" });

    const updated = await prisma.task.update({
      where: { id: request.params.id },
      data: body.data,
    });

    return updated;
  });

  // DELETE /api/tasks/:id
  app.delete("/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await getSession(request);
    if (!session) return reply.status(401).send({ error: "Unauthorized" });

    const task = await prisma.task.findFirst({
      where: { id: request.params.id, goal: { userId: session.user.id } },
    });
    if (!task) return reply.status(404).send({ error: "Not found" });

    await prisma.task.delete({ where: { id: request.params.id } });
    return { success: true };
  });
}

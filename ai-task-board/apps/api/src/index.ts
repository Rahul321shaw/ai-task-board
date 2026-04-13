import Fastify from "fastify";
import cors from "@fastify/cors";
import { authRoutes } from "./routes/auth";
import { goalRoutes } from "./routes/goals";
import { taskRoutes } from "./routes/tasks";

const app = Fastify({ logger: true });

async function main() {
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // Health check
  app.get("/health", async () => ({ status: "ok" }));

  // Routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(goalRoutes, { prefix: "/api/goals" });
  await app.register(taskRoutes, { prefix: "/api/tasks" });

  const port = parseInt(process.env.PORT || "3001");
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`API running on port ${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

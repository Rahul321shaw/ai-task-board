import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../lib/auth.js";

export async function authRoutes(app: FastifyInstance) {
  // Delegate all /api/auth/* requests to better-auth handler
  app.all("/*", async (request: FastifyRequest, reply: FastifyReply) => {
    // Reconstruct a web Request for better-auth
    const url = new URL(
      request.url,
      `http://${request.headers.host || "localhost"}`
    );

    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value[0] : value);
    }

    const webRequest = new Request(url.toString(), {
      method: request.method,
      headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? JSON.stringify(request.body)
          : undefined,
    });

    const response = await auth.handler(webRequest);

    reply.status(response.status);

    // Handle Set-Cookie specially — multiple cookies must be set individually
    // to prevent header collapsing, which breaks session persistence
    const setCookieValues: string[] = [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        // Collect all set-cookie values to set as array
        setCookieValues.push(...value.split(", ").reduce((acc: string[], part: string) => {
          // Split on ", " that precede a cookie name=value pattern
          return acc.concat(part);
        }, []));
      } else {
        reply.header(key, value);
      }
    });
    if (setCookieValues.length > 0) {
      reply.header("set-cookie", setCookieValues);
    }

    const body = await response.text();
    reply.send(body);
  });
}

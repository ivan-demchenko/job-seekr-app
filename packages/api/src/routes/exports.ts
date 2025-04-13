import { Hono } from "hono";
import * as stream from "hono/streaming";
import type { WithAuthMiddleware } from "../auth.middleware";
import type { ExportController } from "../controllers/export";

/**
 * Creates the router for handling export-related endpoints.
 * @param authMiddleware - Middleware for authentication and authorization.
 * @param exportController - The controller handling export logic.
 * @returns A configured Hono router for export endpoints.
 */
export function makeExportsRouter(
  authMiddleware: WithAuthMiddleware,
  exportController: ExportController,
) {
  return new Hono()
    /**
     * GET /api/exports
     * Generates a PDF report of applications and interviews for the authenticated user.
     * Streams the generated PDF as the response.
     */
    .get("/", authMiddleware.middleware, async (c) => {
      const res = await exportController.generateReport(c.var.user.id);
      if (res.isErr()) {
        return c.json({ error: res.error }, 500);
      }
      return stream.stream(c, async (stream) => {
        await stream.write(res.value);
      });
    });
}

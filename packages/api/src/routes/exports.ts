import { Hono } from "hono";
import * as stream from "hono/streaming";
import type { WithAuthMiddleware } from "../auth.middleware";
import type { ExportController } from "../controllers/export";

export function makeExportsRouter(
  authMiddleware: WithAuthMiddleware,
  exportController: ExportController,
) {
  return new Hono().get("/", authMiddleware.middleware, async (c) => {
    const res = await exportController.generateReport(c.var.user.id);
    if (res.isErr()) {
      return c.json({ error: res.error }, 500);
    }
    return stream.stream(c, async (stream) => {
      await stream.write(res.value);
    });
  });
}

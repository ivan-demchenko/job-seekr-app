import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import type { WithAuthMiddleware } from "./auth.middleware";
import type { ApplicationsController } from "./controllers/applications";
import type { ExportController } from "./controllers/export";
import type { InterviewsController } from "./controllers/interviews";
import { makeApplicationsRouter } from "./routes/applications";
import { makeAuthRouter } from "./routes/auth";
import { makeExportsRouter } from "./routes/exports";
import { makeInterviewsRouter } from "./routes/interviews";

export default function makeMainRouter(
  authMiddleware: WithAuthMiddleware,
  applicationsController: ApplicationsController,
  interviewsController: InterviewsController,
  exportController: ExportController,
) {
  return new Hono()
    .use(logger())
    .get("/health", (c) => c.text("ok"))
    .route(
      "/api/applications",
      makeApplicationsRouter(authMiddleware, applicationsController),
    )
    .route(
      "/api/interviews",
      makeInterviewsRouter(authMiddleware, interviewsController),
    )
    .route("/api/export", makeExportsRouter(authMiddleware, exportController))
    .route("/api/auth", makeAuthRouter(authMiddleware))

    .get("*", serveStatic({ root: "./dist/web-client" }))
    .get("*", serveStatic({ path: "./dist/web-client/index.html" }));
}

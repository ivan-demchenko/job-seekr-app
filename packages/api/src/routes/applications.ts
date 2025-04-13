import { zValidator } from "@hono/zod-validator";
import { newApplicationSchema } from "@job-seekr/data/validation";
import { Hono } from "hono";
import { z } from "zod";
import type { WithAuthMiddleware } from "../auth.middleware";
import type { ApplicationsController } from "../controllers/applications";
import { applicationUpdateCommandSchema } from "../dto/application-update.dto";

/**
 * Creates the router for handling application-related endpoints.
 * @param authMiddleware - Middleware for authentication and authorization.
 * @param applicationsController - The controller handling application logic.
 * @returns A configured Hono router for application endpoints.
 */
export function makeApplicationsRouter(
  authMiddleware: WithAuthMiddleware,
  applicationsController: ApplicationsController,
) {
  return new Hono()
    /**
     * GET /api/applications
     * Retrieves all applications for the authenticated user.
     */
    .get("/", authMiddleware.middleware, async (c) => {
      const res = await applicationsController.getAllApplications(
        c.var.user.id,
      );
      if (res.isErr()) {
        return c.json({ error: res.error }, 500);
      }
      return c.json({ data: res.value });
    })
    /**
     * POST /api/applications
     * Adds a new application for the authenticated user.
     * Validates the request body using the `newApplicationSchema`.
     */
    .post(
      "/",
      authMiddleware.middleware,
      zValidator("json", newApplicationSchema),
      async (c) => {
        const result = await applicationsController.addNewApplication(
          c.var.user.id,
          c.req.valid("json"),
        );
        if (result.isErr()) {
          return c.json({ error: result.error }, 500);
        }
        return c.json({ data: result.value });
      },
    )
    /**
     * GET /api/applications/:id
     * Retrieves a specific application by its ID for the authenticated user.
     * Validates the `id` parameter to ensure it is a valid UUID.
     */
    .get(
      "/:id",
      authMiddleware.middleware,
      zValidator("param", z.object({ id: z.string().uuid() })),
      async (c) => {
        const entry = await applicationsController.getApplicationById(
          c.var.user.id,
          c.req.param("id"),
        );
        if (!entry) {
          return c.json({ error: "not found" }, 404);
        }
        return c.json({ data: entry });
      },
    )
    /**
     * PUT /api/applications/:id
     * Updates a specific application by its ID for the authenticated user.
     * Validates the `id` parameter and the request body using the `applicationUpdateCommandSchema`.
     */
    .put(
      "/:id",
      authMiddleware.middleware,
      zValidator("param", z.object({ id: z.string().uuid() })),
      zValidator("json", applicationUpdateCommandSchema),
      async (c) => {
        const result = await applicationsController.updateApplication(
          c.var.user.id,
          c.req.valid("param").id,
          c.req.valid("json"),
        );
        if (result.isErr()) {
          return c.json({ error: result.error }, 500);
        }
        return c.json({ data: result.value });
      },
    )
    /**
     * DELETE /api/applications/of-user
     * Deletes all applications for the authenticated user.
     */
    .delete("/of-user", authMiddleware.middleware, async (c) => {
      const result = await applicationsController.deleteUserApplications(
        c.var.user.id,
      );
      if (result.isErr()) {
        return c.json({ error: result.error }, 500);
      }
      return c.text("done");
    })
    /**
     * DELETE /api/applications/:id
     * Deletes a specific application by its ID for the authenticated user.
     * Validates the `id` parameter to ensure it is a valid UUID.
     */
    .delete(
      "/:id",
      authMiddleware.middleware,
      zValidator("param", z.object({ id: z.string().uuid() })),
      async (c) => {
        const result = await applicationsController.deleteApplicationById(
          c.req.valid("param").id,
        );
        if (result.isErr()) {
          return c.json({ error: result.error }, 500);
        }
        return c.text("done");
      },
    );
}

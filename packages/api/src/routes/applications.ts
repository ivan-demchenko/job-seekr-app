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
      return applicationsController.getAllApplications(
        c.var.user.id,
      ).match(
        (data) => c.json({ data }),
        (error) => c.json({ error }, 500)
      );
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
        return applicationsController.addNewApplication(
          c.var.user.id,
          c.req.valid("json"),
        ).match(
          (data) => c.json({ data }),
          (error) => c.json({ error }, 500)
        );
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
        return applicationsController.getApplicationById(
          c.var.user.id,
          c.req.valid("param").id,
        ).match(
          (data) => c.json({ data }),
          (error) => {
            switch (error.type) {
              case 'not-found':
                return c.json({ error }, 404);
              default:
                return c.json({ error: error }, 500);
            }
          }
        );
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
        return applicationsController.updateApplication(
          c.var.user.id,
          c.req.valid("param").id,
          c.req.valid("json"),
        ).match(
          (data) => c.json({ data }),
          (error) => c.json({ error }, 500)
        );
      },
    )
    /**
     * DELETE /api/applications/of-user
     * Deletes all applications for the authenticated user.
     */
    .delete("/of-user", authMiddleware.middleware, async (c) => {
      return applicationsController.deleteUserApplications(
        c.var.user.id,
      ).match(
        (data) => c.json({ data }),
        (error) => c.json({ error }, 500)
      );
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
        return applicationsController.deleteApplicationById(
          c.req.valid("param").id,
        ).match(
          (data) => c.json({ data }),
          (error) => c.json({ error }, 500)
        );
      },
    );
}

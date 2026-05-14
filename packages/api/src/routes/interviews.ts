import { zValidator } from "@hono/zod-validator";
import {
  newIntervewCommentSchema,
  newInterviewSchema,
} from "@job-seekr/data/validation";
import { Hono } from "hono";
import { z } from "zod";
import type { WithAuthMiddleware } from "../auth.middleware";
import type { InterviewsController } from "../controllers/interviews";

/**
 * Creates the router for handling interview-related endpoints.
 * @param authMiddleware - Middleware for authentication and authorization.
 * @param interviewsController - The controller handling interview logic.
 * @returns A configured Hono router for interview endpoints.
 */
export function makeInterviewsRouter(
  authMiddleware: WithAuthMiddleware,
  interviewsController: InterviewsController,
) {
  return new Hono()
    /**
     * POST /api/interviews
     * Adds a new interview to the database.
     * Validates the request body using the `newInterviewSchema`.
     */
    .post(
      "/",
      authMiddleware.middleware,
      zValidator("json", newInterviewSchema),
      async (c) => {
        const payload = c.req.valid("json");
        return interviewsController.addNewInterview(payload).match(
          (data) => c.json({ data }),
          (error) => c.json({ error }, 500)
        )
      },
    )
    /**
     * PUT /api/interviews/:id
     * Updates an existing interview by its ID.
     * Validates the `id` parameter and the request body using the `newInterviewSchema`.
     */
    .put(
      "/:id",
      authMiddleware.middleware,
      zValidator("param", z.object({ id: z.string() })),
      zValidator("json", newInterviewSchema),
      async (c) => {
        const id = c.req.valid("param").id;
        const payload = c.req.valid("json");
        return interviewsController.updateInterview(id, payload).match(
          (data) => c.json({ data }),
          (error) => c.json({ error }, 500)
        )
      },
    )
    /**
     * GET /api/interviews/:id
     * Retrieves an interview by its ID, including its comments.
     * Validates the `id` parameter.
     */
    .get(
      "/:id",
      authMiddleware.middleware,
      zValidator("param", z.object({ id: z.string() })),
      async (c) => {
        const id = c.req.valid("param").id;

        return interviewsController.getInterview(id).match(
          (data) => c.json({ data }),
          (error) => c.json({ error }, 500)
        )
      },
    )
    /**
     * POST /api/interviews/:id/comments
     * Adds a new comment to an interview.
     * Validates the `id` parameter and the request body using the `newIntervewCommentSchema`.
     */
    .post(
      "/:id/comments",
      authMiddleware.middleware,
      zValidator("param", z.object({ id: z.string() })),
      zValidator("json", newIntervewCommentSchema),
      async (c) => {
        const interviewId = c.req.valid("param").id;
        const payload = c.req.valid("json");
        return interviewsController.addInterviewComment(
          interviewId,
          payload,
        ).match(
          (data) => c.json({ data }),
          (error) => c.json({ error }, 500)
        );
      },
    )
    /**
     * DELETE /api/interviews/:id/comments/:comment_id
     * Deletes a comment from an interview.
     * Validates the `id` and `comment_id` parameters.
     */
    .delete(
      "/:id/comments/:comment_id",
      authMiddleware.middleware,
      zValidator("param", z.object({ id: z.string(), comment_id: z.string() })),
      async (c) => {
        const interviewId = c.req.valid("param").id;
        const commentId = c.req.valid("param").comment_id;
        return interviewsController.deleteInterviewCommentById(
          interviewId,
          commentId,
        ).match(
          (data) => c.json({ data }),
          (error) => c.json({ error }, 500)
        );
      },
    )
    /**
     * PUT /api/interviews/:id/comments/:comment_id
     * Updates a comment in an interview.
     * Validates the `comment_id` parameter and the request body using the `newIntervewCommentSchema`.
     */
    .put(
      "/:id/comments/:comment_id",
      authMiddleware.middleware,
      zValidator("param", z.object({ comment_id: z.string() })),
      zValidator("json", newIntervewCommentSchema.omit({ comment_date: true })),
      async (c) => {
        const commentId = c.req.valid("param").comment_id;
        const payload = c.req.valid("json");
        return interviewsController.updateInterviewComment(
          commentId,
          payload,
        ).match(
          (data) => c.json({ data }),
          (error) => c.json({ error }, 500)
        );
      },
    );
}

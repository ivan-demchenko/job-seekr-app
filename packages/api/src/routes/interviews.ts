import { Hono } from "hono";
import type { WithAuthMiddleware } from "../auth.middleware";
import type { InterviewsController } from "../controllers/interviews";
import { zValidator } from "@hono/zod-validator";
import { newIntervewCommentSchema, newInterviewSchema } from "@job-seekr/data/validation";
import { z } from "zod";

export function makeInterviewsRouter(
  authMiddleware: WithAuthMiddleware,
  interviewsController: InterviewsController,
) {
  return new Hono()
    .post('/',
      authMiddleware.middleware,
      zValidator('json', newInterviewSchema),
      async (c) => {
        const payload = c.req.valid('json');
        const result = await interviewsController.addNewInterview(payload);
        if (result.isErr()) {
          return c.json({ error: result.error }, 500);
        }
        return c.json({ data: result.value });
      })
    .put('/:id',
      authMiddleware.middleware,
      zValidator('param', z.object({ id: z.string() })),
      zValidator('json', newInterviewSchema),
      async (c) => {
        const id = c.req.valid('param').id;
        const payload = c.req.valid('json');
        const result = await interviewsController.updateInterview(id, payload);
        if (result.isErr()) {
          return c.json({ error: result.error }, 500);
        }
        return c.json({ data: result.value });
      }).get('/:id', authMiddleware.middleware, zValidator('param', z.object({id: z.string()})), async (c) => {

        const id = c.req.valid('param').id;

        const result = await interviewsController.getInterview(id)
         if (result.isErr()) {
          return c.json({ error: result.error }, 500);
        }
        return c.json({data: result.value})
      }).post('/:id/comments', authMiddleware.middleware, zValidator('param', z.object({id: z.string()})), zValidator('json', newIntervewCommentSchema), async (c) => {
        const interviewId = c.req.valid('param').id;
        const payload = c.req.valid('json');
        const result = await interviewsController.addInterviewComment(interviewId, payload);
        if (result.isErr()) {
          return c.json({ error: result.error }, 500);
        }
        return c.json({ data: result.value });
      }).delete('/:id/comments/:comment_id', authMiddleware.middleware, zValidator('param', z.object({id: z.string(), comment_id: z.string()})), async (c) => {
        const interviewId = c.req.valid('param').id;
        const commentId = c.req.valid('param').comment_id;
        const result = await interviewsController.deleteInterviewCommentById(interviewId, commentId);
         if (result.isErr()) {
          return c.json({ error: result.error }, 500);
        }
        return c.json({ data: result.value });
      }).put('/:id/comments/:comment_id', authMiddleware.middleware, zValidator('param', z.object({comment_id: z.string()})), zValidator('json', newIntervewCommentSchema.omit({comment_date: true})), async (c) => {
        const commentId = c.req.valid('param').comment_id;
        const payload = c.req.valid('json')
        const result = await interviewsController.updateInterviewComment(commentId, payload);
          if (result.isErr()) {
          return c.json({ error: result.error }, 500);
        }
        return c.json({ data: result.value });
      })
}
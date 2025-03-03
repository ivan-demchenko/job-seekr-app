import { Hono } from "hono";
import type { WithAuthMiddleware } from "../auth.middleware";
import type { InterviewsController } from "../controllers/interviews";
import { zValidator } from "@hono/zod-validator";
import { newInterviewSchema } from "@job-seekr/data/validation";
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
      })
}
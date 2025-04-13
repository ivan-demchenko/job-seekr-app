import { z } from "zod";

export const applicationUpdateCommandSchema = z.discriminatedUnion("target", [
  z.object({ target: z.literal("status"), status: z.string() }),
  z.object({
    target: z.literal("job_description"),
    job_description: z.string(),
  }),
]);

export type ApplicationUpdateCommand = z.infer<typeof applicationUpdateCommandSchema>;

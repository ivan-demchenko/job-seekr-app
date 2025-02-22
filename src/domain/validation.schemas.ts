import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { applications, interviews } from './db.schemas';

export const applicationSelectSchema = createSelectSchema(applications);
export type ApplicationSelectModel = z.infer<typeof applicationSelectSchema>;

export const applicationWithInterviewSchema = applicationSelectSchema.extend({
  interviewsCount: z.number()
})
export type ApplicationWithInterviewModel = z.infer<typeof applicationWithInterviewSchema>;

export const applicationInsertSchema = createInsertSchema(applications);
export type NewApplicationModel = z.infer<typeof applicationInsertSchema>;

export const applicationUpdateSchema = createUpdateSchema(applications);
export type PatchApplicationModel = z.infer<typeof applicationUpdateSchema>;

export const interviewSelectSchema = createSelectSchema(interviews);
export type InterviewModel = z.infer<typeof interviewSelectSchema>;

export const interviewInsertSchema = createInsertSchema(interviews);
export type NewInterviewModel = z.infer<typeof interviewInsertSchema>;
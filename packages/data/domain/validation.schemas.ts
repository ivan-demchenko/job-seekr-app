import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { applications, interviews } from './db.schemas';

export const applicationSchema = createSelectSchema(applications);
export type ApplicationModel = z.infer<typeof applicationSchema>;

export const applicationListSchema = applicationSchema.extend({
  interviewsCount: z.number()
})
export type ApplicationListModel = z.infer<typeof applicationListSchema>;

export const newApplicationSchema = applicationSchema.omit({
  id: true,
  user_id: true,
});
export type NewApplicationModel = z.infer<typeof newApplicationSchema>;


export const interviewSelectSchema = createSelectSchema(interviews);
export type InterviewModel = z.infer<typeof interviewSelectSchema>;

export const newInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
});
export type NewInterviewModel = z.infer<typeof newInterviewSchema>;

export const interviewUpdateSchema = createUpdateSchema(interviews);
export type UpdateInterviewModel = z.infer<typeof interviewUpdateSchema>;
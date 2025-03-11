import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { applications, interviewComments, interviews } from "./db.schemas";

export const applicationSchema = createSelectSchema(applications);
export type ApplicationModel = z.infer<typeof applicationSchema>;

export const applicationListSchema = applicationSchema.extend({
  interviewsCount: z.number(),
});
export type ApplicationListModel = z.infer<typeof applicationListSchema>;

export const newApplicationSchema = applicationSchema.omit({
  id: true,
  user_id: true,
});
export type NewApplicationModel = z.infer<typeof newApplicationSchema>;

export const interviewSelectSchema = createSelectSchema(interviews);
export type InterviewModel = z.infer<typeof interviewSelectSchema>;

const commentSchema = createSelectSchema(interviewComments)

export const interviewWithCommentSchema = interviewSelectSchema.extend({
  comments: z.array(commentSchema)});
  
export type InterviewWithCommentModel = z.infer<
  typeof interviewWithCommentSchema
>;

export const newInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
});
export type NewInterviewModel = z.infer<typeof newInterviewSchema>;

export const interviewUpdateSchema = createUpdateSchema(interviews);
export type UpdateInterviewModel = z.infer<typeof interviewUpdateSchema>;

export const interviewCommentSchema = createSelectSchema(interviewComments);
export type InterviewCommentModel = z.infer<typeof interviewCommentSchema>;

export const newIntervewCommentSchema = createInsertSchema(
  interviewComments,
).omit({
  id: true,
  interview_id: true,
});

export type NewInterviewCommentModel = z.infer<typeof newIntervewCommentSchema>;

import { z } from 'zod';

export const InterviewSchema = z.object({
  id: z.string(),
  application_id: z.string(),
  interview_date: z.number(),
  topic: z.string(),
  participants: z.string(),
});

export const InterviewListSchema = z.array(InterviewSchema);

export type InterviewModel = z.infer<typeof InterviewSchema>;
export type InterviewListModel = z.infer<typeof InterviewListSchema>;
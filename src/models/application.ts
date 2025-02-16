import { z } from 'zod';

export const ApplicationSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  job_description: z.string(),
  application_date: z.string(),
  status: z.union([
    z.literal('applied'),
    z.literal('interviews'),
    z.literal('rejection'),
    z.literal('cancelled')
  ])
});

export const ApplicationsReadSchema = ApplicationSchema.extend({
  interviewsCount: z.number()
})

export const ApplicationsReadListSchema = z.array(ApplicationsReadSchema);

export type ApplicationModel = z.infer<typeof ApplicationSchema>;
export type ApplicationsReadListModel = z.infer<typeof ApplicationsReadListSchema>;
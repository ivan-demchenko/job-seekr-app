import { sql } from 'drizzle-orm';
import { pgTable, text, bigint, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

export const applications = pgTable("applications", {
  id: varchar({ length: 36 }).notNull().unique().primaryKey(),
  user_id: text().notNull(),
  company: text().notNull(),
  position: text().notNull(),
  job_description: text().notNull(),
  job_posting_url: text().notNull().default(''),
  application_date: bigint({ mode: 'number' }).notNull().default(sql`extract(epoch from now())`),
  status: varchar({ length: 30 }).notNull()
});

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

export const interviews = pgTable("interviews", {
  id: varchar({ length: 36 }).notNull().unique().primaryKey(),
  application_id: varchar({ length: 36 })
    .references(() => applications.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  interview_date: bigint({ mode: 'number' }).notNull(),
  topic: text().notNull(),
  participants: text().notNull(),
  prep_notes: text().notNull(),
});

export const interviewSelectSchema = createSelectSchema(interviews);
export type InterviewModel = z.infer<typeof interviewSelectSchema>;

export const interviewInsertSchema = createInsertSchema(interviews);
export type NewInterviewModel = z.infer<typeof interviewInsertSchema>;
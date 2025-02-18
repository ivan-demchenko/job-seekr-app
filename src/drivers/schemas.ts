import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

export const applications = sqliteTable("applications", {
  id: text({ length: 36 }).notNull().unique().primaryKey(),
  company: text().notNull(),
  position: text().notNull(),
  job_description: text().notNull(),
  application_date: integer().notNull(),
  status: text({ length: 30 }).notNull()
});

export const applicationSelectSchema = createSelectSchema(applications);
export type ApplicationModel = z.infer<typeof applicationSelectSchema>;

export const applicationWithInterviewSchema = applicationSelectSchema.extend({
  interviewsCount: z.number()
})
export type ApplicationWithInterviewModel = z.infer<typeof applicationWithInterviewSchema>;

export const applicationInsertSchema = createInsertSchema(applications);
export type NewApplicationModel = z.infer<typeof applicationInsertSchema>;

export const applicationUpdateSchema = createUpdateSchema(applications);
export type PatchApplicationModel = z.infer<typeof applicationUpdateSchema>;

export const interviews = sqliteTable("interviews", {
  id: text({ length: 36 }).notNull().unique().primaryKey(),
  application_id: text({ length: 36 })
    .references(() => applications.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  interview_date: integer().notNull(),
  topic: text().notNull(),
  participants: text().notNull(),
  prep_notes: text().notNull(),
});

export const interviewSelectSchema = createSelectSchema(interviews);
export type InterviewModel = z.infer<typeof interviewSelectSchema>;

export const interviewInsertSchema = createInsertSchema(interviews);
export type NewInterviewModel = z.infer<typeof interviewInsertSchema>;
import { sql } from "drizzle-orm";
import { bigint, boolean, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const applications = pgTable("applications", {
  id: varchar({ length: 36 }).notNull().unique().primaryKey(),
  user_id: text().notNull(),
  company: text().notNull(),
  position: text().notNull(),
  job_description: text().notNull(),
  job_posting_url: text().notNull().default(""),
  application_date: bigint({ mode: "number" })
    .notNull()
    .default(sql`extract(epoch from now())`),
  status: varchar({ length: 30 }).notNull(),
});

export const interviews = pgTable("interviews", {
  id: varchar({ length: 36 }).notNull().unique().primaryKey(),
  application_id: varchar({ length: 36 })
    .references(() => applications.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  interview_date: bigint({ mode: "number" }).notNull(),
  topic: text().notNull(),
  participants: text().notNull(),
  prep_notes: text().notNull(),
});

export const interviewComments = pgTable("interviewComments", {
  id: varchar({ length: 36 }).notNull().unique().primaryKey(),
  interview_id: varchar({ length: 36 })
    .references(() => interviews.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  comment_date: bigint({ mode: "number" }).notNull(),
  comment: text().notNull(),
  pinned: boolean().notNull().default(false),
});

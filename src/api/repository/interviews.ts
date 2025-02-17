import { Result, Ok, Err } from 'neverthrow';
import * as tables from '../../drivers/schemas';
import { eq } from 'drizzle-orm';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';

export class InterviewsRepository {
  constructor(
    private db: BunSQLiteDatabase
  ) { }
  async addInterview(
    payload: tables.InterviewModel
  ): Promise<Result<tables.InterviewModel, string>> {
    try {
      await this.db.insert(tables.interviews).values({
        id: payload.id,
        application_id: payload.application_id,
        interview_date: payload.interview_date,
        topic: payload.topic,
        participants: payload.participants,
      }).onConflictDoNothing();
      return new Ok(payload);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to add an interview: ${e.message}`);
      }
      return new Err(`Failed to add an interview: unknown error`);
    }
  }

  async getInterviews(
    applicationId: string
  ): Promise<Result<tables.InterviewModel[], string>> {
    try {
      const data = this.db.select().from(tables.interviews).where(eq(tables.interviews.application_id, applicationId)).all();
      return new Ok(data);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to read from the interviews table: ${e.message}`);
      }
      return new Err(`Failed to read from the interviews table: unknown error`);
    }
  }

  async getAllInterviews(): Promise<Result<tables.InterviewModel[], string>> {
    try {
      const rawData = this.db.select().from(tables.interviews).all();
      return new Ok(rawData);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to read from the interviews table: ${e.message}`);
      }
      return new Err(`Failed to read from the interviews table: unknown error`);
    }
  }
}
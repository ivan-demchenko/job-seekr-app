import { Result, Ok, Err } from 'neverthrow';
import { interviews } from '../../domain/db.schemas';
import { eq } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { InterviewModel } from '../../domain/validation.schemas';

export class InterviewsRepository {
  constructor(
    private db: NeonHttpDatabase
  ) { }
  async addInterview(
    payload: InterviewModel
  ): Promise<Result<InterviewModel, string>> {
    try {
      await this.db.insert(interviews).values(payload).onConflictDoNothing();
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
  ): Promise<Result<InterviewModel[], string>> {
    try {
      const data = await this.db
        .select()
        .from(interviews)
        .where(eq(interviews.application_id, applicationId));
      return new Ok(data);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to read from the interviews table: ${e.message}`);
      }
      return new Err(`Failed to read from the interviews table: unknown error`);
    }
  }

  async getAllInterviews(): Promise<Result<InterviewModel[], string>> {
    try {
      const rawData = await this.db.select().from(interviews);
      return new Ok(rawData);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to read from the interviews table: ${e.message}`);
      }
      return new Err(`Failed to read from the interviews table: unknown error`);
    }
  }
}
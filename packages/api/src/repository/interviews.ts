import { Result, Ok, Err } from 'neverthrow';
import { type DBType, eq } from '@job-seekr/data/utils';
import { interviews as tInterviews } from '@job-seekr/data/tables';
import { type InterviewModel } from '@job-seekr/data/validation';

export class InterviewsRepository {
  constructor(
    private db: DBType
  ) { }
  async addInterview(
    payload: InterviewModel
  ): Promise<Result<InterviewModel, string>> {
    try {
      await this.db.insert(tInterviews).values(payload).onConflictDoNothing();
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
        .from(tInterviews)
        .where(eq(tInterviews.application_id, applicationId));
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
      const rawData = await this.db.select().from(tInterviews);
      return new Ok(rawData);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to read from the interviews table: ${e.message}`);
      }
      return new Err(`Failed to read from the interviews table: unknown error`);
    }
  }
}
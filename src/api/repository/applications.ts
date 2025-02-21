import { Result, Ok, Err } from 'neverthrow';
import * as tables from '../../drivers/schemas';
import { and, count, eq } from 'drizzle-orm';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';

export class ApplicationsRepository {
  constructor(
    private db: BunSQLiteDatabase
  ) { }
  async getAllApplications(userId: string): Promise<Result<tables.ApplicationWithInterviewModel[], string>> {
    try {
      const applications = this.db
        .select({
          id: tables.applications.id,
          company: tables.applications.company,
          position: tables.applications.position,
          application_date: tables.applications.application_date,
          status: tables.applications.status,
          job_description: tables.applications.job_description,
          interviewsCount: count(tables.interviews.id),
          user_id: tables.applications.user_id,
        })
        .from(tables.applications)
        .where(eq(tables.applications.user_id, userId))
        .leftJoin(tables.interviews, eq(tables.applications.id, tables.interviews.application_id))
        .groupBy(tables.applications.id, tables.interviews.application_id)
        .all();
      return new Ok(applications);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to read from the applications table: ${e.message}`);
      }
      return new Err(`Failed to read from the applications table: unknown error`);
    }
  }

  async getApplicationById(userId: string, id: string): Promise<Result<{
    application: tables.ApplicationModel,
    interviews: tables.InterviewModel[]
  }, string>> {
    try {
      const application = this.db.select().from(tables.applications)
        .where(and(
          eq(tables.applications.user_id, userId),
          eq(tables.applications.id, id)
        ))
        .get();
      if (!application) {
        return new Err('Application not found');
      }
      const interviews = this.db.select().from(tables.interviews)
        .where(eq(tables.interviews.application_id, id))
        .orderBy(tables.interviews.interview_date)
        .all();

      return new Ok({
        application,
        interviews
      });
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to read from the applications table: ${e.message}`);
      }
      return new Err(`Failed to read from the applications table: unknown error`);
    }
  }

  async setApplicationStatus(
    userId: string,
    id: string,
    newStatus: string
  ): Promise<Result<tables.ApplicationModel, string>> {
    try {
      const res = await this.db.update(tables.applications)
        .set({ status: newStatus })
        .where(and(
          eq(tables.applications.id, id),
          eq(tables.applications.user_id, userId),
        ))
        .returning();

      return new Ok(res[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to update the application: ${e.message}`);
      }
      return new Err(`Failed to update the application: unknown error`);
    }
  }

  async setApplicationJobDescription(
    userId: string,
    id: string,
    newJD: string
  ): Promise<Result<any, string>> {
    try {
      const res = await this.db.update(tables.applications)
        .set({ job_description: newJD })
        .where(and(
          eq(tables.applications.id, id),
          eq(tables.applications.user_id, userId),
        ))
        .returning();

      return new Ok(res[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to update the application: ${e.message}`);
      }
      return new Err(`Failed to update the application: unknown error`);
    }
  }

  async addApplication(
    payload: tables.NewApplicationModel
  ): Promise<Result<tables.ApplicationModel, string>> {
    try {
      await this.db.insert(tables.applications).values(payload).onConflictDoNothing();
      return new Ok(payload);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to insert into the applications table: ${e.message}`);
      }
      return new Err(`Failed to insert into the applications table: unknown error`);
    }
  }
}
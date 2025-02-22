import { Result, Ok, Err } from 'neverthrow';
import * as tables from '../../domain/db.schemas';
import { and, count, eq } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { ApplicationSelectModel, ApplicationWithInterviewModel, InterviewModel, NewApplicationModel } from '../../domain/validation.schemas';

export class ApplicationsRepository {
  constructor(
    private db: NeonHttpDatabase
  ) { }
  async getAllApplications(
    userId: string
  ): Promise<Result<ApplicationWithInterviewModel[], string>> {
    try {
      const applications = await this.db
        .select({
          id: tables.applications.id,
          company: tables.applications.company,
          position: tables.applications.position,
          application_date: tables.applications.application_date,
          status: tables.applications.status,
          job_description: tables.applications.job_description,
          job_posting_url: tables.applications.job_posting_url,
          interviewsCount: count(tables.interviews.id),
          user_id: tables.applications.user_id,
        })
        .from(tables.applications)
        .where(eq(tables.applications.user_id, userId))
        .leftJoin(tables.interviews, eq(tables.applications.id, tables.interviews.application_id))
        .groupBy(tables.applications.id, tables.interviews.application_id);
      return new Ok(applications);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to read from the applications table: ${e.message}`);
      }
      return new Err(`Failed to read from the applications table: unknown error`);
    }
  }

  async getApplicationById(userId: string, id: string): Promise<Result<{
    application: ApplicationSelectModel,
    interviews: InterviewModel[]
  }, string>> {
    try {
      const applications = await this.db.select()
        .from(tables.applications)
        .where(and(
          eq(tables.applications.user_id, userId),
          eq(tables.applications.id, id)
        ));

      const application = applications[0];
      if (!applications) {
        return new Err('Application not found');
      }
      const interviews = await this.db.select().from(tables.interviews)
        .where(eq(tables.interviews.application_id, id))
        .orderBy(tables.interviews.interview_date);

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
  ): Promise<Result<ApplicationSelectModel, string>> {
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
    payload: NewApplicationModel
  ): Promise<Result<ApplicationSelectModel, string>> {
    try {
      const record = await this.db.insert(tables.applications).values(payload).onConflictDoNothing().returning();
      return new Ok(record[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to insert into the applications table: ${e.message}`);
      }
      return new Err(`Failed to insert into the applications table: unknown error`);
    }
  }
}
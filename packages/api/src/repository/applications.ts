import { Result, Ok, Err } from 'neverthrow';
import { applications as tApplications, interviews as tInterviews } from '@job-seekr/data/tables';
import { type DBType, eq, count, and } from '@job-seekr/data/utils';
import { type ApplicationSelectModel, type ApplicationWithInterviewModel, type InterviewModel, type NewApplicationModel } from '@job-seekr/data/validation';

export class ApplicationsRepository {
  constructor(
    private db: DBType
  ) { }
  async getAllApplications(
    userId: string
  ): Promise<Result<ApplicationWithInterviewModel[], string>> {
    try {
      const applications = await this.db
        .select({
          id: tApplications.id,
          company: tApplications.company,
          position: tApplications.position,
          application_date: tApplications.application_date,
          status: tApplications.status,
          job_description: tApplications.job_description,
          job_posting_url: tApplications.job_posting_url,
          interviewsCount: count(tInterviews.id),
          user_id: tApplications.user_id,
        })
        .from(tApplications)
        .where(eq(tApplications.user_id, userId))
        .leftJoin(tInterviews, eq(tApplications.id, tInterviews.application_id))
        .groupBy(tApplications.id, tInterviews.application_id);
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
        .from(tApplications)
        .where(and(
          eq(tApplications.user_id, userId),
          eq(tApplications.id, id)
        ));

      const application = applications[0];
      if (!applications) {
        return new Err('Application not found');
      }
      const interviews = await this.db.select().from(tInterviews)
        .where(eq(tInterviews.application_id, id))
        .orderBy(tInterviews.interview_date);

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
      const res = await this.db.update(tApplications)
        .set({ status: newStatus })
        .where(and(
          eq(tApplications.id, id),
          eq(tApplications.user_id, userId),
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
      const res = await this.db.update(tApplications)
        .set({ job_description: newJD })
        .where(and(
          eq(tApplications.id, id),
          eq(tApplications.user_id, userId),
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
      const record = await this.db.insert(tApplications).values(payload).onConflictDoNothing().returning();
      return new Ok(record[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to insert into the applications table: ${e.message}`);
      }
      return new Err(`Failed to insert into the applications table: unknown error`);
    }
  }
}
import {
  applications as tApplications,
  interviews as tInterviews,
} from "@job-seekr/data/tables";
import { type DBType, and, count, eq } from "@job-seekr/data/utils";
import type {
  ApplicationListModel,
  ApplicationModel,
} from "@job-seekr/data/validation";
import { Err, Ok, type Result } from "neverthrow";
import type { ApplicationResponseDto } from "../dto/application.response.dto";

export class ApplicationsRepository {
  constructor(private db: DBType) {}

  /**
   * Retrieves all applications for a specific user.
   * @param userId - The ID of the user whose applications are being retrieved.
   * @returns A `Result` containing a list of applications or an error message.
   */
  async getAllApplications(
    userId: string,
  ): Promise<Result<ApplicationListModel[], string>> {
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
        return new Err(
          `Failed to read from the applications table: ${e.message}`,
        );
      }
      return new Err(
        "Failed to read from the applications table: unknown error",
      );
    }
  }

  /**
   * Retrieves a specific application by its ID, including its interviews.
   * @param userId - The ID of the user who owns the application.
   * @param id - The ID of the application to retrieve.
   * @returns A `Result` containing the application and its interviews or an error message.
   */
  async getApplicationById(
    userId: string,
    id: string,
  ): Promise<Result<ApplicationResponseDto, string>> {
    try {
      const applications = await this.db
        .select()
        .from(tApplications)
        .where(
          and(eq(tApplications.user_id, userId), eq(tApplications.id, id)),
        );

      if (applications.length === 0) {
        return new Err("Not found");
      }
      const interviews = await this.db
        .select()
        .from(tInterviews)
        .where(eq(tInterviews.application_id, id))
        .orderBy(tInterviews.interview_date);

      return new Ok({
        application: applications[0],
        interviews,
      });
    } catch (e) {
      if (e instanceof Error) {
        return new Err(
          `Failed to read from the applications table: ${e.message}`,
        );
      }
      return new Err(
        "Failed to read from the applications table: unknown error",
      );
    }
  }

  /**
   * Updates the status of a specific application.
   * @param userId - The ID of the user who owns the application.
   * @param id - The ID of the application to update.
   * @param newStatus - The new status to set for the application.
   * @returns A `Result` containing the updated application or an error message.
   */
  async setApplicationStatus(
    userId: string,
    id: string,
    newStatus: string,
  ): Promise<Result<ApplicationModel, string>> {
    try {
      const res = await this.db
        .update(tApplications)
        .set({ status: newStatus })
        .where(and(eq(tApplications.id, id), eq(tApplications.user_id, userId)))
        .returning();

      return new Ok(res[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to update the application: ${e.message}`);
      }
      return new Err("Failed to update the application: unknown error");
    }
  }

  /**
   * Updates the job description of a specific application.
   * @param userId - The ID of the user who owns the application.
   * @param id - The ID of the application to update.
   * @param newJD - The new job description to set for the application.
   * @returns A `Result` containing the updated application or an error message.
   */
  async setApplicationJobDescription(
    userId: string,
    id: string,
    newJD: string,
  ): Promise<Result<ApplicationModel, string>> {
    try {
      const res = await this.db
        .update(tApplications)
        .set({ job_description: newJD })
        .where(and(eq(tApplications.id, id), eq(tApplications.user_id, userId)))
        .returning();

      return new Ok(res[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to update the application: ${e.message}`);
      }
      return new Err("Failed to update the application: unknown error");
    }
  }

  /**
   * Adds a new application to the database.
   * @param payload - The application data to insert.
   * @returns A `Result` containing the inserted application or an error message.
   */
  async addApplication(
    payload: ApplicationModel,
  ): Promise<Result<ApplicationModel, string>> {
    try {
      const record = await this.db
        .insert(tApplications)
        .values(payload)
        .onConflictDoNothing()
        .returning();
      return new Ok(record[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(
          `Failed to insert into the applications table: ${e.message}`,
        );
      }
      return new Err(
        "Failed to insert into the applications table: unknown error",
      );
    }
  }

  /**
   * Deletes all applications for a specific user.
   * @param userId - The ID of the user whose applications are being deleted.
   * @returns A `Result` indicating success or an error message.
   */
  async deleteUserApplications(userId: string): Promise<Result<boolean, string>> {
    try {
      await this.db
        .delete(tApplications)
        .where(eq(tApplications.user_id, userId))
        .execute();
      return new Ok(true);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to delete user applications: ${e.message}`);
      }
      return new Err("Failed to delete user applications: unknown error");
    }
  }

  /**
   * Deletes multiple applications by their IDs.
   * @param ids - A list of application IDs to delete.
   * @returns A `Result` indicating success or an error message.
   */
  async deleteManyApplications(ids: string[]): Promise<Result<boolean, string>> {
    try {
      await this.db
        .delete(tApplications)
        .where(and(...ids.map((id) => eq(tApplications.id, id))))
        .execute();
      return new Ok(true);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to delete applications: ${e.message}`);
      }
      return new Err("Failed to delete applications: unknown error");
    }
  }
}

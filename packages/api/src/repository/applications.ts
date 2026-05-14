import {
  applications as tApplications,
  interviews as tInterviews,
} from "@job-seekr/data/tables";
import { type DBType, and, count, eq } from "@job-seekr/data/utils";
import type {
  ApplicationListModel,
  ApplicationModel,
} from "@job-seekr/data/validation";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import type { ApplicationResponseDto } from "../dto/application.response.dto";
import { DbError } from "./db-error";

export class ApplicationsRepository {
  constructor(private db: DBType) {}

  getAllApplications(
    userId: string,
  ): ResultAsync<ApplicationListModel[], DbError> {
    return ResultAsync.fromPromise(
      this.db
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
        .leftJoin(
          tInterviews,
          eq(tApplications.id, tInterviews.application_id),
        )
        .groupBy(tApplications.id, tInterviews.application_id),
      (e) => new DbError("Failed to read from the applications table", e),
    );
  }

  getApplicationById(
    userId: string,
    id: string,
  ): ResultAsync<ApplicationResponseDto, DbError> {
    return ResultAsync.fromPromise(
      this.db
        .select()
        .from(tApplications)
        .where(and(eq(tApplications.user_id, userId), eq(tApplications.id, id))),
      (e) => new DbError("Failed to read from the applications table", e),
    ).andThen((applications) => {
      if (applications.length === 0) {
        return errAsync(new DbError("Application not found", null));
      }
      return ResultAsync.fromPromise(
        this.db
          .select()
          .from(tInterviews)
          .where(eq(tInterviews.application_id, id))
          .orderBy(tInterviews.interview_date),
        (e) => new DbError("Failed to read interviews", e),
      ).map((interviews) => ({
        application: applications[0],
        interviews,
      }));
    });
  }

  setApplicationStatus(
    userId: string,
    id: string,
    newStatus: string,
  ): ResultAsync<ApplicationModel, DbError> {
    return ResultAsync.fromPromise(
      this.db
        .update(tApplications)
        .set({ status: newStatus })
        .where(and(eq(tApplications.id, id), eq(tApplications.user_id, userId)))
        .returning(),
      (e) => new DbError("Failed to update the application", e),
    ).andThen((rows) => {
      if (rows.length === 0) {
        return errAsync(new DbError("Application not found", null));
      }
      return okAsync(rows[0]);
    });
  }

  setApplicationJobDescription(
    userId: string,
    id: string,
    newJD: string,
  ): ResultAsync<ApplicationModel, DbError> {
    return ResultAsync.fromPromise(
      this.db
        .update(tApplications)
        .set({ job_description: newJD })
        .where(and(eq(tApplications.id, id), eq(tApplications.user_id, userId)))
        .returning(),
      (e) => new DbError("Failed to update the application", e),
    ).andThen((rows) => {
      if (rows.length === 0) {
        return errAsync(new DbError("Application not found", null));
      }
      return okAsync(rows[0]);
    });
  }

  addApplication(
    payload: ApplicationModel,
  ): ResultAsync<ApplicationModel, DbError> {
    return ResultAsync.fromPromise(
      this.db.insert(tApplications).values(payload).returning(),
      (e) => new DbError("Failed to insert into the applications table", e),
    ).map((rows) => rows[0]);
  }

  deleteUserApplications(
    userId: string,
  ): ResultAsync<boolean, DbError> {
    return ResultAsync.fromPromise(
      this.db
        .delete(tApplications)
        .where(eq(tApplications.user_id, userId))
        .execute(),
      (e) => new DbError("Failed to delete user applications", e),
    ).map(() => true);
  }

  deleteManyApplications(
    ids: string[],
  ): ResultAsync<boolean, DbError> {
    return ResultAsync.fromPromise(
      this.db
        .delete(tApplications)
        .where(and(...ids.map((id) => eq(tApplications.id, id))))
        .execute(),
      (e) => new DbError("Failed to delete applications", e),
    ).map(() => true);
  }
}

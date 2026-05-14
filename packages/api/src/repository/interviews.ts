import {
  interviewComments as tInterviewCommments,
  interviews as tInterviews,
} from "@job-seekr/data/tables";
import { type DBType, and, eq } from "@job-seekr/data/utils";
import type {
  InterviewCommentModel,
  InterviewModel,
  InterviewWithCommentModel,
  NewInterviewCommentModel,
  NewInterviewModel,
} from "@job-seekr/data/validation";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { DbError } from "./db-error";

export class InterviewsRepository {
  constructor(private db: DBType) {}

  addInterview(
    payload: InterviewModel,
  ): ResultAsync<InterviewModel, DbError> {
    return ResultAsync.fromPromise(
      this.db.insert(tInterviews).values(payload).returning(),
      (e) => new DbError("Failed to add an interview", e),
    ).map((rows) => rows[0]);
  }

  updateInterview(
    interviewId: string,
    payload: NewInterviewModel,
  ): ResultAsync<InterviewModel, DbError> {
    return ResultAsync.fromPromise(
      this.db
        .update(tInterviews)
        .set(payload)
        .where(eq(tInterviews.id, interviewId))
        .returning(),
      (e) => new DbError("Failed to update the interview", e),
    ).andThen((rows) => {
      if (rows.length === 0) {
        return errAsync(new DbError("Interview not found", null));
      }
      return okAsync(rows[0]);
    });
  }

  getInterviewById(
    interviewId: string,
  ): ResultAsync<InterviewWithCommentModel, DbError> {
    return ResultAsync.fromPromise(
      this.db
        .select()
        .from(tInterviews)
        .where(eq(tInterviews.id, interviewId)),
      (e) => new DbError("Failed to fetch interview", e),
    ).andThen((interviews) => {
      if (interviews.length === 0) {
        return errAsync(new DbError("Interview not found", null));
      }
      return ResultAsync.fromPromise(
        this.db
          .select()
          .from(tInterviewCommments)
          .where(eq(tInterviewCommments.interview_id, interviewId)),
        (e) => new DbError("Failed to fetch interview comments", e),
      ).map((comments) => ({ ...interviews[0], comments }));
    });
  }

  getInterviews(
    applicationId: string,
  ): ResultAsync<InterviewModel[], DbError> {
    return ResultAsync.fromPromise(
      this.db
        .select()
        .from(tInterviews)
        .where(eq(tInterviews.application_id, applicationId)),
      (e) => new DbError("Failed to read from the interviews table", e),
    );
  }

  getAllInterviews(): ResultAsync<InterviewModel[], DbError> {
    return ResultAsync.fromPromise(
      this.db.select().from(tInterviews),
      (e) => new DbError("Failed to read from the interviews table", e),
    );
  }

  addNewComment(
    payload: Omit<InterviewCommentModel, "pinned">,
  ): ResultAsync<InterviewCommentModel, DbError> {
    return ResultAsync.fromPromise(
      this.db.insert(tInterviewCommments).values(payload).returning(),
      (e) => new DbError("Failed to add comment", e),
    ).map((rows) => rows[0]);
  }

  deleteComment(
    interviewId: string,
    commentId: string,
  ): ResultAsync<boolean, DbError> {
    return ResultAsync.fromPromise(
      this.db
        .delete(tInterviewCommments)
        .where(
          and(
            eq(tInterviewCommments.id, commentId),
            eq(tInterviewCommments.interview_id, interviewId),
          ),
        )
        .execute(),
      (e) => new DbError("Failed to delete comment", e),
    ).map(() => true);
  }

  updateComment(
    commentId: string,
    payload: Omit<NewInterviewCommentModel, "comment_date">,
  ): ResultAsync<InterviewCommentModel, DbError> {
    return ResultAsync.fromPromise(
      this.db
        .update(tInterviewCommments)
        .set(payload)
        .where(eq(tInterviewCommments.id, commentId))
        .returning(),
      (e) => new DbError("Failed to update comment", e),
    ).andThen((rows) => {
      if (rows.length === 0) {
        return errAsync(new DbError("Comment not found", null));
      }
      return okAsync(rows[0]);
    });
  }
}

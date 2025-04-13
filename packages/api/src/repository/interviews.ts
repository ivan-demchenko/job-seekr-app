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
import { Err, Ok, type Result } from "neverthrow";

export class InterviewsRepository {
  constructor(private db: DBType) {}

  /**
   * Adds a new interview to the database.
   * @param payload - The interview data to insert.
   * @returns A `Result` containing the inserted interview or an error message.
   */
  async addInterview(
    payload: InterviewModel,
  ): Promise<Result<InterviewModel, string>> {
    try {
      await this.db.insert(tInterviews).values(payload).onConflictDoNothing();
      return new Ok(payload);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to add an interview: ${e.message}`);
      }
      return new Err("Failed to add an interview: unknown error");
    }
  }

  /**
   * Updates an existing interview in the database.
   * @param interviewId - The ID of the interview to update.
   * @param payload - The updated interview data.
   * @returns A `Result` containing the updated interview or an error message.
   */
  async updateInterview(
    interviewId: string,
    payload: NewInterviewModel,
  ): Promise<Result<InterviewModel, string>> {
    try {
      const res = await this.db
        .update(tInterviews)
        .set(payload)
        .where(eq(tInterviews.id, interviewId))
        .returning();
      return new Ok(res[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to update the interview: ${e.message}`);
      }
      return new Err("Failed to update the interview: unknown error");
    }
  }

  /**
   * Retrieves an interview by its ID, including its comments.
   * @param interviewId - The ID of the interview to retrieve.
   * @returns A `Result` containing the interview with its comments or an error message.
   */
  async getInterviewById(
    interviewId: string,
  ): Promise<Result<InterviewWithCommentModel, string>> {
    const interviews = await this.db
      .select()
      .from(tInterviews)
      .where(eq(tInterviews.id, interviewId));
    const comments = await this.db
      .select()
      .from(tInterviewCommments)
      .where(eq(tInterviewCommments.interview_id, interviewId));

    if (!interviews) {
      return new Err("Interview not found");
    }

    return new Ok({ ...interviews[0], comments });
  }

  /**
   * Retrieves all interviews associated with a specific application.
   * @param applicationId - The ID of the application.
   * @returns A `Result` containing a list of interviews or an error message.
   */
  async getInterviews(
    applicationId: string,
  ): Promise<Result<InterviewModel[], string>> {
    try {
      const data = await this.db
        .select()
        .from(tInterviews)
        .where(eq(tInterviews.application_id, applicationId));
      return new Ok(data);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(
          `Failed to read from the interviews table: ${e.message}`,
        );
      }
      return new Err("Failed to read from the interviews table: unknown error");
    }
  }

  /**
   * Retrieves all interviews in the database.
   * @returns A `Result` containing a list of all interviews or an error message.
   */
  async getAllInterviews(): Promise<Result<InterviewModel[], string>> {
    try {
      const rawData = await this.db.select().from(tInterviews);
      return new Ok(rawData);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(
          `Failed to read from the interviews table: ${e.message}`,
        );
      }
      return new Err("Failed to read from the interviews table: unknown error");
    }
  }

  /**
   * Adds a new comment to an interview.
   * @param payload - The comment data to insert (excluding the `pinned` property).
   * @returns A `Result` containing the inserted comment or an error message.
   */
  async addNewComment(
    payload: Omit<InterviewCommentModel, "pinned">,
  ): Promise<Result<InterviewCommentModel, string>> {
    try {
      const newComment = await this.db
        .insert(tInterviewCommments)
        .values(payload)
        .onConflictDoNothing()
        .returning();
      return new Ok(newComment[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to add comment: ${e.message}`);
      }
      return new Err("Failed to add comment: unknown error");
    }
  }

  /**
   * Deletes a comment from an interview.
   * @param interviewId - The ID of the interview the comment belongs to.
   * @param commentId - The ID of the comment to delete.
   * @returns A `Result` indicating success or an error message.
   */
  async deleteComment(
    interviewId: string,
    commentId: string,
  ): Promise<Result<boolean, string>> {
    try {
      await this.db
        .delete(tInterviewCommments)
        .where(
          and(
            eq(tInterviewCommments.id, commentId),
            eq(tInterviewCommments.interview_id, interviewId),
          ),
        );
      return new Ok(true);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to delete comment: ${e.message}`);
      }
      return new Err("Failed to delete comment: unknown error");
    }
  }

  /**
   * Updates a comment in an interview.
   * @param commentId - The ID of the comment to update.
   * @param payload - The updated comment data (excluding the `comment_date` property).
   * @returns A `Result` containing the updated comment or an error message.
   */
  async updateComment(
    commentId: string,
    payload: Omit<NewInterviewCommentModel, "comment_date">,
  ): Promise<Result<InterviewCommentModel, string>> {
    try {
      const res = await this.db
        .update(tInterviewCommments)
        .set(payload)
        .where(eq(tInterviewCommments.id, commentId))
        .returning();
      return new Ok(res[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to update comment: ${e.message}`);
      }
      return new Err("Failed to update comment: unknown error");
    }
  }
}

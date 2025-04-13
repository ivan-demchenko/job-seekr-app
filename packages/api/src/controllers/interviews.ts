import type {
  InterviewCommentModel,
  InterviewModel,
  InterviewWithCommentModel,
  NewInterviewCommentModel,
  NewInterviewModel,
} from "@job-seekr/data/validation";
import type { Result } from "neverthrow";
import type { InterviewsRepository } from "../repository/interviews";

const ERROR_MESSAGES = {
  INSERT_INTERVIEW: "Failed to insert the interview",
  UPDATE_INTERVIEW: "Failed to update the interview",
  FETCH_INTERVIEW: "Failed to fetch interview",
  INSERT_COMMENT: "Failed to insert comment",
  DELETE_COMMENT: "Failed to delete comment",
  UPDATE_COMMENT: "Failed to update comment",
  DATABASE_ERROR: "Database error",
};

export class InterviewsController {
  constructor(private interviewsRepository: InterviewsRepository) {}

  private prepareNewInterview(payload: NewInterviewModel): InterviewModel {
    return {
      id: Bun.randomUUIDv7(),
      ...payload,
    };
  }

  private prepareNewInterviewComment(
    payload: NewInterviewCommentModel,
    interviewId: string,
  ): InterviewCommentModel {
    return {
      id: Bun.randomUUIDv7(),
      interview_id: interviewId,
      pinned: payload.pinned ?? false,
      ...payload,
    };
  }

  /**
   * Adds a new interview to the database.
   * @param payload - The data for the new interview.
   * @returns A `Result` containing the created interview or an error message.
   */
  async addNewInterview(
    payload: NewInterviewModel,
  ): Promise<Result<InterviewModel, string>> {
    const result = await this.interviewsRepository.addInterview(
      this.prepareNewInterview(payload),
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.INSERT_INTERVIEW);
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
    const result = await this.interviewsRepository.updateInterview(
      interviewId,
      payload,
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.UPDATE_INTERVIEW);
  }

  /**
   * Retrieves an interview by its ID, including its comments.
   * @param interviewId - The ID of the interview to retrieve.
   * @returns A `Result` containing the interview with its comments or an error message.
   */
  async getInterview(
    interviewId: string,
  ): Promise<Result<InterviewWithCommentModel, string>> {
    const result = await this.interviewsRepository.getInterviewById(
      interviewId,
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.FETCH_INTERVIEW);
  }

  /**
   * Adds a new comment to an interview.
   * @param interviewId - The ID of the interview to add the comment to.
   * @param payload - The data for the new comment.
   * @returns A `Result` containing the created comment or an error message.
   */
  async addInterviewComment(
    interviewId: string,
    payload: NewInterviewCommentModel,
  ): Promise<Result<InterviewCommentModel, string>> {
    const result = await this.interviewsRepository.addNewComment(
      this.prepareNewInterviewComment(payload, interviewId),
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.INSERT_COMMENT);
  }

  /**
   * Deletes a comment from an interview.
   * @param interviewId - The ID of the interview the comment belongs to.
   * @param commentId - The ID of the comment to delete.
   * @returns A `Result` indicating success or an error message.
   */
  async deleteInterviewCommentById(
    interviewId: string,
    commentId: string,
  ): Promise<Result<boolean, string>> {
    const result = await this.interviewsRepository.deleteComment(
      interviewId,
      commentId,
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.DELETE_COMMENT);
  }

  /**
   * Updates a comment in an interview.
   * @param commentId - The ID of the comment to update.
   * @param payload - The updated comment data (excluding the `comment_date` property).
   * @returns A `Result` containing the updated comment or an error message.
   */
  async updateInterviewComment(
    commentId: string,
    payload: Omit<NewInterviewCommentModel, "comment_date">,
  ): Promise<Result<InterviewCommentModel, string>> {
    const result = await this.interviewsRepository.updateComment(
      commentId,
      payload,
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.UPDATE_COMMENT);
  }

  /**
   * Handles database errors by logging them and returning a standardized error message.
   * @param result - The result of the database operation.
   * @param errorMessage - The error message to log and return.
   * @returns The original result if successful, or a standardized error result.
   */
  private handleDatabaseError<T>(
    result: Result<T, string>,
    errorMessage: string,
  ): Result<T, string> {
    return result
      .orTee((error) => console.error(`${errorMessage}: ${error}`))
      .mapErr(() => ERROR_MESSAGES.DATABASE_ERROR);
  }
}

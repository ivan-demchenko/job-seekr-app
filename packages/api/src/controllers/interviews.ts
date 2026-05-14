import type {
  InterviewCommentModel,
  InterviewModel,
  InterviewWithCommentModel,
  NewInterviewCommentModel,
  NewInterviewModel,
} from "@job-seekr/data/validation";
import type { Result } from "neverthrow";
import type { DbError } from "../repository/db-error";
import type { InterviewsRepository } from "../repository/interviews";

const ERROR_MESSAGES = {
  INSERT_INTERVIEW: "Failed to insert the interview",
  UPDATE_INTERVIEW: "Failed to update the interview",
  FETCH_INTERVIEW: "Failed to fetch interview",
  INSERT_COMMENT: "Failed to insert comment",
  DELETE_COMMENT: "Failed to delete comment",
  UPDATE_COMMENT: "Failed to update comment",
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
  ): Promise<Result<InterviewModel, DbError>> {
    const result = await this.interviewsRepository.addInterview(
      this.prepareNewInterview(payload),
    );
    return this.handleDbError(result, ERROR_MESSAGES.INSERT_INTERVIEW);
  }

  async updateInterview(
    interviewId: string,
    payload: NewInterviewModel,
  ): Promise<Result<InterviewModel, DbError>> {
    const result = await this.interviewsRepository.updateInterview(
      interviewId,
      payload,
    );
    return this.handleDbError(result, ERROR_MESSAGES.UPDATE_INTERVIEW);
  }

  async getInterview(
    interviewId: string,
  ): Promise<Result<InterviewWithCommentModel, DbError>> {
    const result = await this.interviewsRepository.getInterviewById(
      interviewId,
    );
    return this.handleDbError(result, ERROR_MESSAGES.FETCH_INTERVIEW);
  }

  async addInterviewComment(
    interviewId: string,
    payload: NewInterviewCommentModel,
  ): Promise<Result<InterviewCommentModel, DbError>> {
    const result = await this.interviewsRepository.addNewComment(
      this.prepareNewInterviewComment(payload, interviewId),
    );
    return this.handleDbError(result, ERROR_MESSAGES.INSERT_COMMENT);
  }

  async deleteInterviewCommentById(
    interviewId: string,
    commentId: string,
  ): Promise<Result<boolean, DbError>> {
    const result = await this.interviewsRepository.deleteComment(
      interviewId,
      commentId,
    );
    return this.handleDbError(result, ERROR_MESSAGES.DELETE_COMMENT);
  }

  async updateInterviewComment(
    commentId: string,
    payload: Omit<NewInterviewCommentModel, "comment_date">,
  ): Promise<Result<InterviewCommentModel, DbError>> {
    const result = await this.interviewsRepository.updateComment(
      commentId,
      payload,
    );
    return this.handleDbError(result, ERROR_MESSAGES.UPDATE_COMMENT);
  }

  private handleDbError<T>(
    result: Result<T, DbError>,
    errorMessage: string,
  ): Result<T, DbError> {
    return result.orTee((error) =>
      console.error(`${errorMessage}: ${error.context}`, error.error),
    );
  }
}

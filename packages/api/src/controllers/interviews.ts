import type {
  InterviewCommentModel,
  InterviewModel,
  InterviewWithCommentModel,
  NewInterviewCommentModel,
  NewInterviewModel,
} from "@job-seekr/data/validation";
import type { ResultAsync} from "neverthrow";
import type { AppError } from "../repository/app-error";
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
  addNewInterview(
    payload: NewInterviewModel,
  ): ResultAsync<InterviewModel, AppError<'db-error'>> {
    const result = this.interviewsRepository.addInterview(
      this.prepareNewInterview(payload),
    );
    return this.handleAppError(result, ERROR_MESSAGES.INSERT_INTERVIEW);
  }

  updateInterview(
    interviewId: string,
    payload: NewInterviewModel,
  ): ResultAsync<InterviewModel, AppError<'db-error'>> {
    const result = this.interviewsRepository.updateInterview(
      interviewId,
      payload,
    );
    return this.handleAppError(result, ERROR_MESSAGES.UPDATE_INTERVIEW);
  }

  getInterview(
    interviewId: string,
  ): ResultAsync<InterviewWithCommentModel, AppError<'db-error'>> {
    const result = this.interviewsRepository.getInterviewById(
      interviewId,
    );
    return this.handleAppError(result, ERROR_MESSAGES.FETCH_INTERVIEW);
  }

  addInterviewComment(
    interviewId: string,
    payload: NewInterviewCommentModel,
  ): ResultAsync<InterviewCommentModel, AppError<'db-error'>> {
    const result = this.interviewsRepository.addNewComment(
      this.prepareNewInterviewComment(payload, interviewId),
    );
    return this.handleAppError(result, ERROR_MESSAGES.INSERT_COMMENT);
  }

  deleteInterviewCommentById(
    interviewId: string,
    commentId: string,
  ): ResultAsync<boolean, AppError<'db-error'>> {
    const result = this.interviewsRepository.deleteComment(
      interviewId,
      commentId,
    );
    return this.handleAppError(result, ERROR_MESSAGES.DELETE_COMMENT);
  }

  updateInterviewComment(
    commentId: string,
    payload: Omit<NewInterviewCommentModel, "comment_date">,
  ): ResultAsync<InterviewCommentModel, AppError<'db-error'>> {
    const result = this.interviewsRepository.updateComment(
      commentId,
      payload,
    );
    return this.handleAppError(result, ERROR_MESSAGES.UPDATE_COMMENT);
  }

  private handleAppError<T, E extends AppError<string>>(
    result: ResultAsync<T, E>,
    errorMessage: string,
  ): ResultAsync<T, E> {
    return result.orTee((error) =>
      console.error(`${errorMessage}: ${error.message}`, error.cause),
    );
  }
}

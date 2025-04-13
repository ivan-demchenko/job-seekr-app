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

  async addNewInterview(
    payload: NewInterviewModel,
  ): Promise<Result<InterviewModel, string>> {
    const result = await this.interviewsRepository.addInterview(
      this.prepareNewInterview(payload),
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.INSERT_INTERVIEW);
  }

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

  async getInterview(
    interviewId: string,
  ): Promise<Result<InterviewWithCommentModel, string>> {
    const result = await this.interviewsRepository.getInterviewById(
      interviewId,
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.FETCH_INTERVIEW);
  }

  async addInterviewComment(
    interviewId: string,
    payload: NewInterviewCommentModel,
  ): Promise<Result<InterviewCommentModel, string>> {
    const result = await this.interviewsRepository.addNewComment(
      this.prepareNewInterviewComment(payload, interviewId),
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.INSERT_COMMENT);
  }

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

  private handleDatabaseError<T>(
    result: Result<T, string>,
    errorMessage: string,
  ): Result<T, string> {
    return result
      .orTee((error) => console.error(`${errorMessage}: ${error}`))
      .mapErr(() => ERROR_MESSAGES.DATABASE_ERROR);
  }
}

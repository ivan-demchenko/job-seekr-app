import type { Result } from 'neverthrow';
import type { InterviewsRepository } from '../repository/interviews';
import type { InterviewCommentModel, InterviewModel, InterviewWithCommentModel, NewInterviewCommentModel, NewInterviewModel } from '@job-seekr/data/validation';

export class InterviewsController {
  constructor(private interviewsRepository: InterviewsRepository) {}

  private prepareNewInterview(payload: NewInterviewModel): InterviewModel {
    return {
      id: Bun.randomUUIDv7(),
      ...payload,
    };
  }

  private prepareNewInterviewComment(payload: NewInterviewCommentModel, interviewId: string){
    return {
      id: Bun.randomUUIDv7(),
      interview_id: interviewId,
      ...payload
    }
  }

  async addNewInterview(
    payload: NewInterviewModel,
  ): Promise<Result<InterviewModel, string>> {
    return (
      await this.interviewsRepository.addInterview(
        this.prepareNewInterview(payload),
      )
    )
      .orTee((error) => `Failed to insert the interview: ${error}`)
      .mapErr(() => "Database error");
  }

  async updateInterview(
    interviewId: string,
    payload: NewInterviewModel,
  ): Promise<Result<InterviewModel, string>> {
    return (await this.interviewsRepository
      .updateInterview(interviewId, payload)
    )
      .orTee(error => `Failed to update the interview: ${error}`)
      .mapErr(() => `Database error`);
  }
   
  async getInterview(interviewId: string) : Promise<Result<InterviewWithCommentModel, string>> {
    return (await this.interviewsRepository.getInterviewById(interviewId)).orTee(error => `Failed to fetch interview :${error}`).mapErr(() => `Database`)
  }

  async addInterviewComment(interviewId: string, payload: NewInterviewCommentModel): Promise<Result<InterviewCommentModel, string>> {
    return (await this.interviewsRepository.addNewComment(this.prepareNewInterviewComment(payload, interviewId))).orTee(error => `Failed to insert comment: ${error}`).mapErr(() => `Database error`)
  }

  async deleteInterviewCommentById(interviewId: string, commentId: string) {
    return (await this.interviewsRepository.deleteComment(interviewId, commentId)).orTee(error => console.error(`Failed to delete comment: ${error}`))
      .mapErr(error => `Database error: ${error}`);
  }

  async updateInterviewComment(commentId: string, paylod: Omit<NewInterviewCommentModel, 'comment_date'> ): Promise<Result<InterviewCommentModel, string>> {
    return (await this.interviewsRepository.updateComment(commentId, paylod)).orTee(error => console.error(`Failed to update comment: ${error}`))
      .mapErr(error => `Database error: ${error}`);
  }
}

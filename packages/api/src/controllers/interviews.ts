import type {
  InterviewModel,
  NewInterviewModel,
} from "@job-seekr/data/validation";
import type { Result } from "neverthrow";
import type { InterviewsRepository } from "../repository/interviews";

export class InterviewsController {
  constructor(private interviewsRepository: InterviewsRepository) {}

  private prepareNewInterview(payload: NewInterviewModel): InterviewModel {
    return {
      id: Bun.randomUUIDv7(),
      ...payload,
    };
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
    return (
      await this.interviewsRepository.updateInterview(interviewId, payload)
    )
      .orTee((error) => `Failed to update the interview: ${error}`)
      .mapErr(() => "Database error");
  }
}

import { Err, Ok, type Result } from 'neverthrow';
import { type InterviewsRepository } from '../repository/interviews';
import { interviewInsertSchema, type InterviewModel } from '../../drivers/schemas';

export class InterviewsController {
  constructor(
    private interviewsRepository: InterviewsRepository
  ) { }

  async addNewInterview(
    payload: object
  ): Promise<Result<InterviewModel, string>> {
    const parsedPayload = interviewInsertSchema.safeParse({
      id: Bun.randomUUIDv7(),
      ...payload
    });

    if (!parsedPayload.success) {
      console.error(parsedPayload.error);
      return new Err('Bad request body');
    }

    const result = await this.interviewsRepository.addInterview(parsedPayload.data);
    if (result.isOk()) {
      return new Ok(parsedPayload.data);
    }

    return new Err('Database error: ' + result.error);
  }
}

import { Err, Ok, type Result } from 'neverthrow';
import { InterviewSchema, type InterviewModel } from '../../models/interviews';
import { addInterview } from '../repository/interviews';

export function addNewInterview(payload: object): Result<InterviewModel, string> {
  const parsedPayload = InterviewSchema.safeParse({
    id: Bun.randomUUIDv7(),
    ...payload
  });

  if (!parsedPayload.success) {
    return new Err('Bad request body');
  }

  const result = addInterview(parsedPayload.data);
  if (result.isOk()) {
    return new Ok(parsedPayload.data);
  }

  return new Err('Database error: ' + result.error);
}
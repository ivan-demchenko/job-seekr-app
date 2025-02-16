import { addInterview } from '../repository/interviews';

export function addNewInterview(payload: any) {
  const record = {
    id: Bun.randomUUIDv7(),
    ...payload
  }
  addInterview(record);
  return record;
}
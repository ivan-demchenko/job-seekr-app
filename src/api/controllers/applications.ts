import { Err, Ok, type Result } from 'neverthrow';
import { ApplicationSchema, type ApplicationModel } from '../../models/application';
import * as applicationsRepository from '../repository/applications';

export function getAllApplications() {
  const records = applicationsRepository.getAllApplications();
  if (records.isErr()) {
    console.error(`Failed to fetch all applications: ${records.error}`);
    return [];
  }
  return records.value;
}

export function getById(id: string) {
  const application = applicationsRepository.getApplicationById(id);
  if (application.isErr()) {
    console.error(`Failed to fetch an application: ${application.error}`);
    return null;
  }
  return application.value;
}

export function updateApplication(id: string, command: any) {
  if (command.target === 'status') {
    const application = applicationsRepository.setApplicationStatus(id, command.status);
    if (application.isErr()) {
      console.error(`Failed to update the application: ${application.error}`);
      return 1;
    }
    return 0;
  }
  return 1;
}

export function addNewApplication(payload: object): Result<ApplicationModel, string> {
  const parsedPayload = ApplicationSchema.safeParse({
    id: Bun.randomUUIDv7(),
    status: 'applied',
    application_date: new Date().toISOString(),
    ...payload
  });

  if (!parsedPayload.success) {
    return new Err('Bad request body');
  }

  const result = applicationsRepository.addApplication(parsedPayload.data);
  if (result.isOk()) {
    return new Ok(parsedPayload.data);
  }

  return new Err('Database error: ' + result.error);
}
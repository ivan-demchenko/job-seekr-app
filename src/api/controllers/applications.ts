import { Err, Ok, type Result } from 'neverthrow';
import { type ApplicationsRepository } from '../repository/applications';
import { applicationInsertSchema, type ApplicationSelectModel, type NewApplicationModel } from '../../drivers/schemas';

export class ApplicationsController {
  constructor(
    private applicationsRepository: ApplicationsRepository
  ) { }
  async getAllApplications(userId: string) {
    const records = await this.applicationsRepository.getAllApplications(userId);
    if (records.isErr()) {
      console.error(`Failed to fetch all applications: ${records.error}`);
      return [];
    }
    return records.value;
  }

  async getApplicationById(userId: string, id: string) {
    const application = await this.applicationsRepository.getApplicationById(userId, id);
    if (application.isErr()) {
      console.error(`Failed to fetch an application: ${application.error}`);
      return null;
    }
    return application.value;
  }

  async updateApplication(
    userId: string,
    id: string,
    command: any
  ): Promise<Result<ApplicationSelectModel, string>> {
    if (command.target === 'status') {
      const result = await this.applicationsRepository.setApplicationStatus(userId, id, command.status);
      if (result.isErr()) {
        console.error(`Failed to update the application: ${result.error}`);
        return new Err('Failed to update application');
      }
      return new Ok(result.value);
    }
    if (command.target === 'job_description') {
      const result = await this.applicationsRepository.setApplicationJobDescription(userId, id, command.job_description);
      if (result.isErr()) {
        console.error(`Failed to update the application: ${result.error}`);
        return new Err('Failed to update application');
      }
      return new Ok(result.value);
    }
    return new Err('Unknown command');
  }

  async addNewApplication(
    userId: string,
    payload: object
  ): Promise<Result<ApplicationSelectModel, string>> {
    const parsedPayload = applicationInsertSchema.safeParse({
      id: Bun.randomUUIDv7(),
      status: 'applied',
      user_id: userId,
      ...payload
    });

    if (!parsedPayload.success) {
      return new Err('Bad request body');
    }

    const result = await this.applicationsRepository.addApplication(parsedPayload.data);
    if (result.isOk()) {
      return new Ok(result.value);
    }

    return new Err('Database error: ' + result.error);
  }
}

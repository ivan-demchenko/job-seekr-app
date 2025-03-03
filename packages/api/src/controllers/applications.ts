import type { Result } from 'neverthrow';
import type { ApplicationsRepository } from '../repository/applications';
import type { ApplicationListModel, ApplicationModel, NewApplicationModel } from '@job-seekr/data/validation';
import { z } from 'zod';

export const applicationUpdateCommandSchema = z.discriminatedUnion('target', [
  z.object({ target: z.literal('status'), status: z.string() }),
  z.object({ target: z.literal('job_description'), job_description: z.string() })
]);

type ApplicationUpdateCommand = z.infer<typeof applicationUpdateCommandSchema>;

export class ApplicationsController {
  constructor(
    private applicationsRepository: ApplicationsRepository
  ) { }

  async getAllApplications(
    userId: string
  ): Promise<Result<ApplicationListModel[], string>> {
    return (await this.applicationsRepository.getAllApplications(userId))
      .orTee(error => `Failed to fetch all applications: ${error}`)
      .mapErr(() => `Database error`);
  }

  async getApplicationById(
    userId: string,
    id: string
  ) {
    return (await this.applicationsRepository.getApplicationById(userId, id))
      .orTee(error => `Failed to fetch an application: ${error}`)
      .unwrapOr(null);
  }

  async updateApplication(
    userId: string,
    id: string,
    command: ApplicationUpdateCommand
  ): Promise<Result<ApplicationModel, string>> {
    switch (command.target) {
      case 'status': {
        return (await this.applicationsRepository
          .setApplicationStatus(userId, id, command.status)
        )
          .orTee(error => console.error(`Failed to update the application: ${error}`))
          .mapErr(() => 'Failed to update application')
      }
      case 'job_description': {
        return (await this.applicationsRepository.setApplicationJobDescription(userId, id, command.job_description))
          .orTee(error => console.error(`Failed to update the application: ${error}`))
          .mapErr(() => 'Failed to update application');
      }
    }
  }

  private prepareNewAppication(
    payload: NewApplicationModel,
    userId: string,
  ): ApplicationModel {
    return {
      id: Bun.randomUUIDv7(),
      user_id: userId,
      ...payload
    };
  }

  async addNewApplication(
    userId: string,
    payload: NewApplicationModel
  ): Promise<Result<ApplicationModel, string>> {
    return (await this.applicationsRepository.addApplication(
      this.prepareNewAppication(payload, userId)
    )).mapErr(error => `Database error: ${error}`);
  }

  async deleteUserApplications(
    userId: string
  ) {
    return (await this.applicationsRepository
      .deleteApplications({ _tag: 'of-user', id: userId })
    )
      .orTee(error => console.error(`Failed to update the application: ${error}`))
      .mapErr(error => `Database error: ${error}`);
  }

  async deleteApplicarionById(
    id: string
  ) {
    return (await this.applicationsRepository
      .deleteApplications({ _tag: 'applications', ids: [id] })
    )
      .orTee(error => console.error(`Failed to delete applications: ${error}`))
      .mapErr(error => `Database error: ${error}`);
  }
}

import type {
  ApplicationListModel,
  ApplicationModel,
  NewApplicationModel,
} from "@job-seekr/data/validation";
import type { Result } from "neverthrow";
import type { ApplicationsRepository } from "../repository/applications";
import type { ApplicationResponseDto } from "../dto/application.response.dto";
import type { ApplicationUpdateCommand } from "../dto/application-update.dto";

const ERROR_MESSAGES = {
  FETCH_ALL_APPLICATIONS: "Failed to fetch all applications",
  FETCH_APPLICATION: "Failed to fetch an application",
  UPDATE_APPLICATION: "Failed to update application",
  ADD_APPLICATION: "Failed to add a new application",
  DELETE_APPLICATIONS: "Failed to delete applications",
  DATABASE_ERROR: "Database error",
};

export class ApplicationsController {
  constructor(private applicationsRepository: ApplicationsRepository) {}

  async getAllApplications(
    userId: string,
  ): Promise<Result<ApplicationListModel[], string>> {
    const result = await this.applicationsRepository.getAllApplications(userId);
    return this.handleDatabaseError(result, ERROR_MESSAGES.FETCH_ALL_APPLICATIONS);
  }

  async getApplicationById(
    userId: string,
    id: string,
  ): Promise<ApplicationResponseDto | null> {
    const result = await this.applicationsRepository.getApplicationById(userId, id);
    return result
      .orTee((error) =>
        console.error(`${ERROR_MESSAGES.FETCH_APPLICATION}: ${error}`),
      )
      .unwrapOr(null);
  }

  async updateApplication(
    userId: string,
    id: string,
    command: ApplicationUpdateCommand,
  ): Promise<Result<ApplicationModel, string>> {
    switch (command.target) {
      case "status": {
        const result = await this.applicationsRepository.setApplicationStatus(
          userId,
          id,
          command.status,
        );
        return this.handleDatabaseError(result, ERROR_MESSAGES.UPDATE_APPLICATION);
      }
      case "job_description": {
        const result =
          await this.applicationsRepository.setApplicationJobDescription(
            userId,
            id,
            command.job_description,
          );
        return this.handleDatabaseError(result, ERROR_MESSAGES.UPDATE_APPLICATION);
      }
    }
  }

  private prepareNewApplication(
    payload: NewApplicationModel,
    userId: string,
  ): ApplicationModel {
    return {
      id: Bun.randomUUIDv7(),
      user_id: userId,
      ...payload,
    };
  }

  async addNewApplication(
    userId: string,
    payload: NewApplicationModel,
  ): Promise<Result<ApplicationModel, string>> {
    const result = await this.applicationsRepository.addApplication(
      this.prepareNewApplication(payload, userId),
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.ADD_APPLICATION);
  }

  async deleteUserApplications(userId: string): Promise<Result<boolean, string>> {
    const result = await this.applicationsRepository.deleteUserApplications(userId);
    return this.handleDatabaseError(result, ERROR_MESSAGES.DELETE_APPLICATIONS);
  }

  async deleteApplicationById(id: string): Promise<Result<boolean, string>> {
    const result = await this.applicationsRepository.deleteManyApplications([id]);
    return this.handleDatabaseError(result, ERROR_MESSAGES.DELETE_APPLICATIONS);
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

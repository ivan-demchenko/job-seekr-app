import type {
  ApplicationListModel,
  ApplicationModel,
  NewApplicationModel,
} from "@job-seekr/data/validation";
import type { ResultAsync} from "neverthrow";
import type { ApplicationsRepository } from "../repository/applications";
import type { AppError } from "../repository/app-error";
import type { ApplicationResponseDto } from "../dto/application.response.dto";
import type { ApplicationUpdateCommand } from "../dto/application-update.dto";

const ERROR_MESSAGES = {
  FETCH_ALL_APPLICATIONS: "Failed to fetch all applications",
  FETCH_APPLICATION: "Failed to fetch an application",
  UPDATE_APPLICATION: "Failed to update application",
  ADD_APPLICATION: "Failed to add a new application",
  DELETE_APPLICATIONS: "Failed to delete applications",
};

export class ApplicationsController {
  constructor(private applicationsRepository: ApplicationsRepository) {}

  /**
   * Retrieves all applications for a specific user.
   * @param userId - The ID of the user whose applications are being retrieved.
   * @returns A `Result` containing a list of applications or an error message.
   */
  getAllApplications(
    userId: string,
  ): ResultAsync<ApplicationListModel[], AppError<'db-error'>> {
    const result = this.applicationsRepository.getAllApplications(userId);
    return this.handleAppError(result, ERROR_MESSAGES.FETCH_ALL_APPLICATIONS);
  }

  getApplicationById(
    userId: string,
    id: string,
  ): ResultAsync<ApplicationResponseDto, AppError<'db-error'> | AppError<'not-found'>> {
    const result = this.applicationsRepository.getApplicationById(
      userId,
      id,
    );
    return this.handleAppError(result, ERROR_MESSAGES.FETCH_APPLICATION);
  }

  /**
   * Updates an application based on the provided command.
   * @param userId - The ID of the user who owns the application.
   * @param id - The ID of the application to update.
   * @param command - The update command specifying the target and new value.
   * @returns A `Result` containing the updated application or an error message.
   */
  updateApplication(
    userId: string,
    id: string,
    command: ApplicationUpdateCommand,
  ): ResultAsync<ApplicationModel, AppError<'db-error'>> {
    switch (command.target) {
      case "status": {
        const result = this.applicationsRepository.setApplicationStatus(
          userId,
          id,
          command.status,
        );
        return this.handleAppError(result, ERROR_MESSAGES.UPDATE_APPLICATION);
      }
      case "job_description": {
        const result =
          this.applicationsRepository.setApplicationJobDescription(
            userId,
            id,
            command.job_description,
          );
        return this.handleAppError(result, ERROR_MESSAGES.UPDATE_APPLICATION);
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

  /**
   * Adds a new application for a user.
   * @param userId - The ID of the user who owns the application.
   * @param payload - The data for the new application.
   * @returns A `Result` containing the created application or an error message.
   */
  addNewApplication(
    userId: string,
    payload: NewApplicationModel,
  ): ResultAsync<ApplicationModel, AppError<'db-error'>> {
    const result = this.applicationsRepository.addApplication(
      this.prepareNewApplication(payload, userId),
    );
    return this.handleAppError(result, ERROR_MESSAGES.ADD_APPLICATION);
  }

  deleteUserApplications(
    userId: string,
  ): ResultAsync<boolean, AppError<'db-error'>> {
    const result = this.applicationsRepository.deleteUserApplications(
      userId,
    );
    return this.handleAppError(result, ERROR_MESSAGES.DELETE_APPLICATIONS);
  }

  deleteApplicationById(id: string): ResultAsync<boolean, AppError<'db-error'>> {
    const result = this.applicationsRepository.deleteManyApplications([
      id,
    ]);
    return this.handleAppError(result, ERROR_MESSAGES.DELETE_APPLICATIONS);
  }

  private handleAppError<T, E extends AppError<string>>(
    result: ResultAsync<T, E>,
    errorMessage: string,
  ): ResultAsync<T, E> {
    return result.orTee((error) =>
      console.error(`${errorMessage}: ${error.message}`, error.cause),
    );
  }
}

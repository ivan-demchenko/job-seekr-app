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

  /**
   * Retrieves all applications for a specific user.
   * @param userId - The ID of the user whose applications are being retrieved.
   * @returns A `Result` containing a list of applications or an error message.
   */
  async getAllApplications(
    userId: string,
  ): Promise<Result<ApplicationListModel[], string>> {
    const result = await this.applicationsRepository.getAllApplications(userId);
    return this.handleDatabaseError(result, ERROR_MESSAGES.FETCH_ALL_APPLICATIONS);
  }

  /**
   * Retrieves a specific application by its ID.
   * @param userId - The ID of the user who owns the application.
   * @param id - The ID of the application to retrieve.
   * @returns An `ApplicationResponseDto` object or `null` if not found.
   */
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

  /**
   * Updates an application based on the provided command.
   * @param userId - The ID of the user who owns the application.
   * @param id - The ID of the application to update.
   * @param command - The update command specifying the target and new value.
   * @returns A `Result` containing the updated application or an error message.
   */
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

  /**
   * Adds a new application for a user.
   * @param userId - The ID of the user who owns the application.
   * @param payload - The data for the new application.
   * @returns A `Result` containing the created application or an error message.
   */
  async addNewApplication(
    userId: string,
    payload: NewApplicationModel,
  ): Promise<Result<ApplicationModel, string>> {
    const result = await this.applicationsRepository.addApplication(
      this.prepareNewApplication(payload, userId),
    );
    return this.handleDatabaseError(result, ERROR_MESSAGES.ADD_APPLICATION);
  }

  /**
   * Deletes all applications for a specific user.
   * @param userId - The ID of the user whose applications are being deleted.
   * @returns A `Result` indicating success or an error message.
   */
  async deleteUserApplications(userId: string): Promise<Result<boolean, string>> {
    const result = await this.applicationsRepository.deleteUserApplications(userId);
    return this.handleDatabaseError(result, ERROR_MESSAGES.DELETE_APPLICATIONS);
  }

  /**
   * Deletes a specific application by its ID.
   * @param id - The ID of the application to delete.
   * @returns A `Result` indicating success or an error message.
   */
  async deleteApplicationById(id: string): Promise<Result<boolean, string>> {
    const result = await this.applicationsRepository.deleteManyApplications([id]);
    return this.handleDatabaseError(result, ERROR_MESSAGES.DELETE_APPLICATIONS);
  }

  /**
   * Handles database errors by logging them and returning a standardized error message.
   * @param result - The result of the database operation.
   * @param errorMessage - The error message to log and return.
   * @returns The original result if successful, or a standardized error result.
   */
  private handleDatabaseError<T>(
    result: Result<T, string>,
    errorMessage: string,
  ): Result<T, string> {
    return result
      .orTee((error) => console.error(`${errorMessage}: ${error}`))
      .mapErr(() => ERROR_MESSAGES.DATABASE_ERROR);
  }
}

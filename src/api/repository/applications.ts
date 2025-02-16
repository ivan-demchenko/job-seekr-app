import { Database } from "bun:sqlite";
import { Result, Ok, Err } from 'neverthrow';
import { ApplicationSchema, ApplicationsReadListSchema, type ApplicationModel, type ApplicationsReadListModel } from "../../models/application";
import { ZodError } from "zod";
import { InterviewListSchema, type InterviewListModel } from "../../models/interviews";

const db = new Database("database/data.sqlite");

export function makeTable(): Result<number, string> {
  try {
    const query = db.query(`CREATE TABLE IF NOT EXISTS applications(
      id VARCHAR(36) PRIMARY KEY,
      company TEXT,
      position TEXT,
      job_description TEXT,
      application_date VARCHAR(30),
      status VARCHAR(30)
    )`);
    const changes = query.run().changes;
    return new Ok(changes);
  } catch (e) {
    if (e instanceof Error) {
      return new Err(`Failed to create applications table: ${e.message}`);
    }
    return new Err(`Failed to create applications table: unknown error`);
  }
}

export function getAllApplications(): Result<ApplicationsReadListModel, string> {
  try {
    const data = db.query(`
      SELECT a.id, a.company, a.position, a.application_date, a.status, a.job_description, COUNT(i.id) AS interviewsCount
      FROM applications a
      LEFT JOIN interviews i ON a.id = i.application_id
      GROUP BY i.application_id, a.company;
    `).all();
    const applications = ApplicationsReadListSchema.parse(data);
    return new Ok(applications);
  } catch (e) {
    if (e instanceof ZodError) {
      return new Err(`Received unexpected data from interviews table: ${e.message}`);
    }
    if (e instanceof Error) {
      return new Err(`Failed to read from the applications table: ${e.message}`);
    }
    return new Err(`Failed to read from the applications table: unknown error`);
  }
}

export function getApplicationById(id: string): Result<{
  application: ApplicationModel,
  interviews: InterviewListModel
}, string> {
  try {
    const rawApplication = db.query(`
      SELECT *
      FROM applications
      WHERE id = ?`).get(id);
    const rawInterviews = db.query(`
      SELECT *
      FROM interviews
      WHERE application_id = ?`).all(id);
    const application = ApplicationSchema.parse(rawApplication);
    const interviews = InterviewListSchema.parse(rawInterviews);
    return new Ok({
      application,
      interviews
    });
  } catch (e) {
    if (e instanceof ZodError) {
      return new Err(`Received unexpected data from the database: ${e.message}`);
    }
    if (e instanceof Error) {
      return new Err(`Failed to read from the applications table: ${e.message}`);
    }
    return new Err(`Failed to read from the applications table: unknown error`);
  }
}

export function setApplicationStatus(id: string, newStatus: ApplicationModel['status']): Result<any, string> {
  try {
    const changes = db.query(`
      UPDATE applications SET status = $status WHERE id = $id`
    ).run({
      $status: newStatus,
      $id: id
    }).changes;
    return new Ok({ changes });
  } catch (e) {
    if (e instanceof Error) {
      return new Err(`Failed to update the application: ${e.message}`);
    }
    return new Err(`Failed to update the application: unknown error`);
  }
}

export function addApplication(data: ApplicationModel): Result<number, string> {
  try {
    const query = db.query(`
      INSERT INTO applications (id, company, position, job_description, application_date, status) VALUES
        ($id, $company, $position, $job_description, $application_date, $status)`);
    const changes = query.run({
      $id: data.id,
      $company: data.company,
      $position: data.position,
      $job_description: data.job_description,
      $application_date: data.application_date,
      $status: data.status,
    }).changes;
    return new Ok(changes);
  } catch (e) {
    if (e instanceof Error) {
      return new Err(`Failed to insert into the applications table: ${e.message}`);
    }
    return new Err(`Failed to insert into the applications table: unknown error`);
  }
}
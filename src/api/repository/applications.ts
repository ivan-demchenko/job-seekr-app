import { Database } from "bun:sqlite";
import { Result, Ok, Err } from 'neverthrow';

const db = new Database("data.sqlite");

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

export function getAllApplications(): Result<any[], string> {
  try {
    return new Ok(db.query(`SELECT * FROM applications`).all());
  } catch (e) {
    if (e instanceof Error) {
      return new Err(`Failed to read from the applications table: ${e.message}`);
    }
    return new Err(`Failed to read from the applications table: unknown error`);
  }
}

export function getApplicationById(id: string): Result<any, string> {
  try {
    const application = db.query(`
      SELECT *
      FROM applications
      WHERE id = ?`).get(id);
    const interviews = db.query(`
      SELECT *
      FROM interviews
      WHERE application_id = ?`).all(id);
    return new Ok({
      application,
      interviews
    });
  } catch (e) {
    if (e instanceof Error) {
      return new Err(`Failed to read from the applications table: ${e.message}`);
    }
    return new Err(`Failed to read from the applications table: unknown error`);
  }
}

export function setApplicationStatus(id: string, newStatus: string): Result<any, string> {
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

export function addApplication(data: any): Result<number, string> {
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
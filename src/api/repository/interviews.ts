import { Database } from "bun:sqlite";
import { Result, Ok, Err } from 'neverthrow';

const db = new Database("data.sqlite");

export function makeTable(): Result<number, string> {
  try {
    const query = db.query(`CREATE TABLE interviews(
      id VARCHAR(36) PRIMARY KEY,
      application_id VARCHAR(36),
      interview_date VARCHAR(30),
      topic TEXT,
      participants TEXT,
      FOREIGN KEY(application_id) REFERENCES applications(id)
    )`);
    const changes = query.run().changes;
    return new Ok(changes);
  } catch (e) {
    if (e instanceof Error) {
      return new Err(`Failed to create interviews table: ${e.message}`);
    }
    return new Err(`Failed to create interviews table: unknown error`);
  }
}

export function addInterview(data: any): Result<number, string> {
  const query = db.query(`
    INSERT INTO interviews (id, application_id, interview_date, topic, participants) VALUES
      ($id, $application_id, $interview_date, $topic, $participants)`);
  try {
    const changes = query.run({
      $id: data.id,
      $application_id: data.application_id,
      $interview_date: data.interview_date,
      $topic: data.topic,
      $participants: data.participants,
    }).changes;
    return new Ok(changes);
  } catch (e) {
    if (e instanceof Error) {
      return new Err(`Failed to add an interview: ${e.message}`);
    }
    return new Err(`Failed to add an interview: unknown error`);
  }
}

export function getInterviews(applicationId: string): Result<any, string> {
  try {
    return new Ok(db.query(`SELECT * FROM interviews WHERE application_id = ?`).get(applicationId));
  } catch (e) {
    if (e instanceof Error) {
      return new Err(`Failed to read from the interviews table: ${e.message}`);
    }
    return new Err(`Failed to read from the interviews table: unknown error`);
  }
}
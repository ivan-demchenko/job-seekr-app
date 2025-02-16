import { Database } from "bun:sqlite";
import { Result, Ok, Err } from 'neverthrow';
import { InterviewListSchema, type InterviewListModel, type InterviewModel } from "../../models/interviews";
import { ZodError } from "zod";

const db = new Database("database/data.sqlite");

export function makeTable(): Result<number, string> {
  try {
    const query = db.query(`CREATE TABLE IF NOT EXISTS interviews(
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

export function addInterview(data: InterviewModel): Result<number, string> {
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

export function getInterviews(applicationId: string): Result<InterviewListModel, string> {
  try {
    const rawData = db.query(`SELECT * FROM interviews WHERE application_id = ?`).get(applicationId);
    const parseTest = InterviewListSchema.parse(rawData);
    return new Ok(parseTest);
  } catch (e) {
    if (e instanceof ZodError) {
      return new Err(`Received unexpected data from interviews table: ${e.message}`);
    }
    if (e instanceof Error) {
      return new Err(`Failed to read from the interviews table: ${e.message}`);
    }
    return new Err(`Failed to read from the interviews table: unknown error`);
  }
}
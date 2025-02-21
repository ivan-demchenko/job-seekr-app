import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

export function initDB(dbURL: string) {
  // TODO: connect to either local sqlite or remote db
  const sqlite = new Database(dbURL);
  return drizzle(sqlite);
}
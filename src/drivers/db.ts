import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

export function initDB(dbURL: string) {
  const sqlite = new Database(dbURL);
  return drizzle(sqlite);
}
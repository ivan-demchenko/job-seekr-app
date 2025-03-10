import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";

export function initDB(dbURL: string): NodePgDatabase {
  return drizzle(dbURL);
}

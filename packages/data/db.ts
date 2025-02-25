import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';

export function initDB(dbURL: string): NodePgDatabase {
  return drizzle(dbURL);
}
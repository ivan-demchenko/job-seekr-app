import { drizzle } from 'drizzle-orm/node-postgres';

export function initDB(dbURL: string) {
  return drizzle(dbURL);
}
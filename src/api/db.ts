import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

export function initDB(dbURL: string) {
  return drizzleNeon(neon(dbURL));
}
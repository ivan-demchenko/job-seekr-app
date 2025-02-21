import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { initDB } from "./src/drivers/db";
import { EnvConfig } from './env';

const dbConnection = initDB(EnvConfig.DATABASE_URL);

try {
  migrate(dbConnection, { migrationsFolder: "./drizzle" });
  console.log('Done!')
} catch (e) {
  console.error('Failed: ', e);
}

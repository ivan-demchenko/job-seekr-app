import { EnvConfig } from '@job-seekr/config';
import { initDB } from './db';
import { migrate } from "drizzle-orm/node-postgres/migrator";

const main = async () => {
  const db = initDB(EnvConfig.DATABASE_URL);
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migration completed");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
};

main();
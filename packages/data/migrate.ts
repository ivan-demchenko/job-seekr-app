import { EnvConfig } from "@job-seekr/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { initDB } from "./db";

const main = async () => {
  const db = initDB(EnvConfig.DATABASE_URL);
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migration completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
};

main();

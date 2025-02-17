import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./src/drivers/db";

migrate(db, { migrationsFolder: "./drizzle" });
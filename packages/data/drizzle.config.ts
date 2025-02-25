import { defineConfig } from "drizzle-kit";
import { EnvConfig } from "../config";

export default defineConfig({
  dialect: 'postgresql',
  schema: "./domain/db.schemas.ts",
  dbCredentials: {
    url: EnvConfig.DATABASE_URL
  },
});
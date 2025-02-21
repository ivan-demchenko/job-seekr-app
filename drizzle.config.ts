import { defineConfig } from "drizzle-kit";
import { EnvConfig } from "./env";

export default defineConfig({
  dialect: EnvConfig.HOSTING_MODE === 'selfhost' ? 'sqlite' : 'postgresql',
  schema: "./src/drivers/schemas.ts"
});
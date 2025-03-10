import { EnvConfig } from "@job-seekr/config";
import { app } from "./src/main";

const server = Bun.serve({
  port: EnvConfig.PORT,
  fetch: app.fetch,
});

console.log(`The server has started: ${server.url}`);

import { EnvConfig } from "@job-seekr/config";
import { initDB } from "@job-seekr/data/db";
import { makeAuthMiddleware } from "./auth.middleware";
import { ApplicationsController } from "./controllers/applications";
import { ExportController } from "./controllers/export";
import { InterviewsController } from "./controllers/interviews";
import makeMainRouter from "./main.router";
import { ApplicationsRepository } from "./repository/applications";
import { InterviewsRepository } from "./repository/interviews";

const dbConnection = initDB(EnvConfig.DATABASE_URL);
const applicationsRepository = new ApplicationsRepository(dbConnection);
const interviewsRepository = new InterviewsRepository(dbConnection);

export const app = makeMainRouter(
  makeAuthMiddleware(EnvConfig),
  new ApplicationsController(applicationsRepository),
  new InterviewsController(interviewsRepository),
  new ExportController(applicationsRepository, interviewsRepository),
);

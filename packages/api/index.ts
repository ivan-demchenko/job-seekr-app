import makeMainRouter from './src/main.router';
import { InterviewsController } from './src/controllers/interviews';
import { InterviewsRepository } from './src/repository/interviews';
import { ApplicationsController } from './src/controllers/applications';
import { ApplicationsRepository } from './src/repository/applications';
import { ExportController } from './src/controllers/export';
import { makeAuthMiddleware } from './src/auth.middleware';
import { initDB } from '@job-seekr/data/db';
import { EnvConfig } from '@job-seekr/config';

const dbConnection = initDB(EnvConfig.DATABASE_URL);
const applicationsRepository = new ApplicationsRepository(dbConnection);
const interviewsRepository = new InterviewsRepository(dbConnection);
const api = makeMainRouter(
  makeAuthMiddleware(EnvConfig),
  new ApplicationsController(
    applicationsRepository
  ),
  new InterviewsController(
    interviewsRepository
  ),
  new ExportController(
    applicationsRepository,
    interviewsRepository
  )
)

const server = Bun.serve({
  port: EnvConfig.PORT,
  fetch: api.fetch
});

console.log(`The server has started: ${server.url}`);
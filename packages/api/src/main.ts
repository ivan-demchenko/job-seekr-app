import makeMainRouter from './main.router';
import { InterviewsController } from './controllers/interviews';
import { InterviewsRepository } from './repository/interviews';
import { ApplicationsController } from './controllers/applications';
import { ApplicationsRepository } from './repository/applications';
import { ExportController } from './controllers/export';
import { makeAuthMiddleware } from './auth.middleware';
import { initDB } from '@job-seekr/data/db';
import { EnvConfig } from '@job-seekr/config';

const dbConnection = initDB(EnvConfig.DATABASE_URL);
const applicationsRepository = new ApplicationsRepository(dbConnection);
const interviewsRepository = new InterviewsRepository(dbConnection);

export const app = makeMainRouter(
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
);


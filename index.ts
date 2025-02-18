import indexHtml from './src/frontend/index.html';
import makeApi from './src/api/apiRouter';
import { InterviewsController } from './src/api/controllers/interviews';
import { InterviewsRepository } from './src/api/repository/interviews';
import { ApplicationsController } from './src/api/controllers/applications';
import { ApplicationsRepository } from './src/api/repository/applications';
import { ExportController } from './src/api/controllers/export';
import { initDB } from './src/drivers/db';
import { EnvConfig } from './env';

const dbConnection = initDB(EnvConfig.DATABASE_URL);
const applicationsRepository = new ApplicationsRepository(dbConnection);
const interviewsRepository = new InterviewsRepository(dbConnection);
const api = makeApi(
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

// Use Bun insteaed of Vite or similar...
const server = Bun.serve({
  static: {
    '/': indexHtml,
    '/about': indexHtml,
    '/application': indexHtml,
    '/application/*': indexHtml
  },
  port: EnvConfig.PORT,
  fetch: api.fetch
});

console.log(`The server has started: ${server.url}`);
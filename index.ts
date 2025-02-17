import indexHtml from './src/index.html';
import makeApi from './src/api/apiRouter';
import { InterviewsController } from './src/api/controllers/interviews';
import { InterviewsRepository } from './src/api/repository/interviews';
import { ApplicationsController } from './src/api/controllers/applications';
import { ApplicationsRepository } from './src/api/repository/applications';
import { ExportController } from './src/api/controllers/export';
import { db } from './src/drivers/db';

const applicationsRepository = new ApplicationsRepository(db);
const interviewsRepository = new InterviewsRepository(db);
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

const app = Bun.serve({
  static: {
    '/': indexHtml,
    '/about': indexHtml,
    '/application': indexHtml,
    '/application/*': indexHtml
  },
  fetch: api.fetch
});

console.log(`The server has started: ${app.url}`);
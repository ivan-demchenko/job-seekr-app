import indexHtml from './src/index.html';
import apiRoutes from './src/api/apiRouter';

import { makeTable as makeApplicationsTable } from './src/api/repository/applications';
import { makeTable as makeInterviewsTable } from './src/api/repository/interviews';

const makeApplicationsTableResult = makeApplicationsTable();
if (makeApplicationsTableResult.isErr()) {
  console.log(`Cannot start the app: Failed to make applications table: ${makeApplicationsTableResult.error}`);
}

const makeInterviewsTableResult = makeInterviewsTable();
if (makeInterviewsTableResult.isErr()) {
  console.log(`Cannot start the app: Failed to make interviews table: ${makeInterviewsTableResult.error}`);
}

const app = Bun.serve({
  static: {
    '/': indexHtml,
    '/application': indexHtml,
    '/application/*': indexHtml
  },
  fetch: apiRoutes.fetch
});

console.log(`The server has started: ${app.url}`);
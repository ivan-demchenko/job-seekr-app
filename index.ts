import indexHtml from './src/index.html';
import apiRoutes from './src/api/apiRouter';

import { makeTable } from './src/api/repository/applications';

const makeTableResult = makeTable();
if (makeTableResult.isErr()) {
  console.log(`Cannot start the app: ${makeTableResult.error}`);
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
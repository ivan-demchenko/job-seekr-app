import { Hono } from 'hono';
import { type ApplicationsController } from './controllers/applications';
import { type InterviewsController } from './controllers/interviews';
import { type ExportController } from './controllers/export';
import { logger } from 'hono/logger';

function makeApplicationsRouter(
  applicationsController: ApplicationsController,
) {
  return new Hono()
    .get('/', async (c) => {
      return c.json({ data: await applicationsController.getAllApplications() });
    })
    .post('/', async (c) => {
      const payload = await c.req.json();
      // TODO: separate the REST and DB schemas
      const result = await applicationsController.addNewApplication(payload);
      if (result.isErr()) {
        return c.json({ error: result.error }, 500);
      }
      return c.json({ data: result.value });
    })
    .get('/:id', async (c) => {
      const entry = await applicationsController.getApplicationById(c.req.param('id'));
      if (!entry) {
        return c.json({ error: 'not found' }, 404);
      }
      return c.json({ data: entry });
    })
    .put('/:id', async (c) => {
      // TODO: validate request
      const id = c.req.param('id');
      const command = await c.req.json();
      // TODO: separate the REST and DB schemas
      const result = await applicationsController.updateApplication(id, command);
      if (result.isErr()) {
        return c.json({ error: result.error }, 500);
      }
      return c.json({ data: result.value });
    });
}

function makeInterviewsRouter(
  interviewsController: InterviewsController,
) {
  return new Hono()
    .post('/', async (c) => {
      const payload = await c.req.json();
      // TODO: separate the REST and DB schemas
      const result = await interviewsController.addNewInterview(payload);
      if (result.isErr()) {
        return c.json({ error: result.error }, 500);
      }
      return c.json({ data: result.value });
    });
}

function makeExportsRouter(
  exportController: ExportController
) {
  return new Hono()
    .get('/', async (c) => {
      const res = await exportController.generateReport();
      if (res.isErr()) {
        return c.json({ error: res.error }, 500);
      }
      return c.json({ done: res.value });
    });
}

function makeAPIRoutes(
  app: Hono,
  applicationsController: ApplicationsController,
  interviewsController: InterviewsController,
  exportController: ExportController,
) {
  app.basePath('/api')
    .route('/applications', makeApplicationsRouter(applicationsController))
    .route('/interviews', makeInterviewsRouter(interviewsController))
    .route('/export', makeExportsRouter(exportController));
}

export default function makeApi(
  applicationsController: ApplicationsController,
  interviewsController: InterviewsController,
  exportController: ExportController,
) {
  const app = new Hono();
  app.use(logger())
  app.get('/health', (c) => c.text('ok'));
  makeAPIRoutes(
    app,
    applicationsController,
    interviewsController,
    exportController
  )
  return app;
};
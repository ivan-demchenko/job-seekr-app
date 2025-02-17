import { Hono } from 'hono';
import { type ApplicationsController } from './controllers/applications';
import { type InterviewsController } from './controllers/interviews';
import { type ExportController } from './controllers/export';
import { logger } from 'hono/logger';

function makeAPIRoutes(
  applicationsController: ApplicationsController,
  interviewsController: InterviewsController,
  exportController: ExportController,
) {
  const apiRouter = new Hono();

  apiRouter.get('applications', async (c) => {
    return c.json({ data: await applicationsController.getAllApplications() });
  });

  apiRouter.get('applications/:id', async (c) => {
    const entry = await applicationsController.getApplicationById(c.req.param('id'));
    if (!entry) {
      return c.json({ error: 'not found' }, 404);
    }
    return c.json({ data: entry });
  });

  apiRouter.put('applications/:id', async (c) => {
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

  apiRouter.post('applications', async (c) => {
    const payload = await c.req.json();
    // TODO: separate the REST and DB schemas
    const result = await applicationsController.addNewApplication(payload);
    if (result.isErr()) {
      return c.json({ error: result.error }, 500);
    }
    return c.json({ data: result.value });
  });

  apiRouter.post('interviews', async (c) => {
    const payload = await c.req.json();
    // TODO: separate the REST and DB schemas
    const result = await interviewsController.addNewInterview(payload);
    if (result.isErr()) {
      return c.json({ error: result.error }, 500);
    }
    return c.json({ data: result.value });
  });

  apiRouter.get('export', async (c) => {
    const res = await exportController.generateReport();
    if (res.isErr()) {
      return c.json({ error: res.error }, 500);
    }
    return c.json({ done: res.value });
  });

  return apiRouter;
}

export default function makeApi(
  applicationsController: ApplicationsController,
  interviewsController: InterviewsController,
  exportController: ExportController,
) {
  const app = new Hono();
  app.use(logger())
  app.get('/health', (c) => c.text('ok'));
  app.route('/api', makeAPIRoutes(
    applicationsController,
    interviewsController,
    exportController
  ));
  return app;
};
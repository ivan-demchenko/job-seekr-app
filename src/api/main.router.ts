import { Hono } from 'hono';
import { type ApplicationsController } from './controllers/applications';
import { type InterviewsController } from './controllers/interviews';
import { type ExportController } from './controllers/export';
import { logger } from 'hono/logger';
import { getUser, kindeClient, sessionManager } from './auth.middleware';

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

function makeAuthRouter() {
  return new Hono()
    .get("/login", async (c) => {
      const loginUrl = await kindeClient.login(sessionManager(c));
      return c.redirect(loginUrl.toString());
    })
    .get("/register", async (c) => {
      const registerUrl = await kindeClient.register(sessionManager(c));
      return c.redirect(registerUrl.toString());
    })
    .get("/callback", async (c) => {
      const url = new URL(c.req.url);
      await kindeClient.handleRedirectToApp(sessionManager(c), url);
      return c.redirect("/");
    })
    .get("/logout", async (c) => {
      const logoutUrl = await kindeClient.logout(sessionManager(c));
      return c.redirect(logoutUrl.toString());
    })
    .get("/me", getUser, async (c) => {
      const user = c.var.user;
      return c.json({ user });
    });
}

function makeAPIRoutes(
  app: Hono,
  applicationsController: ApplicationsController,
  interviewsController: InterviewsController,
  exportController: ExportController,
) {
  app.route('/auth', makeAuthRouter())
  app.basePath('/api')
    .use(getUser)
    .route('/applications', makeApplicationsRouter(applicationsController))
    .route('/interviews', makeInterviewsRouter(interviewsController))
    .route('/export', makeExportsRouter(exportController));
}

export default function makeMainRouter(
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
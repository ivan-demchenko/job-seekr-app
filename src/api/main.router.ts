import { Hono } from 'hono';
import { type ApplicationsController } from './controllers/applications';
import { type InterviewsController } from './controllers/interviews';
import { type ExportController } from './controllers/export';
import { logger } from 'hono/logger';
import { type WithAuthMiddleware } from './auth.middleware';
import * as stream from 'hono/streaming'

function makeApplicationsRouter(
  authMiddleware: WithAuthMiddleware,
  applicationsController: ApplicationsController,
) {
  return new Hono()
    .get('/', authMiddleware.middleware, async (c) => {
      return c.json({ data: await applicationsController.getAllApplications(c.var.user.id) });
    })
    .post('/', authMiddleware.middleware, async (c) => {
      const payload = await c.req.json();
      // TODO: separate the REST and DB schemas
      const result = await applicationsController.addNewApplication(c.var.user.id, payload);
      if (result.isErr()) {
        return c.json({ error: result.error }, 500);
      }
      return c.json({ data: result.value });
    })
    .get('/:id', authMiddleware.middleware, async (c) => {
      const entry = await applicationsController.getApplicationById(c.var.user.id, c.req.param('id'));
      if (!entry) {
        return c.json({ error: 'not found' }, 404);
      }
      return c.json({ data: entry });
    })
    .put('/:id', authMiddleware.middleware, async (c) => {
      // TODO: validate request
      const id = c.req.param('id');
      const command = await c.req.json();
      // TODO: separate the REST and DB schemas
      const result = await applicationsController.updateApplication(c.var.user.id, id, command);
      if (result.isErr()) {
        return c.json({ error: result.error }, 500);
      }
      return c.json({ data: result.value });
    });
}

function makeInterviewsRouter(
  authMiddleware: WithAuthMiddleware,
  interviewsController: InterviewsController,
) {
  return new Hono()
    .post('/', authMiddleware.middleware, async (c) => {
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
  authMiddleware: WithAuthMiddleware,
  exportController: ExportController
) {
  return new Hono()
    .get('/', authMiddleware.middleware, async (c) => {
      const res = await exportController.generateReport(c.var.user.id);
      if (res.isErr()) {
        return c.json({ error: res.error }, 500);
      }
      return stream.stream(c, async (stream) => {
        await stream.write(res.value);
      })
    });
}

function makeAuthRouter(
  authMiddleware: WithAuthMiddleware,
) {
  return new Hono()
    .get("/login", async (c) => {
      if (authMiddleware._kind === 'cloud') {
        const { authClient, sessionManager } = authMiddleware;
        const loginUrl = await authClient.login(sessionManager(c));
        return c.redirect(loginUrl.toString());
      }
      return c.redirect('/');
    })
    .get("/register", async (c) => {
      if (authMiddleware._kind === 'cloud') {
        const { authClient, sessionManager } = authMiddleware;
        const registerUrl = await authClient.register(sessionManager(c));
        return c.redirect(registerUrl.toString());
      }
      return c.redirect('/');
    })
    .get("/callback", async (c) => {
      if (authMiddleware._kind === 'cloud') {
        const { authClient, sessionManager } = authMiddleware;
        const url = new URL(c.req.url);
        await authClient.handleRedirectToApp(sessionManager(c), url);
        return c.redirect("/");
      }
      return c.redirect("/");
    })
    .get("/logout", async (c) => {
      if (authMiddleware._kind === 'cloud') {
        const { authClient, sessionManager } = authMiddleware;
        const logoutUrl = await authClient.logout(sessionManager(c));
        return c.redirect(logoutUrl.toString());
      }
      return c.redirect("/");
    })
    .get("/me", authMiddleware.middleware, async (c) => {
      const user = c.var.user;
      return c.json({ user });
    });
}

function makeAPIRoutes(
  app: Hono,
  authMiddleware: WithAuthMiddleware,
  applicationsController: ApplicationsController,
  interviewsController: InterviewsController,
  exportController: ExportController,
) {
  app.route('/auth', makeAuthRouter(authMiddleware))
  app.basePath('/api')
    .route('/applications', makeApplicationsRouter(
      authMiddleware, applicationsController
    ))
    .route('/interviews', makeInterviewsRouter(
      authMiddleware, interviewsController
    ))
    .route('/export', makeExportsRouter(
      authMiddleware, exportController
    ));
}

export default function makeMainRouter(
  authMiddleware: WithAuthMiddleware,
  applicationsController: ApplicationsController,
  interviewsController: InterviewsController,
  exportController: ExportController,
) {
  const app = new Hono();
  app.use(logger())
  app.get('/health', (c) => c.text('ok'));
  makeAPIRoutes(
    app,
    authMiddleware,
    applicationsController,
    interviewsController,
    exportController
  )
  return app;
};
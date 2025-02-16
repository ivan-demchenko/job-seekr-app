import { Hono } from 'hono';
import { getAll, getById, addNewApplication, updateApplication } from './controllers/applications';
import { addNewInterview } from './controllers/interviews';
import { logger } from 'hono/logger';

const apiRouter = new Hono();
apiRouter.get('applications', (c) => c.json({ data: getAll() }));
apiRouter.get('applications/:id', (c) => {
  const entry = getById(c.req.param('id'));
  if (!entry) {
    return c.json({ error: 'not found' }, 404);
  }
  return c.json({ data: entry });
});
apiRouter.put('applications/:id', async (c) => {
  const id = c.req.param('id');
  const command = await c.req.json();
  const result = updateApplication(id, command);
  if (result === 1) {
    return c.json({ error: true }, 500);
  }
  return c.json({ data: { ok: true } });
});
apiRouter.post('applications', async (c) => {
  const payload = await c.req.json();
  const result = addNewApplication(payload);
  if (result.isErr()) {
    return c.json({ error: result.error }, 500);
  }
  return c.json({ data: result.value });
});
apiRouter.post('interviews', async (c) => {
  const payload = await c.req.json();
  const result = addNewInterview(payload);
  if (result.isOk()) {
    return c.json({ data: result.value });
  }
  return c.json({ error: result.error }, 500);
});

const app = new Hono();
app.use(logger())
app.get('/health', (c) => c.text('ok'));
app.route('/api', apiRouter);
export default app;
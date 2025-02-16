import { Hono } from 'hono';
import { getAll, getById, addNewApplication } from './controllers/application';
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
apiRouter.post('applications', async (c) => {
  const payload = await c.req.json();
  const entry = addNewApplication(payload);
  return c.json({ data: entry });
});

const app = new Hono();
app.use(logger())
app.get('/health', (c) => c.text('ok'));
app.route('/api', apiRouter);
export default app;
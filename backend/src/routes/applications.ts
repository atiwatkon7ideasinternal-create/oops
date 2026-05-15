import { Router } from 'express';
import { Application } from '../models/application.js';

export const applicationsRouter = Router();

applicationsRouter.get('/', async (req, res) => {
  const group = typeof req.query['group'] === 'string' ? req.query['group'] : undefined;
  const filter = group ? { group } : {};
  const apps = await Application.find(filter).sort({ appName: 1 });
  res.json({
    apps: apps.map((a) => ({ aid: a.aid, appName: a.appName, group: a.group })),
  });
});

applicationsRouter.get('/groups', async (_req, res) => {
  const groups: string[] = await Application.distinct('group');
  res.json({ groups });
});

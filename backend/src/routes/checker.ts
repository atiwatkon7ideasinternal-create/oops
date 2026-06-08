import { Router } from 'express';
import { calculateEntropy } from '../services/entropy.js';
import { dictionaryCheck } from '../services/dictionary.js';
import { gpuAttack } from '../services/gpu-attack.js';
import { Gpu } from '../models/gpu.js';

export const checkerRouter = Router();

checkerRouter.post('/entropy', (req, res) => {
  const { password } = req.body ?? {};
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'password (string) required' });
  }
  res.json(calculateEntropy(password));
});

checkerRouter.post('/dictionary', async (req, res) => {
  const { password, dicts } = req.body ?? {};
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'password (string) required' });
  }
  const result = await dictionaryCheck(password, Array.isArray(dicts) ? dicts : undefined);
  res.json(result);
});

checkerRouter.post('/gpu-attack', async (req, res) => {
  const { password, gpu } = req.body ?? {};
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'password (string) required' });
  }

  let target = null;
  if (typeof gpu === 'string' && gpu) {
    target = await Gpu.findOne({ gpuName: gpu });
  }
  if (!target) {
    target = await Gpu.findOne().sort({ scryptHashrate: -1 });
  }
  if (!target) {
    return res.status(500).json({ error: 'No GPU configured' });
  }

  res.json(gpuAttack(password, target.gpuName, target.scryptHashrate));
});

checkerRouter.get('/gpus', async (_req, res) => {
  const gpus = await Gpu.find().sort({ brand: 1, scryptHashrate: -1 });
  res.json({
    gpus: gpus.map((g) => ({
      gid: g.gid,
      gpuName: g.gpuName,
      brand: g.brand,
      scryptHashrate: g.scryptHashrate,
      memory: g.memory,
    })),
  });
});

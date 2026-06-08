import { Gpu } from '../models/gpu.js';

interface Seed {
  gpuName: string;
  brand: string;
  scryptHashrate: number; // H/s for scrypt (hashcat -m 8900)
  memory: number;         // GB
}

const SEED: Seed[] = [
  // NVIDIA RTX 50
  { gpuName: 'RTX5090',           brand: 'NVIDIA', scryptHashrate: 7760, memory: 32 },
  { gpuName: 'RTX5080',           brand: 'NVIDIA', scryptHashrate: 5800, memory: 16 },
  { gpuName: 'RTX5070 Ti',        brand: 'NVIDIA', scryptHashrate: 4900, memory: 16 },
  { gpuName: 'RTX5070',           brand: 'NVIDIA', scryptHashrate: 4000, memory: 12 },
  { gpuName: 'RTX5060 Ti',        brand: 'NVIDIA', scryptHashrate: 2900, memory: 16 },
  { gpuName: 'RTX5060',           brand: 'NVIDIA', scryptHashrate: 2300, memory: 8 },

  // NVIDIA RTX 40
  { gpuName: 'RTX4090 Ti',        brand: 'NVIDIA', scryptHashrate: 7800, memory: 24 },
  { gpuName: 'RTX4090',           brand: 'NVIDIA', scryptHashrate: 7126, memory: 24 },
  { gpuName: 'RTX4080 Super',     brand: 'NVIDIA', scryptHashrate: 4500, memory: 16 },
  { gpuName: 'RTX4080',           brand: 'NVIDIA', scryptHashrate: 4251, memory: 16 },
  { gpuName: 'RTX4070 Ti Super',  brand: 'NVIDIA', scryptHashrate: 3700, memory: 16 },
  { gpuName: 'RTX4070 Ti',        brand: 'NVIDIA', scryptHashrate: 3400, memory: 12 },
  { gpuName: 'RTX4070 Super',     brand: 'NVIDIA', scryptHashrate: 3200, memory: 12 },
  { gpuName: 'RTX4070',           brand: 'NVIDIA', scryptHashrate: 2600, memory: 12 },
  { gpuName: 'RTX4060 Ti',        brand: 'NVIDIA', scryptHashrate: 1900, memory: 16 },
  { gpuName: 'RTX4060',           brand: 'NVIDIA', scryptHashrate: 1350, memory: 8 },
  { gpuName: 'RTX4050',           brand: 'NVIDIA', scryptHashrate: 1100, memory: 6 },

  // NVIDIA RTX 30
  { gpuName: 'RTX3090 Ti',        brand: 'NVIDIA', scryptHashrate: 3700, memory: 24 },
  { gpuName: 'RTX3090',           brand: 'NVIDIA', scryptHashrate: 3500, memory: 24 },
  { gpuName: 'RTX3080 Ti',        brand: 'NVIDIA', scryptHashrate: 3400, memory: 12 },
  { gpuName: 'RTX3080',           brand: 'NVIDIA', scryptHashrate: 2750, memory: 10 },
  { gpuName: 'RTX3070 Ti',        brand: 'NVIDIA', scryptHashrate: 2000, memory: 8 },
  { gpuName: 'RTX3070',           brand: 'NVIDIA', scryptHashrate: 1900, memory: 8 },
  { gpuName: 'RTX3060 Ti',        brand: 'NVIDIA', scryptHashrate: 1600, memory: 8 },
  { gpuName: 'RTX3060',           brand: 'NVIDIA', scryptHashrate: 1150, memory: 12 },
  { gpuName: 'RTX3050',           brand: 'NVIDIA', scryptHashrate: 800,  memory: 8 },

  // NVIDIA RTX 20
  { gpuName: 'RTX2080 Ti',        brand: 'NVIDIA', scryptHashrate: 1500, memory: 11 },
  { gpuName: 'RTX2080 Super',     brand: 'NVIDIA', scryptHashrate: 1200, memory: 8 },
  { gpuName: 'RTX2080',           brand: 'NVIDIA', scryptHashrate: 1100, memory: 8 },
  { gpuName: 'RTX2070 Super',     brand: 'NVIDIA', scryptHashrate: 1000, memory: 8 },
  { gpuName: 'RTX2070',           brand: 'NVIDIA', scryptHashrate: 900,  memory: 8 },
  { gpuName: 'RTX2060 Super',     brand: 'NVIDIA', scryptHashrate: 850,  memory: 8 },
  { gpuName: 'RTX2060',           brand: 'NVIDIA', scryptHashrate: 700,  memory: 6 },

  // NVIDIA GTX 16
  { gpuName: 'GTX1660 Ti',        brand: 'NVIDIA', scryptHashrate: 400,  memory: 6 },
  { gpuName: 'GTX1660 Super',     brand: 'NVIDIA', scryptHashrate: 370,  memory: 6 },
  { gpuName: 'GTX1660',           brand: 'NVIDIA', scryptHashrate: 330,  memory: 6 },
  { gpuName: 'GTX1650 Super',     brand: 'NVIDIA', scryptHashrate: 280,  memory: 4 },
  { gpuName: 'GTX1650',           brand: 'NVIDIA', scryptHashrate: 180,  memory: 4 },
  { gpuName: 'GTX1630',           brand: 'NVIDIA', scryptHashrate: 80,   memory: 4 },

  // NVIDIA GTX 10
  { gpuName: 'GTX1080 Ti',        brand: 'NVIDIA', scryptHashrate: 700,  memory: 11 },
  { gpuName: 'GTX1080',           brand: 'NVIDIA', scryptHashrate: 500,  memory: 8 },
  { gpuName: 'GTX1070 Ti',        brand: 'NVIDIA', scryptHashrate: 480,  memory: 8 },
  { gpuName: 'GTX1070',           brand: 'NVIDIA', scryptHashrate: 400,  memory: 8 },
  { gpuName: 'GTX1060 6GB',       brand: 'NVIDIA', scryptHashrate: 250,  memory: 6 },
  { gpuName: 'GTX1060 3GB',       brand: 'NVIDIA', scryptHashrate: 200,  memory: 3 },
  { gpuName: 'GTX1050 Ti',        brand: 'NVIDIA', scryptHashrate: 120,  memory: 4 },
  { gpuName: 'GTX1050',           brand: 'NVIDIA', scryptHashrate: 90,   memory: 2 },

  // NVIDIA GTX 900
  { gpuName: 'GTX980 Ti',         brand: 'NVIDIA', scryptHashrate: 350,  memory: 6 },
  { gpuName: 'GTX980',            brand: 'NVIDIA', scryptHashrate: 240,  memory: 4 },
  { gpuName: 'GTX970',            brand: 'NVIDIA', scryptHashrate: 190,  memory: 4 },
  { gpuName: 'GTX960',            brand: 'NVIDIA', scryptHashrate: 120,  memory: 2 },
  { gpuName: 'GTX950',            brand: 'NVIDIA', scryptHashrate: 90,   memory: 2 },

  // NVIDIA GTX 700
  { gpuName: 'GTX780 Ti',         brand: 'NVIDIA', scryptHashrate: 150,  memory: 3 },
  { gpuName: 'GTX780',            brand: 'NVIDIA', scryptHashrate: 120,  memory: 3 },
  { gpuName: 'GTX770',            brand: 'NVIDIA', scryptHashrate: 80,   memory: 2 },
  { gpuName: 'GTX760',            brand: 'NVIDIA', scryptHashrate: 60,   memory: 2 },
  { gpuName: 'GTX750 Ti',         brand: 'NVIDIA', scryptHashrate: 30,   memory: 2 },
  { gpuName: 'GTX750',            brand: 'NVIDIA', scryptHashrate: 20,   memory: 1 },

  // AMD RX 7000
  { gpuName: 'RX 7900 XTX',       brand: 'AMD',    scryptHashrate: 4500, memory: 24 },
  { gpuName: 'RX 7900 XT',        brand: 'AMD',    scryptHashrate: 3500, memory: 20 },
  { gpuName: 'RX 7800 XT',        brand: 'AMD',    scryptHashrate: 2500, memory: 16 },
  { gpuName: 'RX 7700 XT',        brand: 'AMD',    scryptHashrate: 2000, memory: 12 },
  { gpuName: 'RX 7600',           brand: 'AMD',    scryptHashrate: 1000, memory: 8 },

  // AMD RX 6000
  { gpuName: 'RX 6950 XT',        brand: 'AMD',    scryptHashrate: 3000, memory: 16 },
  { gpuName: 'RX 6900 XT',        brand: 'AMD',    scryptHashrate: 2800, memory: 16 },
  { gpuName: 'RX 6800 XT',        brand: 'AMD',    scryptHashrate: 2300, memory: 16 },
  { gpuName: 'RX 6800',           brand: 'AMD',    scryptHashrate: 2000, memory: 16 },
  { gpuName: 'RX 6700 XT',        brand: 'AMD',    scryptHashrate: 1500, memory: 12 },
  { gpuName: 'RX 6600 XT',        brand: 'AMD',    scryptHashrate: 900,  memory: 8 },
  { gpuName: 'RX 6500 XT',        brand: 'AMD',    scryptHashrate: 400,  memory: 4 },

  // AMD RX 5000
  { gpuName: 'RX 5700 XT',        brand: 'AMD',    scryptHashrate: 900,  memory: 8 },
  { gpuName: 'RX 5700',           brand: 'AMD',    scryptHashrate: 750,  memory: 8 },
  { gpuName: 'RX 5600 XT',        brand: 'AMD',    scryptHashrate: 600,  memory: 6 },
  { gpuName: 'RX 5500 XT',        brand: 'AMD',    scryptHashrate: 400,  memory: 8 },

  // AMD RX 500
  { gpuName: 'RX 590',            brand: 'AMD',    scryptHashrate: 450,  memory: 8 },
  { gpuName: 'RX 580',            brand: 'AMD',    scryptHashrate: 400,  memory: 8 },
  { gpuName: 'RX 570',            brand: 'AMD',    scryptHashrate: 320,  memory: 4 },
  { gpuName: 'RX 560',            brand: 'AMD',    scryptHashrate: 150,  memory: 4 },
  { gpuName: 'RX 550',            brand: 'AMD',    scryptHashrate: 80,   memory: 4 },

  // Intel Arc
  { gpuName: 'Arc A770',          brand: 'Intel',  scryptHashrate: 1000, memory: 16 },
  { gpuName: 'Arc A750',          brand: 'Intel',  scryptHashrate: 800,  memory: 8 },
  { gpuName: 'Arc A580',          brand: 'Intel',  scryptHashrate: 600,  memory: 8 },
  { gpuName: 'Arc A380',          brand: 'Intel',  scryptHashrate: 300,  memory: 6 },
  { gpuName: 'Arc A310',          brand: 'Intel',  scryptHashrate: 200,  memory: 4 },
];

/**
 * Fast-path: skip per-row check if DB already has >= SEED.length docs.
 */
export async function seedGpusIfEmpty(): Promise<void> {
  const count = await Gpu.estimatedDocumentCount();
  if (count >= SEED.length) return;

  const names = SEED.map((s) => s.gpuName);
  const existing = await Gpu.find({ gpuName: { $in: names } }).select('gpuName').lean();
  const present = new Set(existing.map((g) => g.gpuName));
  const toInsert = SEED.filter((s) => !present.has(s.gpuName));
  if (toInsert.length === 0) return;
  await Gpu.insertMany(toInsert, { ordered: false });
  console.log(`🎮 Added ${toInsert.length} new GPU(s) to catalog`);
}

export { SEED as GPU_SEED };

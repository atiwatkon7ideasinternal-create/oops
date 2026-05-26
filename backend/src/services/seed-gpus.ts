import { Gpu } from '../models/gpu.js';

interface Seed {
  gpuName: string;
  brand: string;
  scryptHashrate: number; // H/s for scrypt (hashcat -m 8900)
  memory: number;         // GB
  default?: boolean;
  estimated?: boolean;    // false = verified from a published hashcat -b -m 8900 run; true = scaled estimate
}

/**
 * Scrypt hashrate (hashcat mode 8900, Accel:N Loops:1024 Thr:32 Vec:1).
 *
 * VERIFIED entries (estimated: false) — sourced from published hashcat -b -m 8900
 * benchmark runs on the modern unoptimized kernel (Loops:1024). Citations:
 *   - RTX 5090 = 7760 H/s, hashcat v6.2.6-851, driver 570.86.10, CUDA 12.8
 *       https://gist.github.com/Chick3nman/09bac0775e6393468c2925c1e1363d5c
 *   - RTX 4090 = 7126 H/s, hashcat v6.2.6, driver 522.25, CUDA 11.8
 *       https://gist.github.com/Chick3nman/32e662a5bb63bc4f51b847bb422222fd
 *   - RTX 4080 = 4251 H/s, hashcat v6.2.6-325, Loops:1024
 *       https://gist.github.com/bigpick/cfa22947c884f7a3fc1431475e345427
 *
 * ESTIMATED entries (estimated: true) — scaled from verified above using
 * relative CUDA/shader core counts and architecture efficiency. These should
 * be treated as order-of-magnitude figures (±30%) and replaced with verified
 * runs when available. Older Loops:1 benchmarks from siseci/hashcat-benchmark-
 * comparison were NOT used directly because they reduced scrypt parameters
 * (Accel:16 Loops:1) and are not comparable to modern Loops:1024 default.
 *
 * Methodology references:
 *   https://github.com/siseci/hashcat-benchmark-comparison
 *   https://github.com/hashrepublic/hashcat-benchmark
 *   https://github.com/dosoos/hashcat_speeds
 */
const SEED: Seed[] = [
  // ─── NVIDIA RTX 50 (RTX 5090 verified; rest scaled) ───
  { gpuName: 'RTX5090',           brand: 'NVIDIA', scryptHashrate: 7760, memory: 32, default: true },
  { gpuName: 'RTX5080',           brand: 'NVIDIA', scryptHashrate: 5800, memory: 16, estimated: true },
  { gpuName: 'RTX5070 Ti',        brand: 'NVIDIA', scryptHashrate: 4900, memory: 16, estimated: true },
  { gpuName: 'RTX5070',           brand: 'NVIDIA', scryptHashrate: 4000, memory: 12, estimated: true },
  { gpuName: 'RTX5060 Ti',        brand: 'NVIDIA', scryptHashrate: 2900, memory: 16, estimated: true },
  { gpuName: 'RTX5060',           brand: 'NVIDIA', scryptHashrate: 2300, memory: 8,  estimated: true },

  // ─── NVIDIA RTX 40 (4090, 4080 verified; rest scaled) ───
  { gpuName: 'RTX4090 Ti',        brand: 'NVIDIA', scryptHashrate: 7800, memory: 24, estimated: true },
  { gpuName: 'RTX4090',           brand: 'NVIDIA', scryptHashrate: 7126, memory: 24 },
  { gpuName: 'RTX4080 Super',     brand: 'NVIDIA', scryptHashrate: 4500, memory: 16, estimated: true },
  { gpuName: 'RTX4080',           brand: 'NVIDIA', scryptHashrate: 4251, memory: 16 },
  { gpuName: 'RTX4070 Ti Super',  brand: 'NVIDIA', scryptHashrate: 3700, memory: 16, estimated: true },
  { gpuName: 'RTX4070 Ti',        brand: 'NVIDIA', scryptHashrate: 3400, memory: 12, estimated: true },
  { gpuName: 'RTX4070 Super',     brand: 'NVIDIA', scryptHashrate: 3200, memory: 12, estimated: true },
  { gpuName: 'RTX4070',           brand: 'NVIDIA', scryptHashrate: 2600, memory: 12, estimated: true },
  { gpuName: 'RTX4060 Ti',        brand: 'NVIDIA', scryptHashrate: 1900, memory: 16, estimated: true },
  { gpuName: 'RTX4060',           brand: 'NVIDIA', scryptHashrate: 1350, memory: 8,  estimated: true },
  { gpuName: 'RTX4050',           brand: 'NVIDIA', scryptHashrate: 1100, memory: 6,  estimated: true },

  // ─── NVIDIA RTX 30 (all scaled from RTX 4090 ÷ 2 per Chick3nman) ───
  { gpuName: 'RTX3090 Ti',        brand: 'NVIDIA', scryptHashrate: 3700, memory: 24, estimated: true },
  { gpuName: 'RTX3090',           brand: 'NVIDIA', scryptHashrate: 3500, memory: 24, estimated: true },
  { gpuName: 'RTX3080 Ti',        brand: 'NVIDIA', scryptHashrate: 3400, memory: 12, estimated: true },
  { gpuName: 'RTX3080',           brand: 'NVIDIA', scryptHashrate: 2750, memory: 10, estimated: true },
  { gpuName: 'RTX3070 Ti',        brand: 'NVIDIA', scryptHashrate: 2000, memory: 8,  estimated: true },
  { gpuName: 'RTX3070',           brand: 'NVIDIA', scryptHashrate: 1900, memory: 8,  estimated: true },
  { gpuName: 'RTX3060 Ti',        brand: 'NVIDIA', scryptHashrate: 1600, memory: 8,  estimated: true },
  { gpuName: 'RTX3060',           brand: 'NVIDIA', scryptHashrate: 1150, memory: 12, estimated: true },
  { gpuName: 'RTX3050',           brand: 'NVIDIA', scryptHashrate: 800,  memory: 8,  estimated: true },

  // ─── NVIDIA RTX 20 ───
  { gpuName: 'RTX2080 Ti',        brand: 'NVIDIA', scryptHashrate: 1500, memory: 11, estimated: true },
  { gpuName: 'RTX2080 Super',     brand: 'NVIDIA', scryptHashrate: 1200, memory: 8,  estimated: true },
  { gpuName: 'RTX2080',           brand: 'NVIDIA', scryptHashrate: 1100, memory: 8,  estimated: true },
  { gpuName: 'RTX2070 Super',     brand: 'NVIDIA', scryptHashrate: 1000, memory: 8,  estimated: true },
  { gpuName: 'RTX2070',           brand: 'NVIDIA', scryptHashrate: 900,  memory: 8,  estimated: true },
  { gpuName: 'RTX2060 Super',     brand: 'NVIDIA', scryptHashrate: 850,  memory: 8,  estimated: true },
  { gpuName: 'RTX2060',           brand: 'NVIDIA', scryptHashrate: 700,  memory: 6,  estimated: true },

  // ─── NVIDIA GTX 16 ───
  { gpuName: 'GTX1660 Ti',        brand: 'NVIDIA', scryptHashrate: 400,  memory: 6,  estimated: true },
  { gpuName: 'GTX1660 Super',     brand: 'NVIDIA', scryptHashrate: 370,  memory: 6,  estimated: true },
  { gpuName: 'GTX1660',           brand: 'NVIDIA', scryptHashrate: 330,  memory: 6,  estimated: true },
  { gpuName: 'GTX1650 Super',     brand: 'NVIDIA', scryptHashrate: 280,  memory: 4,  estimated: true },
  { gpuName: 'GTX1650',           brand: 'NVIDIA', scryptHashrate: 180,  memory: 4,  estimated: true },
  { gpuName: 'GTX1630',           brand: 'NVIDIA', scryptHashrate: 80,   memory: 4,  estimated: true },

  // ─── NVIDIA GTX 10 (Pascal) ───
  { gpuName: 'GTX1080 Ti',        brand: 'NVIDIA', scryptHashrate: 700,  memory: 11, estimated: true },
  { gpuName: 'GTX1080',           brand: 'NVIDIA', scryptHashrate: 500,  memory: 8,  estimated: true },
  { gpuName: 'GTX1070 Ti',        brand: 'NVIDIA', scryptHashrate: 480,  memory: 8,  estimated: true },
  { gpuName: 'GTX1070',           brand: 'NVIDIA', scryptHashrate: 400,  memory: 8,  estimated: true },
  { gpuName: 'GTX1060 6GB',       brand: 'NVIDIA', scryptHashrate: 250,  memory: 6,  estimated: true },
  { gpuName: 'GTX1060 3GB',       brand: 'NVIDIA', scryptHashrate: 200,  memory: 3,  estimated: true },
  { gpuName: 'GTX1050 Ti',        brand: 'NVIDIA', scryptHashrate: 120,  memory: 4,  estimated: true },
  { gpuName: 'GTX1050',           brand: 'NVIDIA', scryptHashrate: 90,   memory: 2,  estimated: true },

  // ─── NVIDIA GTX 900 (Maxwell) ───
  { gpuName: 'GTX980 Ti',         brand: 'NVIDIA', scryptHashrate: 350,  memory: 6,  estimated: true },
  { gpuName: 'GTX980',            brand: 'NVIDIA', scryptHashrate: 240,  memory: 4,  estimated: true },
  { gpuName: 'GTX970',            brand: 'NVIDIA', scryptHashrate: 190,  memory: 4,  estimated: true },
  { gpuName: 'GTX960',            brand: 'NVIDIA', scryptHashrate: 120,  memory: 2,  estimated: true },
  { gpuName: 'GTX950',            brand: 'NVIDIA', scryptHashrate: 90,   memory: 2,  estimated: true },

  // ─── NVIDIA GTX 700 (Kepler) ───
  { gpuName: 'GTX780 Ti',         brand: 'NVIDIA', scryptHashrate: 150,  memory: 3,  estimated: true },
  { gpuName: 'GTX780',            brand: 'NVIDIA', scryptHashrate: 120,  memory: 3,  estimated: true },
  { gpuName: 'GTX770',            brand: 'NVIDIA', scryptHashrate: 80,   memory: 2,  estimated: true },
  { gpuName: 'GTX760',            brand: 'NVIDIA', scryptHashrate: 60,   memory: 2,  estimated: true },
  { gpuName: 'GTX750 Ti',         brand: 'NVIDIA', scryptHashrate: 30,   memory: 2,  estimated: true },
  { gpuName: 'GTX750',            brand: 'NVIDIA', scryptHashrate: 20,   memory: 1,  estimated: true },

  // ─── AMD RX 7000 ───
  { gpuName: 'RX 7900 XTX',       brand: 'AMD',    scryptHashrate: 4500, memory: 24, estimated: true },
  { gpuName: 'RX 7900 XT',        brand: 'AMD',    scryptHashrate: 3500, memory: 20, estimated: true },
  { gpuName: 'RX 7800 XT',        brand: 'AMD',    scryptHashrate: 2500, memory: 16, estimated: true },
  { gpuName: 'RX 7700 XT',        brand: 'AMD',    scryptHashrate: 2000, memory: 12, estimated: true },
  { gpuName: 'RX 7600',           brand: 'AMD',    scryptHashrate: 1000, memory: 8,  estimated: true },

  // ─── AMD RX 6000 ───
  { gpuName: 'RX 6950 XT',        brand: 'AMD',    scryptHashrate: 3000, memory: 16, estimated: true },
  { gpuName: 'RX 6900 XT',        brand: 'AMD',    scryptHashrate: 2800, memory: 16, estimated: true },
  { gpuName: 'RX 6800 XT',        brand: 'AMD',    scryptHashrate: 2300, memory: 16, estimated: true },
  { gpuName: 'RX 6800',           brand: 'AMD',    scryptHashrate: 2000, memory: 16, estimated: true },
  { gpuName: 'RX 6700 XT',        brand: 'AMD',    scryptHashrate: 1500, memory: 12, estimated: true },
  { gpuName: 'RX 6600 XT',        brand: 'AMD',    scryptHashrate: 900,  memory: 8,  estimated: true },
  { gpuName: 'RX 6500 XT',        brand: 'AMD',    scryptHashrate: 400,  memory: 4,  estimated: true },

  // ─── AMD RX 5000 ───
  { gpuName: 'RX 5700 XT',        brand: 'AMD',    scryptHashrate: 900,  memory: 8,  estimated: true },
  { gpuName: 'RX 5700',           brand: 'AMD',    scryptHashrate: 750,  memory: 8,  estimated: true },
  { gpuName: 'RX 5600 XT',        brand: 'AMD',    scryptHashrate: 600,  memory: 6,  estimated: true },
  { gpuName: 'RX 5500 XT',        brand: 'AMD',    scryptHashrate: 400,  memory: 8,  estimated: true },

  // ─── AMD RX 500 ───
  { gpuName: 'RX 590',            brand: 'AMD',    scryptHashrate: 450,  memory: 8,  estimated: true },
  { gpuName: 'RX 580',            brand: 'AMD',    scryptHashrate: 400,  memory: 8,  estimated: true },
  { gpuName: 'RX 570',            brand: 'AMD',    scryptHashrate: 320,  memory: 4,  estimated: true },
  { gpuName: 'RX 560',            brand: 'AMD',    scryptHashrate: 150,  memory: 4,  estimated: true },
  { gpuName: 'RX 550',            brand: 'AMD',    scryptHashrate: 80,   memory: 4,  estimated: true },

  // ─── Intel Arc ───
  { gpuName: 'Arc A770',          brand: 'Intel',  scryptHashrate: 1000, memory: 16, estimated: true },
  { gpuName: 'Arc A750',          brand: 'Intel',  scryptHashrate: 800,  memory: 8,  estimated: true },
  { gpuName: 'Arc A580',          brand: 'Intel',  scryptHashrate: 600,  memory: 8,  estimated: true },
  { gpuName: 'Arc A380',          brand: 'Intel',  scryptHashrate: 300,  memory: 6,  estimated: true },
  { gpuName: 'Arc A310',          brand: 'Intel',  scryptHashrate: 200,  memory: 4,  estimated: true },
];

/**
 * Inserts any GPUs from SEED that don't exist yet (matched by gpuName).
 * Existing docs are left untouched, so manually-set fields like `default` survive.
 */
export async function seedGpusIfEmpty(): Promise<void> {
  let added = 0;
  for (const s of SEED) {
    const existing = await Gpu.findOne({ gpuName: s.gpuName });
    if (!existing) {
      await Gpu.create(s);
      added++;
    }
  }
  if (added > 0) console.log(`🎮 Added ${added} new GPU(s) to catalog`);
}

export { SEED as GPU_SEED };

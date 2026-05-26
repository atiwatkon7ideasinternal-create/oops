/**
 * Update existing Gpu docs with new scryptHashrate / memory / estimated
 * from seed-gpus.ts (matched by gpuName). `default` and `gid` are preserved.
 *
 * Run: npx tsx scripts/update-gpu-hashrates.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { Gpu } from '../src/models/gpu.js';
import { GPU_SEED } from '../src/services/seed-gpus.js';

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);

  let updated = 0;
  let created = 0;
  for (const s of GPU_SEED) {
    const existing = await Gpu.findOne({ gpuName: s.gpuName });
    if (existing) {
      existing.scryptHashrate = s.scryptHashrate;
      existing.memory = s.memory;
      existing.brand = s.brand;
      (existing as any).estimated = !!s.estimated;
      await existing.save();
      updated++;
    } else {
      await Gpu.create(s);
      created++;
    }
  }
  console.log(`Updated: ${updated}, Created: ${created}`);

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

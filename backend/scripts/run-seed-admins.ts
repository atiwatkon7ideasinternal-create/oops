import 'dotenv/config';
import mongoose from 'mongoose';
import { seedAdminsIfMissing } from '../src/services/seed-admins.js';

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);
  await seedAdminsIfMissing();
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

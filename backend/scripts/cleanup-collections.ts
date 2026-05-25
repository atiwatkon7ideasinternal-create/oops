/**
 * Drop obsolete collections that no longer match the ER design.
 * Run with:  npx tsx scripts/cleanup-collections.ts
 *
 * Keeps:   users, usersecrets, otpcodes, dictionaries, counters
 * Drops:   applications, gpus, gpuattacklogs, secretandvalues,
 *          secretvaults, systemofusers
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const TO_DROP = [
  'applications',
  'gpus',
  'gpuattacklogs',
  'secretandvalues',
  'secretvaults',
  'systemofusers',
];

const OBSOLETE_COUNTERS = [
  'application',
  'gpu',
  'gpuAttackLog',
  'secretAndValue',
  'secretVault',
  'system',
];

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  const existing = (await db.listCollections().toArray()).map((c) => c.name);

  for (const name of TO_DROP) {
    if (existing.includes(name)) {
      await db.dropCollection(name);
      console.log(`  dropped: ${name}`);
    } else {
      console.log(`  skipped: ${name} (not found)`);
    }
  }

  // Clean up obsolete counter docs
  const counters = db.collection('counters');
  const r = await counters.deleteMany({ _id: { $in: OBSOLETE_COUNTERS as any } });
  console.log(`  removed ${r.deletedCount} obsolete counter docs`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

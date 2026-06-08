/**
 * Strip fields not in ER, rename Role values.
 * Run: npx tsx scripts/migrate-er-strict.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);
  const db = mongoose.connection.db!;

  const u = await db.collection('Usersecret').updateMany(
    { category: { $exists: true } },
    { $unset: { category: '' } },
  );
  console.log(`Usersecret: stripped category from ${u.modifiedCount} docs`);

  const g = await db.collection('Gpu').updateMany(
    { $or: [{ default: { $exists: true } }, { estimated: { $exists: true } }] },
    { $unset: { default: '', estimated: '' } },
  );
  console.log(`Gpu: stripped default/estimated from ${g.modifiedCount} docs`);

  const r1 = await db.collection('User').updateMany({ role: 'member' }, { $set: { role: 'Member' } });
  const r2 = await db.collection('User').updateMany({ role: 'admin' }, { $set: { role: 'Admin' } });
  const r3 = await db.collection('User').updateMany({ role: 'super admin' }, { $set: { role: 'SuperAdmin' } });
  console.log(`User roles renamed: member→Member ${r1.modifiedCount}, admin→Admin ${r2.modifiedCount}, super admin→SuperAdmin ${r3.modifiedCount}`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });

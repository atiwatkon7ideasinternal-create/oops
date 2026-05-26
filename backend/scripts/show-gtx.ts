import 'dotenv/config';
import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);
  const col = mongoose.connection.db!.collection('Gpu');

  const total = await col.countDocuments();
  const gtx = await col.find({ gpuName: /^GTX/ }).toArray();
  const amd5 = await col.find({ gpuName: /^RX 5/ }).toArray();
  const intel = await col.find({ brand: 'Intel' }).toArray();

  console.log(`TOTAL in Gpu collection: ${total}\n`);
  console.log(`GTX (NVIDIA): ${gtx.length}`);
  for (const g of gtx) console.log(`  - ${g.gpuName.padEnd(15)} | ${g.scryptHashrate.toLocaleString().padStart(10)} H/s | ${g.memory}GB`);
  console.log(`\nAMD RX 5xxx: ${amd5.length}`);
  for (const g of amd5) console.log(`  - ${g.gpuName}`);
  console.log(`\nIntel: ${intel.length}`);
  for (const g of intel) console.log(`  - ${g.gpuName}`);

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

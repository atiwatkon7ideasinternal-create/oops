import { User } from '../models/user.js';
import { generateTotpSecret } from './totp.js';
import { hashPassword } from './auth.js';

interface AdminSeed {
  email: string;
  password: string;
  fullName: string;
  role: 'Admin' | 'SuperAdmin';
}

const SEED: AdminSeed[] = [
  { email: 'superoops@gmail.com', password: 'superadmin', fullName: 'Super Admin', role: 'SuperAdmin' },
  { email: 'adminoops1@gmail.com', password: 'admin1', fullName: 'Admin One', role: 'Admin' },
];

export async function seedAdminsIfMissing(): Promise<void> {
  let added = 0;
  for (const s of SEED) {
    const existing = await User.findOne({ email: s.email });
    if (existing) continue;
    await User.create({
      email: s.email,
      fullName: s.fullName,
      password: await hashPassword(s.password),
      otpSecret: generateTotpSecret(),
      role: s.role,
      motpReady: false,
    });
    added++;
  }
  if (added > 0) console.log(`👮 Seeded ${added} admin account(s)`);
}

import { Dictionary } from '../models/dictionary.js';

interface Seed {
  dictname: string;
  dictfile: string;
}

const SEED: Seed[] = [
  { dictname: 'rockyou', dictfile: 'rockyou.txt' },
  { dictname: 'dropbox', dictfile: 'dropbox.txt' },
];

export async function seedDictionariesIfEmpty(): Promise<void> {
  let added = 0;
  for (const s of SEED) {
    const existing = await Dictionary.findOne({ dictname: s.dictname });
    if (existing) continue;
    await Dictionary.create(s);
    added++;
  }
  if (added > 0) console.log(`📖 Seeded ${added} dictionary(s)`);
}

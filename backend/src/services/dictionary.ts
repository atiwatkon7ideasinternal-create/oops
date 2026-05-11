import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cache: Set<string> | null = null;

function loadRockyou(): Set<string> {
  if (cache) return cache;
  const filePath = join(__dirname, '..', 'data', 'rockyou-top.txt');
  const text = readFileSync(filePath, 'utf-8');
  cache = new Set(
    text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  );
  return cache;
}

export function dictionaryCheck(password: string, dicts: string[] = ['rockyou']) {
  const results: Record<string, boolean> = {};
  let foundAny = false;

  if (dicts.includes('rockyou')) {
    const set = loadRockyou();
    const found = set.has(password) || set.has(password.toLowerCase());
    results['rockyou'] = found;
    if (found) foundAny = true;
  }

  return {
    safe: !foundAny,
    leaked: foundAny,
    results,
    dictsChecked: dicts,
  };
}

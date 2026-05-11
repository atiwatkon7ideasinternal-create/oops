/**
 * Shannon entropy: H = L * log2(N)
 * where L = password length, N = size of character pool.
 * Pool sizes (per project spec):
 *   digits     0-9       → 10
 *   lowercase  a-z       → 26
 *   uppercase  A-Z       → 26
 *   special   (printable) → 32
 */
export function calculateEntropy(password: string) {
  let pool = 0;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[^A-Za-z0-9]/.test(password)) pool += 32;

  if (pool === 0 || password.length === 0) {
    return { entropy: 0, level: 'น้อย' as const, safe: false, pool };
  }

  const entropy = Math.round(password.length * Math.log2(pool));

  // Thresholds (from spec): <40 weak, 40-79 medium, >=80 strong
  let level: 'น้อย' | 'ปานกลาง' | 'สูง';
  let safe: boolean;
  if (entropy >= 80) {
    level = 'สูง';
    safe = true;
  } else if (entropy >= 40) {
    level = 'ปานกลาง';
    safe = true;
  } else {
    level = 'น้อย';
    safe = false;
  }

  return { entropy, level, safe, pool };
}

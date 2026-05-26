/**
 * GPU attack crack-time estimate using scrypt hashrate.
 *
 * Calculation steps:
 *   1. Determine character pool size from password composition
 *   2. Worst-case combinations = pool^length (use length/2 on average)
 *   3. Time = combinations / hashrate (H/s)
 */

function poolSize(password: string): number {
  let pool = 0;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[^A-Za-z0-9]/.test(password)) pool += 32;
  return pool;
}

function formatDuration(seconds: number): string {
  if (seconds < 1) return 'น้อยกว่า 1 วินาที';
  if (seconds < 60) return `${Math.round(seconds)} วินาที`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} นาที`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} ชั่วโมง`;
  if (seconds < 31_536_000) return `${Math.round(seconds / 86400)} วัน`;
  const years = seconds / 31_536_000;
  if (years > 1e9) return `${(years / 1e9).toExponential(2)} พันล้านปี`;
  if (years > 1e6) return `${Math.round(years / 1e6)} ล้านปี`;
  return `${Math.round(years)} ปี`;
}

export function gpuAttack(password: string, gpu: string, scryptHashrate: number) {
  if (!password) {
    return { time: '', seconds: 0, safe: false, gpu, rate: scryptHashrate };
  }

  const pool = poolSize(password);
  if (pool === 0) {
    return { time: '0 วินาที', seconds: 0, safe: false, gpu, rate: scryptHashrate };
  }

  const exp = Math.min(password.length, 64);
  const combinations = Math.pow(pool, exp) / 2;
  const seconds = combinations / scryptHashrate;
  const safe = seconds > 3600 * 24 * 365; // > 1 year considered safe

  return {
    time: formatDuration(seconds),
    seconds,
    safe,
    gpu,
    rate: scryptHashrate,
  };
}

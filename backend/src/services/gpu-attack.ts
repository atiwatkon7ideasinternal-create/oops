/**
 * GPU attack crack-time estimate.
 *
 * Assumes brute-force at hashes/sec rate of a given GPU running e.g. MD5 cracking.
 * (Numbers approximate hashcat benchmark figures for popular GPUs cracking
 *  bcrypt / NTLM — actual values vary by hash algorithm; these are middle-ground.)
 */
export const GPU_RATES: Record<string, number> = {
  // hashes per second (rough order-of-magnitude vs. NTLM)
  'NVIDIA RTX5090': 380e9,
  'NVIDIA RTX5080': 240e9,
  'NVIDIA RTX5070': 160e9,
  'NVIDIA RTX5060': 110e9,
  'NVIDIA RTX4090Ti': 300e9,
  'NVIDIA RTX4090': 286e9,
  'NVIDIA RTX4060': 60e9,
  'NVIDIA RTX4050': 38e9,
  'NVIDIA RTX3060': 27e9,
};

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

export function gpuAttack(password: string, gpu: string) {
  if (!password) {
    return { time: '', seconds: 0, safe: false, gpu, rate: 0 };
  }

  const rate = GPU_RATES[gpu] ?? GPU_RATES['NVIDIA RTX4090'];
  const pool = poolSize(password);
  if (pool === 0) {
    return { time: '0 วินาที', seconds: 0, safe: false, gpu, rate };
  }

  // Worst-case combinations: pool^length, average half of that.
  // Cap exponent to avoid Infinity for very long passwords.
  const exp = Math.min(password.length, 64);
  const combinations = Math.pow(pool, exp) / 2;
  const seconds = combinations / rate;

  const safe = seconds > 3600 * 24 * 365; // > 1 year considered safe

  return {
    time: formatDuration(seconds),
    seconds,
    safe,
    gpu,
    rate,
  };
}

export const SUPPORTED_GPUS = Object.keys(GPU_RATES);

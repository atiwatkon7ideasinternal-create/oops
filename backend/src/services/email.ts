export interface EmailService {
  sendOtp(email: string, code: string, purpose: string): Promise<void>;
}

class ConsoleEmailService implements EmailService {
  async sendOtp(email: string, code: string, purpose: string): Promise<void> {
    console.log('───── 📧 Email OTP (console mode) ─────');
    console.log(`  to:      ${email}`);
    console.log(`  purpose: ${purpose}`);
    console.log(`  code:    ${code}  (expires in 5 min)`);
    console.log('───────────────────────────────────────');
  }
}

class ResendEmailService implements EmailService {
  constructor(private apiKey: string, private from: string) {}

  async sendOtp(email: string, code: string, purpose: string): Promise<void> {
    const subject = purpose === 'register'
      ? 'OOPS! — ยืนยันการสมัครสมาชิก'
      : purpose === 'reset_motp'
      ? 'OOPS! — รหัสรีเซ็ต M-OTP'
      : 'OOPS! — รหัส OTP';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: email,
        subject,
        html: `<div style="font-family:sans-serif;padding:24px"><h2>OOPS!</h2><p>รหัส OTP ของคุณคือ:</p><h1 style="letter-spacing:8px;color:#0E47C2">${code}</h1><p>หมดอายุใน 5 นาที</p></div>`,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Resend send failed: ${res.status} ${text}`);
    }
  }
}

let cached: EmailService | null = null;
export function getEmailService(): EmailService {
  if (cached) return cached;
  const provider = process.env.EMAIL_PROVIDER ?? 'console';
  if (provider === 'resend') {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM ?? 'OOPS! <onboarding@resend.dev>';
    if (!key) {
      console.warn('⚠️  RESEND_API_KEY missing — falling back to console mode');
      cached = new ConsoleEmailService();
    } else {
      cached = new ResendEmailService(key, from);
    }
  } else {
    cached = new ConsoleEmailService();
  }
  return cached;
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

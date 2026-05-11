import { authenticator } from 'otplib';
import qrcode from 'qrcode';

authenticator.options = { window: 1, step: 30 };

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function generateOtpAuthUrl(email: string, secret: string): string {
  return authenticator.keyuri(email, 'OOPS!', secret);
}

export async function generateQrDataUrl(otpauthUrl: string): Promise<string> {
  return qrcode.toDataURL(otpauthUrl, { width: 240, margin: 1 });
}

export function verifyTotp(token: string, secret: string): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  try {
    return authenticator.check(token, secret);
  } catch {
    return false;
  }
}

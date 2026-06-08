import { Router } from 'express';
import { User } from '../models/user.js';
import { OtpCode } from '../models/otp.js';
import { Usersecret } from '../models/usersecret.js';
import { generateOtpCode, getEmailService } from '../services/email.js';
import {
  generateTotpSecret,
  generateOtpAuthUrl,
  generateQrDataUrl,
  verifyTotp,
} from '../services/totp.js';
import {
  hashPassword,
  signSession,
  verifyPassword,
} from '../services/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const OTP_TTL_MIN = 5;
const PENDING_TTL_MIN = 30;
const IS_DEV = process.env.NODE_ENV !== 'production';
const EXPOSE_DEV_OTP = IS_DEV && (process.env.EMAIL_PROVIDER ?? 'console') === 'console';

function otpExpiresAt(min = OTP_TTL_MIN): Date {
  return new Date(Date.now() + min * 60 * 1000);
}

// ─── Register: send email OTP, hold pending data ───────────────────────
authRouter.post('/register', async (req, res) => {
  const { fullName, email, phone } = req.body ?? {};
  if (!fullName || !email) {
    return res.status(400).json({ error: 'fullName and email required' });
  }
  const normalized = String(email).toLowerCase();
  if (await User.findOne({ email: normalized })) {
    return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
  }

  await OtpCode.deleteMany({ email: normalized, purpose: 'register', used: false });
  const code = generateOtpCode();
  await OtpCode.create({
    email: normalized,
    code,
    purpose: 'register',
    expiresAt: otpExpiresAt(PENDING_TTL_MIN),
    fullName,
    phone,
    stage: 'email',
  });
  await getEmailService().sendOtp(normalized, code, 'register');
  return res.json({
    ok: true,
    email: normalized,
    ...(EXPOSE_DEV_OTP ? { devOtp: code } : {}),
  });
});

// ─── Verify email OTP → return TOTP QR (no User created yet) ───────────
authRouter.post('/verify-email', async (req, res) => {
  const { email, code } = req.body ?? {};
  if (!email || !code) return res.status(400).json({ error: 'email + code required' });
  const normalized = String(email).toLowerCase();

  const pending = await OtpCode.findOne({
    email: normalized,
    purpose: 'register',
    used: false,
    stage: 'email',
  }).sort({ createdAt: -1 });
  if (!pending) return res.status(400).json({ error: 'ไม่พบคำขอสมัครสมาชิก' });
  if (pending.code !== String(code)) return res.status(400).json({ error: 'รหัส OTP ไม่ถูกต้อง' });
  if (pending.expiresAt < new Date()) return res.status(400).json({ error: 'รหัส OTP หมดอายุ' });

  const otpSecret = generateTotpSecret();
  pending.otpSecret = otpSecret;
  pending.stage = 'totp';
  pending.expiresAt = otpExpiresAt(PENDING_TTL_MIN);
  await pending.save();

  const otpauth = generateOtpAuthUrl(normalized, otpSecret);
  const qr = await generateQrDataUrl(otpauth);
  return res.json({ ok: true, otpauth, qr, secret: otpSecret });
});

// ─── Confirm TOTP → create User row, issue session ────────────────────
authRouter.post('/confirm-totp', async (req, res) => {
  const { email, token } = req.body ?? {};
  if (!email || !token) return res.status(400).json({ error: 'email + token required' });
  const normalized = String(email).toLowerCase();

  const pending = await OtpCode.findOne({
    email: normalized,
    purpose: 'register',
    used: false,
    stage: 'totp',
  }).sort({ createdAt: -1 });
  if (!pending?.otpSecret) {
    return res.status(400).json({ error: 'ยังไม่ได้ยืนยันอีเมล — กรุณาเริ่มต้นใหม่' });
  }
  if (pending.expiresAt < new Date()) {
    return res.status(400).json({ error: 'คำขอหมดอายุ — สมัครใหม่อีกครั้ง' });
  }
  if (!verifyTotp(String(token), pending.otpSecret)) {
    return res.status(400).json({ error: 'รหัส M-OTP ไม่ถูกต้อง' });
  }

  const user = await User.create({
    fullName: pending.fullName!,
    email: normalized,
    phone: pending.phone ?? undefined,
    otpSecret: pending.otpSecret,
    role: 'Member',
  });

  pending.used = true;
  await pending.save();

  const jwt = await signSession({ sub: String(user._id), email: user.email, role: user.role as any });
  return res.json({
    ok: true,
    token: jwt,
    user: { id: user._id, uid: user.uid, email: user.email, fullName: user.fullName, role: user.role },
  });
});

// ─── Login: request email OTP (recovery) ──────────────────────────────
authRouter.post('/login/request-email-otp', async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const normalized = String(email).toLowerCase();
  const user = await User.findOne({ email: normalized });
  if (!user) return res.status(404).json({ error: 'ไม่พบบัญชีอีเมลนี้' });
  if (user.disable) return res.status(403).json({ error: 'บัญชีถูกระงับ' });

  await OtpCode.deleteMany({ email: normalized, purpose: 'login', used: false });
  const code = generateOtpCode();
  await OtpCode.create({
    email: normalized,
    code,
    purpose: 'login',
    expiresAt: otpExpiresAt(),
  });
  await getEmailService().sendOtp(normalized, code, 'login');
  return res.json({ ok: true, ...(EXPOSE_DEV_OTP ? { devOtp: code } : {}) });
});

// ─── Login member (TOTP only) ─────────────────────────────────────────
authRouter.post('/login/member', async (req, res) => {
  const { email, token } = req.body ?? {};
  if (!email || !token) return res.status(400).json({ error: 'email + token required' });
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(404).json({ error: 'ไม่พบบัญชีอีเมลนี้' });
  if (user.disable) return res.status(403).json({ error: 'บัญชีถูกระงับ' });
  if (!verifyTotp(String(token), user.otpSecret)) {
    return res.status(400).json({ error: 'รหัส M-OTP ไม่ถูกต้อง' });
  }

  const jwt = await signSession({ sub: String(user._id), email: user.email, role: user.role as any });
  return res.json({
    ok: true,
    token: jwt,
    user: { id: user._id, uid: user.uid, email: user.email, fullName: user.fullName, role: user.role },
  });
});

// ─── Login admin / super admin (password + TOTP) ──────────────────────
authRouter.post('/login/admin', async (req, res) => {
  const { email, password, token } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email + password required' });
  }
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(404).json({ error: 'ไม่พบบัญชีอีเมลนี้' });
  if (user.disable) return res.status(403).json({ error: 'บัญชีถูกระงับ' });
  if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
    return res.status(403).json({ error: 'ไม่ใช่บัญชี admin' });
  }
  if (!user.password || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  // First-login flow: generate fresh M-OTP secret + QR for the admin to scan
  if (!user.motpReady) {
    const otpSecret = generateTotpSecret();
    user.otpSecret = otpSecret;
    await user.save();
    const otpauth = generateOtpAuthUrl(user.email, otpSecret);
    const qr = await generateQrDataUrl(otpauth);
    return res.json({ firstLogin: true, qr, secret: otpSecret, otpauth });
  }

  if (!token) return res.status(400).json({ error: 'token required' });
  if (!verifyTotp(String(token), user.otpSecret)) {
    return res.status(400).json({ error: 'รหัส M-OTP ไม่ถูกต้อง' });
  }
  const jwt = await signSession({ sub: String(user._id), email: user.email, role: user.role as any });
  return res.json({
    ok: true,
    token: jwt,
    user: { id: user._id, uid: user.uid, email: user.email, fullName: user.fullName, role: user.role },
  });
});

// ─── Admin first-login setup: change password + confirm M-OTP ─────────
authRouter.post('/login/admin/setup', async (req, res) => {
  const { email, currentPassword, newPassword, token } = req.body ?? {};
  if (!email || !currentPassword || !newPassword || !token) {
    return res.status(400).json({ error: 'email + currentPassword + newPassword + token required' });
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร' });
  }
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(404).json({ error: 'ไม่พบบัญชีอีเมลนี้' });
  if (user.disable) return res.status(403).json({ error: 'บัญชีถูกระงับ' });
  if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
    return res.status(403).json({ error: 'ไม่ใช่บัญชี admin' });
  }
  if (user.motpReady) {
    return res.status(400).json({ error: 'บัญชีนี้ตั้ง M-OTP เสร็จแล้ว' });
  }
  if (!user.password || !(await verifyPassword(currentPassword, user.password))) {
    return res.status(401).json({ error: 'รหัสผ่านเดิมไม่ถูกต้อง' });
  }
  if (!verifyTotp(String(token), user.otpSecret)) {
    return res.status(400).json({ error: 'รหัส M-OTP ไม่ถูกต้อง' });
  }

  user.password = await hashPassword(newPassword);
  user.motpReady = true;
  await user.save();

  const jwt = await signSession({ sub: String(user._id), email: user.email, role: user.role as any });
  return res.json({
    ok: true,
    token: jwt,
    user: { id: user._id, uid: user.uid, email: user.email, fullName: user.fullName, role: user.role },
  });
});

// ─── Reset M-OTP ──────────────────────────────────────────────────────
authRouter.post('/reset-motp/request', async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const normalized = String(email).toLowerCase();
  const user = await User.findOne({ email: normalized });
  if (!user) return res.status(404).json({ error: 'ไม่พบบัญชีอีเมลนี้' });

  await OtpCode.deleteMany({ email: normalized, purpose: 'reset_motp', used: false });
  const code = generateOtpCode();
  await OtpCode.create({
    email: normalized,
    code,
    purpose: 'reset_motp',
    expiresAt: otpExpiresAt(),
  });
  await getEmailService().sendOtp(normalized, code, 'reset_motp');
  return res.json({ ok: true, ...(EXPOSE_DEV_OTP ? { devOtp: code } : {}) });
});

authRouter.post('/reset-motp/verify', async (req, res) => {
  const { email, code } = req.body ?? {};
  if (!email || !code) return res.status(400).json({ error: 'email + code required' });
  const normalized = String(email).toLowerCase();
  const otp = await OtpCode.findOne({
    email: normalized,
    purpose: 'reset_motp',
    used: false,
  }).sort({ createdAt: -1 });
  if (!otp || otp.code !== String(code) || otp.expiresAt < new Date()) {
    return res.status(400).json({ error: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ' });
  }
  otp.used = true;
  await otp.save();
  return res.json({ ok: true });
});

authRouter.post('/reset-motp/new', async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(404).json({ error: 'ไม่พบบัญชีอีเมลนี้' });

  user.otpSecret = generateTotpSecret();
  await user.save();

  const otpauth = generateOtpAuthUrl(user.email, user.otpSecret);
  const qr = await generateQrDataUrl(otpauth);
  return res.json({ ok: true, otpauth, qr, secret: user.otpSecret });
});

// ─── /me ──────────────────────────────────────────────────────────────
authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.session!.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    id: user._id,
    uid: user.uid,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    disable: user.disable,
  });
});

// Update name / phone (no email or role here)
authRouter.put('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.session!.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { fullName, phone } = req.body ?? {};
  if (typeof fullName === 'string' && fullName.trim()) user.fullName = fullName.trim();
  if (typeof phone === 'string') user.phone = phone;
  await user.save();
  return res.json({
    ok: true,
    user: { id: user._id, uid: user.uid, email: user.email, fullName: user.fullName, phone: user.phone, role: user.role },
  });
});

// Change-email step 1: verify current M-OTP, generate new secret+QR for the new email
authRouter.post('/me/change-email/start', requireAuth, async (req, res) => {
  const user = await User.findById(req.session!.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { newEmail, currentToken } = req.body ?? {};
  if (!newEmail || !currentToken) {
    return res.status(400).json({ error: 'newEmail + currentToken required' });
  }
  const normalized = String(newEmail).toLowerCase();
  if (normalized === user.email) {
    return res.status(400).json({ error: 'อีเมลใหม่ตรงกับอีเมลเดิม' });
  }
  const taken = await User.findOne({ email: normalized });
  if (taken) return res.status(409).json({ error: 'อีเมลนี้ถูกใช้แล้ว' });
  if (!verifyTotp(String(currentToken), user.otpSecret)) {
    return res.status(400).json({ error: 'M-OTP ปัจจุบันไม่ถูกต้อง' });
  }

  // Stash pending change in OtpCode (we already have email/otpSecret fields)
  await OtpCode.deleteMany({ email: user.email, purpose: 'change_email', used: false });
  const pendingSecret = generateTotpSecret();
  await OtpCode.create({
    email: user.email,
    code: normalized,            // reuse `code` to carry the new email
    purpose: 'change_email',
    expiresAt: otpExpiresAt(PENDING_TTL_MIN),
    otpSecret: pendingSecret,
  });
  const otpauth = generateOtpAuthUrl(normalized, pendingSecret);
  const qr = await generateQrDataUrl(otpauth);
  return res.json({ ok: true, qr, otpauth, secret: pendingSecret, newEmail: normalized });
});

// Change-email step 2: verify new M-OTP, commit
authRouter.post('/me/change-email/confirm', requireAuth, async (req, res) => {
  const user = await User.findById(req.session!.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { token } = req.body ?? {};
  if (!token) return res.status(400).json({ error: 'token required' });

  const pending = await OtpCode.findOne({
    email: user.email,
    purpose: 'change_email',
    used: false,
  }).sort({ createdAt: -1 });
  if (!pending?.otpSecret) return res.status(400).json({ error: 'ไม่พบคำขอเปลี่ยนอีเมล' });
  if (pending.expiresAt < new Date()) return res.status(400).json({ error: 'คำขอหมดอายุ' });
  if (!verifyTotp(String(token), pending.otpSecret)) {
    return res.status(400).json({ error: 'M-OTP ใหม่ไม่ถูกต้อง' });
  }

  const newEmail = pending.code;
  user.email = newEmail;
  user.otpSecret = pending.otpSecret;
  await user.save();
  pending.used = true;
  await pending.save();

  return res.json({
    ok: true,
    user: { id: user._id, uid: user.uid, email: user.email, fullName: user.fullName, phone: user.phone, role: user.role },
  });
});

// Disable / delete account (cascades to Usersecret + OtpCode)
authRouter.delete('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.session!.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'SuperAdmin') {
    return res.status(403).json({ error: 'SuperAdmin ลบไม่ได้' });
  }
  await Usersecret.deleteMany({ uid: user.uid });
  await OtpCode.deleteMany({ email: user.email });
  await User.deleteOne({ _id: user._id });
  return res.json({ ok: true });
});

// ─── Contact admin ────────────────────────────────────────────────────
authRouter.post('/contact-admin', async (req, res) => {
  const { fullName, username, email, phone, address } = req.body ?? {};
  if (!fullName || !email) return res.status(400).json({ error: 'fullName + email required' });
  console.log('───── 📨 Contact admin request ─────');
  console.log({ fullName, username, email, phone, address });
  console.log('────────────────────────────────────');
  return res.json({ ok: true });
});

// ─── Dev seeder ───────────────────────────────────────────────────────
if (IS_DEV) {
  authRouter.post('/_dev/seed-admin', async (req, res) => {
    const { email, password, role } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: 'email + password required' });
    const normalized = String(email).toLowerCase();
    const r = role === 'SuperAdmin' || role === 'superadmin' || role === 'super admin' ? 'SuperAdmin' : 'Admin';
    const passwordHash = await hashPassword(password);
    const otpSecret = generateTotpSecret();
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      existing.role = r;
      existing.password = passwordHash;
      existing.otpSecret = otpSecret;
      await existing.save();
    } else {
      await User.create({
        email: normalized,
        fullName: `${r} user`,
        role: r,
        password: passwordHash,
        otpSecret,
      });
    }
    const otpauth = generateOtpAuthUrl(normalized, otpSecret);
    return res.json({ ok: true, email: normalized, role: r, otpSecret, otpauth });
  });
}

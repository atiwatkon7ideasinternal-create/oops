import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Role = 'Member' | 'Admin' | 'SuperAdmin';

export interface AuthUser {
  id: string;
  uid?: string;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
}

export interface ChangeEmailQrResp {
  ok: true;
  qr: string;
  otpauth: string;
  secret: string;
  newEmail: string;
}

interface TokenResp {
  ok: true;
  token: string;
  user: AuthUser;
}

export interface AdminFirstLoginResp {
  firstLogin: true;
  qr: string;
  secret: string;
  otpauth: string;
}

interface QrResp {
  ok: true;
  otpauth: string;
  qr: string;
  secret: string;
}

interface OtpResp {
  ok: true;
  email?: string;
  devOtp?: string;
}

const STORAGE_KEY = 'oops_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = '/api/auth';

  private _token = signal<string | null>(this.readStoredToken());
  private _user = signal<AuthUser | null>(this.readStoredUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._token() !== null);
  readonly role = computed<Role | null>(() => this._user()?.role ?? null);

  private readStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY + '_token');
  }
  private readStoredUser(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY + '_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
  private persist(token: string, user: AuthUser) {
    localStorage.setItem(STORAGE_KEY + '_token', token);
    localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  // ─── Register ────────────────────────────────────────────────────────
  register(fullName: string, email: string, phone: string) {
    return firstValueFrom(
      this.http.post<OtpResp>(`${this.base}/register`, { fullName, email, phone }),
    );
  }

  verifyEmail(email: string, code: string) {
    return firstValueFrom(this.http.post<QrResp>(`${this.base}/verify-email`, { email, code }));
  }

  // ─── First-time setup: confirm Authenticator ─────────────────────────
  async confirmTotp(email: string, token: string) {
    const res = await firstValueFrom(
      this.http.post<TokenResp>(`${this.base}/confirm-totp`, { email, token }),
    );
    this.persist(res.token, res.user);
    return res;
  }

  // ─── Login ──────────────────────────────────────────────────────────
  requestEmailOtp(email: string) {
    return firstValueFrom(
      this.http.post<OtpResp>(`${this.base}/login/request-email-otp`, { email }),
    );
  }

  async loginMember(email: string, token: string) {
    const res = await firstValueFrom(
      this.http.post<TokenResp>(`${this.base}/login/member`, { email, token }),
    );
    this.persist(res.token, res.user);
    return res;
  }

  async loginAdmin(email: string, password: string, token?: string): Promise<TokenResp | AdminFirstLoginResp> {
    const res = await firstValueFrom(
      this.http.post<TokenResp | AdminFirstLoginResp>(
        `${this.base}/login/admin`,
        { email, password, token: token || undefined },
      ),
    );
    if ('firstLogin' in res && res.firstLogin) return res;
    const ok = res as TokenResp;
    this.persist(ok.token, ok.user);
    return ok;
  }

  async adminSetup(email: string, currentPassword: string, newPassword: string, token: string) {
    const res = await firstValueFrom(
      this.http.post<TokenResp>(`${this.base}/login/admin/setup`, {
        email,
        currentPassword,
        newPassword,
        token,
      }),
    );
    this.persist(res.token, res.user);
    return res;
  }

  // ─── Reset M-OTP ─────────────────────────────────────────────────────
  resetMotpRequest(email: string) {
    return firstValueFrom(
      this.http.post<OtpResp>(`${this.base}/reset-motp/request`, { email }),
    );
  }
  resetMotpVerify(email: string, code: string) {
    return firstValueFrom(
      this.http.post<{ ok: true }>(`${this.base}/reset-motp/verify`, { email, code }),
    );
  }
  resetMotpNew(email: string) {
    return firstValueFrom(this.http.post<QrResp>(`${this.base}/reset-motp/new`, { email }));
  }

  // ─── Contact admin ───────────────────────────────────────────────────
  contactAdmin(data: { fullName: string; username?: string; email: string; phone?: string; address?: string }) {
    return firstValueFrom(this.http.post<{ ok: true }>(`${this.base}/contact-admin`, data));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY + '_token');
    localStorage.removeItem(STORAGE_KEY + '_user');
    this._token.set(null);
    this._user.set(null);
  }

  // ─── Profile ─────────────────────────────────────────────────────────
  async getMe(): Promise<AuthUser> {
    return firstValueFrom(this.http.get<AuthUser>(`${this.base}/me`));
  }

  async updateMe(input: { fullName?: string; phone?: string }): Promise<AuthUser> {
    const res = await firstValueFrom(
      this.http.put<{ ok: true; user: AuthUser }>(`${this.base}/me`, input),
    );
    const cur = this._user();
    if (cur) {
      const merged = { ...cur, ...res.user };
      this._user.set(merged);
      localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(merged));
    }
    return res.user;
  }

  async changeEmailStart(newEmail: string, currentToken: string): Promise<ChangeEmailQrResp> {
    return firstValueFrom(
      this.http.post<ChangeEmailQrResp>(`${this.base}/me/change-email/start`, {
        newEmail,
        currentToken,
      }),
    );
  }

  async changeEmailConfirm(token: string): Promise<AuthUser> {
    const res = await firstValueFrom(
      this.http.post<{ ok: true; user: AuthUser }>(`${this.base}/me/change-email/confirm`, { token }),
    );
    const cur = this._user();
    if (cur) {
      const merged = { ...cur, ...res.user };
      this._user.set(merged);
      localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(merged));
    }
    return res.user;
  }

  async deleteMe(): Promise<void> {
    await firstValueFrom(this.http.delete<{ ok: true }>(`${this.base}/me`));
    this.logout();
  }
}

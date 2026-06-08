import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../data/auth.service';

@Component({
  selector: 'app-admin-setup',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-setup.html',
  styleUrl: './admin-setup.scss',
})
export class AdminSetup implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  currentPassword = signal('');
  qr = signal('');
  secret = signal('');

  newPassword = signal('');
  confirmPassword = signal('');
  token = signal('');

  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const email = sessionStorage.getItem('oops_admin_setup_email');
    const pwd = sessionStorage.getItem('oops_admin_setup_pwd');
    const qr = sessionStorage.getItem('oops_admin_setup_qr');
    const secret = sessionStorage.getItem('oops_admin_setup_secret');
    if (!email || !pwd || !qr || !secret) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.email.set(email);
    this.currentPassword.set(pwd);
    this.qr.set(qr);
    this.secret.set(secret);
  }

  async submit() {
    if (this.loading()) return;
    if (this.newPassword().length < 8) {
      this.error.set('รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.error.set('รหัสผ่านยืนยันไม่ตรงกัน');
      return;
    }
    if (this.token().length !== 6) {
      this.error.set('กรอก M-OTP 6 หลักจาก Google Authenticator');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.auth.adminSetup(
        this.email(),
        this.currentPassword(),
        this.newPassword(),
        this.token(),
      );
      sessionStorage.removeItem('oops_admin_setup_email');
      sessionStorage.removeItem('oops_admin_setup_pwd');
      sessionStorage.removeItem('oops_admin_setup_qr');
      sessionStorage.removeItem('oops_admin_setup_secret');
      this.router.navigateByUrl('/safebox');
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AdminFirstLoginResp } from '../../../data/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  mode = signal<'member' | 'admin'>('member');
  email = signal('');
  password = signal('');
  motp = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  toggleMode() {
    this.mode.set(this.mode() === 'member' ? 'admin' : 'member');
    this.error.set(null);
  }

  async submit() {
    if (!this.email()) {
      this.error.set('กรุณากรอกอีเมล');
      return;
    }
    if (this.mode() === 'admin' && !this.password()) {
      this.error.set('กรุณากรอกรหัสผ่าน');
      return;
    }
    if (this.mode() === 'member' && !this.motp()) {
      this.error.set('กรุณากรอก M-OTP');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      if (this.mode() === 'admin') {
        const res = await this.auth.loginAdmin(this.email(), this.password(), this.motp());
        if ('firstLogin' in res && res.firstLogin) {
          const first = res as AdminFirstLoginResp;
          sessionStorage.setItem('oops_admin_setup_email', this.email());
          sessionStorage.setItem('oops_admin_setup_pwd', this.password());
          sessionStorage.setItem('oops_admin_setup_qr', first.qr);
          sessionStorage.setItem('oops_admin_setup_secret', first.secret);
          this.router.navigateByUrl('/login/admin-setup');
          return;
        }
      } else {
        await this.auth.loginMember(this.email(), this.motp());
      }
      this.router.navigateByUrl('/safebox');
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../data/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);
  loading = signal(false);
  error = signal<string | null>(null);

  async submit(form: NgForm) {
    if (this.loading()) return;
    const { fullName, email, phone } = form.value;
    if (!fullName || !email) {
      this.error.set('กรุณากรอกชื่อและอีเมล');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.auth.register(fullName, email, phone ?? '');
      sessionStorage.setItem('oops_flow_email', email);
      if (res.devOtp) sessionStorage.setItem('oops_dev_otp', res.devOtp);
      this.router.navigateByUrl('/register/email-otp');
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }
}

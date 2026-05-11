import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../data/auth.service';

@Component({
  selector: 'app-reset-email',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-email.html',
  styleUrl: './reset-email.scss',
})
export class ResetEmail {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  async submit() {
    if (!this.email()) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.auth.resetMotpRequest(this.email());
      sessionStorage.setItem('oops_flow_email', this.email());
      if (res.devOtp) sessionStorage.setItem('oops_dev_otp', res.devOtp);
      this.router.navigateByUrl('/reset/otp');
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }
}

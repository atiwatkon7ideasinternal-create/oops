import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../data/auth.service';

@Component({
  selector: 'app-contact-admin',
  imports: [FormsModule],
  templateUrl: './contact-admin.html',
  styleUrl: './contact-admin.scss',
})
export class ContactAdmin {
  private auth = inject(AuthService);
  private router = inject(Router);
  loading = signal(false);
  error = signal<string | null>(null);
  sent = signal(false);

  async submit(f: NgForm) {
    if (this.loading()) return;
    const { name, username, email, phone, address } = f.value;
    if (!name || !email) {
      this.error.set('Full Name + Email จำเป็น');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.auth.contactAdmin({ fullName: name, username, email, phone, address });
      this.sent.set(true);
      setTimeout(() => this.router.navigateByUrl('/'), 1500);
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }
}

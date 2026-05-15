import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderApp } from '../../../shared/header-app/header-app';
import { VaultService } from '../../../data/vault.service';

@Component({
  selector: 'app-safebox-add',
  imports: [FormsModule, HeaderApp],
  templateUrl: './add.html',
  styleUrl: './add.scss',
})
export class Add implements OnInit {
  private route = inject(ActivatedRoute);
  private vault = inject(VaultService);
  private router = inject(Router);

  prefilledName = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const app = this.route.snapshot.queryParamMap.get('app');
    if (app) this.prefilledName.set(app);
  }

  back() { history.back(); }

  async save(f: NgForm) {
    if (this.loading()) return;
    const { systemName, username, password, pin, other } = f.value;
    if (!systemName) {
      this.error.set('กรุณากรอกชื่อระบบ');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.vault.create({
        systemName,
        secrets: { username, password, pin, other },
      });
      this.router.navigate(['/safebox/all']);
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }
}

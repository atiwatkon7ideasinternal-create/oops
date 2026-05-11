import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderPublic } from '../../../shared/header-public/header-public';
import { CheckerService, EntropyResult } from '../../../data/checker.service';

@Component({
  selector: 'app-entropy',
  imports: [FormsModule, HeaderPublic],
  templateUrl: './entropy.html',
  styleUrl: './entropy.scss',
})
export class Entropy {
  private checker = inject(CheckerService);
  password = signal('');
  result = signal<EntropyResult | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  async check() {
    if (!this.password()) {
      this.result.set(null);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.checker.entropy(this.password());
      this.result.set(res);
    } catch (e: any) {
      this.error.set(e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }
}

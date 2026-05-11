import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderPublic } from '../../../shared/header-public/header-public';
import { CheckerService, GpuAttackResult } from '../../../data/checker.service';

@Component({
  selector: 'app-gpu-attack',
  imports: [FormsModule, HeaderPublic],
  templateUrl: './gpu-attack.html',
  styleUrl: './gpu-attack.scss',
})
export class GpuAttack {
  private checker = inject(CheckerService);
  password = signal('');
  gpu = signal('NVIDIA RTX5090');
  result = signal<GpuAttackResult | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  gpus = [
    'NVIDIA RTX5090',
    'NVIDIA RTX5080',
    'NVIDIA RTX5070',
    'NVIDIA RTX5060',
    'NVIDIA RTX4090Ti',
    'NVIDIA RTX4060',
    'NVIDIA RTX4050',
    'NVIDIA RTX3060',
  ];

  async check() {
    if (!this.password()) {
      this.result.set(null);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.checker.gpuAttack(this.password(), this.gpu());
      this.result.set(res);
    } catch (e: any) {
      this.error.set(e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }
}

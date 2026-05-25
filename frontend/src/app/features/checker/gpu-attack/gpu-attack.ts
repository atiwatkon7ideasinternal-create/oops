import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderPublic } from '../../../shared/header-public/header-public';
import { CheckerService, GpuAttackResult } from '../../../data/checker.service';

@Component({
  selector: 'app-gpu-attack',
  imports: [FormsModule, HeaderPublic],
  templateUrl: './gpu-attack.html',
  styleUrl: './gpu-attack.scss',
})
export class GpuAttack implements OnInit {
  private checker = inject(CheckerService);
  password = signal('');
  gpu = signal('');
  gpus = signal<string[]>([]);
  result = signal<GpuAttackResult | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  async ngOnInit() {
    try {
      const list = await this.checker.listGpus();
      this.gpus.set(list);
      if (list.length > 0 && !this.gpu()) {
        this.gpu.set(list[0]);
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'ดึงรายชื่อ GPU ไม่ได้');
    }
  }

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

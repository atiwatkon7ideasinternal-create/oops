import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface EntropyResult {
  entropy: number;
  level: 'น้อย' | 'ปานกลาง' | 'สูง';
  safe: boolean;
  pool: number;
}

export interface DictionaryResult {
  safe: boolean;
  leaked: boolean;
  results: Record<string, boolean>;
  dictsChecked: string[];
}

export interface GpuAttackResult {
  time: string;
  seconds: number;
  safe: boolean;
  gpu: string;
  rate: number;
}

export interface GpuOption {
  gid: number;
  gpuName: string;
  brand: string;
  scryptHashrate: number;
  memory: number;
  default: boolean;
}

@Injectable({ providedIn: 'root' })
export class CheckerService {
  private http = inject(HttpClient);
  private base = '/api/checker';

  entropy(password: string) {
    return firstValueFrom(this.http.post<EntropyResult>(`${this.base}/entropy`, { password }));
  }

  dictionary(password: string, dicts: string[] = ['rockyou']) {
    return firstValueFrom(
      this.http.post<DictionaryResult>(`${this.base}/dictionary`, { password, dicts }),
    );
  }

  gpuAttack(password: string, gpu: string) {
    return firstValueFrom(
      this.http.post<GpuAttackResult>(`${this.base}/gpu-attack`, { password, gpu }),
    );
  }

  async listGpus(): Promise<GpuOption[]> {
    const res = await firstValueFrom(
      this.http.get<{ gpus: GpuOption[] }>(`${this.base}/gpus`),
    );
    return res.gpus;
  }
}

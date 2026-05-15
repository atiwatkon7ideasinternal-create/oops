import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppEntry {
  aid: string;
  appName: string;
  group: string;
}

@Injectable({ providedIn: 'root' })
export class AppsService {
  private http = inject(HttpClient);
  private base = '/api/applications';

  async list(group?: string): Promise<AppEntry[]> {
    const url = group ? `${this.base}?group=${encodeURIComponent(group)}` : this.base;
    const res = await firstValueFrom(this.http.get<{ apps: AppEntry[] }>(url));
    return res.apps;
  }

  async listGroups(): Promise<string[]> {
    const res = await firstValueFrom(this.http.get<{ groups: string[] }>(`${this.base}/groups`));
    return res.groups;
  }
}

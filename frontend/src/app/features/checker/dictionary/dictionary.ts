import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderPublic } from '../../../shared/header-public/header-public';
import { CheckerService } from '../../../data/checker.service';
import { HibpService } from '../../../data/hibp.service';

interface PerDictResult {
  id: string;
  label: string;
  pwned: boolean;
  count?: number;
}

@Component({
  selector: 'app-dictionary',
  imports: [FormsModule, HeaderPublic],
  templateUrl: './dictionary.html',
  styleUrl: './dictionary.scss',
})
export class Dictionary {
  private checker = inject(CheckerService);
  private hibp = inject(HibpService);

  password = signal('');
  selected = signal<string[]>(['rockyou', 'hibp']);
  results = signal<PerDictResult[] | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  dicts = [
    { id: 'rockyou', label: 'Rockyou.txt' },
    { id: 'dropbox', label: 'Dropbox' },
    { id: 'hibp', label: 'HIBP API' },
  ];

  toggle(id: string) {
    const cur = this.selected();
    if (cur.includes(id)) {
      if (cur.length > 1) this.selected.set(cur.filter((n) => n !== id));
    } else {
      this.selected.set([...cur, id]);
    }
  }

  anyPwned() {
    const r = this.results();
    return !!r && r.some((x) => x.pwned);
  }

  async check() {
    if (!this.password()) {
      this.results.set(null);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const out: PerDictResult[] = [];
      const dbDicts = this.selected().filter((id) => id !== 'hibp');
      if (dbDicts.length > 0) {
        const res = await this.checker.dictionary(this.password(), dbDicts);
        for (const id of dbDicts) {
          const label = this.dicts.find((d) => d.id === id)?.label ?? id;
          out.push({ id, label, pwned: !!res.results[id] });
        }
      }
      if (this.selected().includes('hibp')) {
        const h = await this.hibp.check(this.password());
        out.push({ id: 'hibp', label: 'HIBP API', pwned: h.pwned, count: h.count });
      }
      this.results.set(out);
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }
}

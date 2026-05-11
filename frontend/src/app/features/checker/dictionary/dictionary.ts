import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderPublic } from '../../../shared/header-public/header-public';
import { CheckerService, DictionaryResult } from '../../../data/checker.service';

@Component({
  selector: 'app-dictionary',
  imports: [FormsModule, HeaderPublic],
  templateUrl: './dictionary.html',
  styleUrl: './dictionary.scss',
})
export class Dictionary {
  private checker = inject(CheckerService);
  password = signal('');
  selected = signal<string[]>(['rockyou']);
  result = signal<DictionaryResult | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  dicts = [
    { id: 'rockyou', label: 'Rockyou.txt' },
  ];

  toggle(id: string) {
    const cur = this.selected();
    if (cur.includes(id)) {
      if (cur.length > 1) this.selected.set(cur.filter((n) => n !== id));
    } else {
      this.selected.set([...cur, id]);
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
      const res = await this.checker.dictionary(this.password(), this.selected());
      this.result.set(res);
    } catch (e: any) {
      this.error.set(e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }
}

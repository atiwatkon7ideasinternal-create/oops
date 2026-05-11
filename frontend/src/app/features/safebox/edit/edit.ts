import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderApp } from '../../../shared/header-app/header-app';
import { VaultService, DecryptedEntry } from '../../../data/vault.service';
import { resizeToDataUrl } from '../../../data/image.util';

@Component({
  selector: 'app-safebox-edit',
  imports: [FormsModule, HeaderApp],
  templateUrl: './edit.html',
  styleUrl: './edit.scss',
})
export class Edit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vault = inject(VaultService);

  entry = signal<DecryptedEntry | null>(null);
  loading = signal(true);
  saving = signal(false);
  imageLoading = signal(false);
  error = signal<string | null>(null);

  // Bound form values (mirror entry.secrets but mutable)
  systemName = signal('');
  username = signal('');
  password = signal('');
  pin = signal('');
  other = signal('');
  imageDataUrl = signal<string | null>(null);
  imageChanged = signal(false);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No id');
      this.loading.set(false);
      return;
    }
    try {
      const e = await this.vault.get(id);
      this.entry.set(e);
      this.systemName.set(e.systemName);
      this.username.set(e.secrets.username ?? '');
      this.password.set(e.secrets.password ?? '');
      this.pin.set(e.secrets.pin ?? '');
      this.other.set(e.secrets.other ?? '');
      this.imageDataUrl.set(e.imageDataUrl ?? null);
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }

  back() { history.back(); }

  async onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error.set('กรุณาเลือกไฟล์รูป');
      return;
    }
    this.imageLoading.set(true);
    this.error.set(null);
    try {
      const url = await resizeToDataUrl(file, 128, 'image/png');
      this.imageDataUrl.set(url);
      this.imageChanged.set(true);
    } catch (e: any) {
      this.error.set('โหลดรูปไม่สำเร็จ: ' + (e?.message ?? ''));
    } finally {
      this.imageLoading.set(false);
      input.value = '';
    }
  }

  clearImage() {
    this.imageDataUrl.set(null);
    this.imageChanged.set(true);
  }

  async save() {
    const cur = this.entry();
    if (!cur || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      const payload: any = {
        systemName: this.systemName(),
        category: cur.category,
        secrets: {
          username: this.username(),
          password: this.password(),
          pin: this.pin(),
          other: this.other(),
        },
      };
      if (this.imageChanged()) {
        payload.imageDataUrl = this.imageDataUrl() ?? null;
      }
      await this.vault.update(cur.id, payload);
      this.router.navigate(['/safebox', cur.category]);
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.saving.set(false);
    }
  }

  async remove() {
    const cur = this.entry();
    if (!cur) return;
    if (!confirm(`ลบรายการ "${cur.systemName}"?`)) return;
    this.saving.set(true);
    try {
      await this.vault.delete(cur.id);
      this.router.navigate(['/safebox', cur.category]);
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
      this.saving.set(false);
    }
  }
}

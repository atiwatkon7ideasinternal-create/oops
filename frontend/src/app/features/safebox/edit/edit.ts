import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderApp } from '../../../shared/header-app/header-app';
import { VaultService, VaultEntry, SAFEBOX_CATEGORIES } from '../../../data/vault.service';
import { resizeToDataUrl } from '../../../data/image.util';
import { aesEncrypt, AesPackedParts } from '../../../data/aes.util';

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

  entry = signal<VaultEntry | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  systemName = signal('');
  secretName = signal('');
  secretDescription = signal('');
  category = signal<string>('อื่นๆ');
  picture = signal('');
  categories = SAFEBOX_CATEGORIES;
  username = signal('');
  other = signal('');

  // encryption panel state
  encPass = signal('');
  encPlain = signal('');
  encResult = signal<AesPackedParts | null>(null);
  encError = signal<string | null>(null);
  encryptedBlob = signal('');

  hasSavedBlob = computed(() => this.entry()?.secrets.encryptedBlob && this.entry()!.secrets.encryptedBlob!.length > 0);

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
      this.secretName.set(e.secretName);
      this.secretDescription.set(e.secretDescription);
      this.category.set(e.category || 'อื่นๆ');
      this.picture.set(e.picture);
      this.username.set(e.secrets.username ?? '');
      this.other.set(e.secrets.other ?? '');
      this.encryptedBlob.set(e.secrets.encryptedBlob ?? '');
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }

  back() { history.back(); }

  async onPictureSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error.set('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    try {
      this.picture.set(await resizeToDataUrl(file, 256));
      this.error.set(null);
    } catch (e: any) {
      this.error.set(e?.message ?? 'อ่านรูปไม่สำเร็จ');
    }
  }

  async runEncrypt() {
    this.encError.set(null);
    if (!this.encPass() || !this.encPlain()) {
      this.encError.set('กรุณากรอก Passphrase และข้อมูลที่จะเข้ารหัส');
      return;
    }
    try {
      const res = await aesEncrypt(this.encPass(), this.encPlain());
      this.encResult.set(res);
    } catch (e: any) {
      this.encError.set(e?.message ?? 'Encryption error');
    }
  }

  applyToBlob() {
    const r = this.encResult();
    if (!r) return;
    this.encryptedBlob.set(r.packedBase64);
  }

  async save() {
    const cur = this.entry();
    if (!cur || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.vault.update(cur.usersecretId, {
        systemName: this.systemName(),
        secretName: this.secretName(),
        secretDescription: this.secretDescription(),
        category: this.category(),
        picture: this.picture(),
        secrets: {
          username: this.username(),
          other: this.other(),
          encryptedBlob: this.encryptedBlob(),
        },
      });
      this.router.navigate(['/safebox']);
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.saving.set(false);
    }
  }

  goView() {
    const cur = this.entry();
    if (!cur || !this.hasSavedBlob()) return;
    this.router.navigate(['/safebox/view', cur.usersecretId]);
  }

  async remove() {
    const cur = this.entry();
    if (!cur) return;
    if (!confirm(`ลบรายการ "${cur.systemName}"?`)) return;
    this.saving.set(true);
    try {
      await this.vault.delete(cur.usersecretId);
      this.router.navigate(['/safebox']);
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
      this.saving.set(false);
    }
  }
}

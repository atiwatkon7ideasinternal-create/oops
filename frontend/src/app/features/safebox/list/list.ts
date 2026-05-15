import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderApp } from '../../../shared/header-app/header-app';
import { Sidebar, SAFEBOX_GROUPS } from '../../../shared/sidebar/sidebar';
import { AppsService } from '../../../data/apps.service';
import { VaultService, VaultEntry } from '../../../data/vault.service';

interface DisplayTile {
  appName: string;
  group: string;
  vid?: string;
}

@Component({
  selector: 'app-safebox-list',
  imports: [RouterLink, HeaderApp, Sidebar],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class List {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apps = inject(AppsService);
  private vault = inject(VaultService);

  private params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  group = computed<string>(() => this.params().get('group') ?? 'all');
  groupLabel = computed(
    () => SAFEBOX_GROUPS.find((g) => g.slug === this.group())?.label ?? '',
  );

  tiles = signal<DisplayTile[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      void this.load(this.group());
    });
  }

  private async load(group: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [catalog, vault] = await Promise.all([
        this.apps.list(group === 'all' ? undefined : group),
        this.vault.list(),
      ]);
      const vaultByName = new Map<string, VaultEntry>();
      for (const v of vault) vaultByName.set(v.systemName.toLowerCase(), v);

      const displayed: DisplayTile[] = [];
      // First show user's saved entries that match this group via catalog match
      // Then show catalog apps as discoverable tiles
      const seenNames = new Set<string>();
      for (const a of catalog) {
        const saved = vaultByName.get(a.appName.toLowerCase());
        displayed.push({ appName: a.appName, group: a.group, vid: saved?.vid });
        seenNames.add(a.appName.toLowerCase());
      }
      // Also show user's custom entries (not in catalog) when on 'all' or 'อื่นๆ'
      if (group === 'all' || group === 'อื่นๆ') {
        for (const v of vault) {
          if (!seenNames.has(v.systemName.toLowerCase())) {
            displayed.push({ appName: v.systemName, group: 'อื่นๆ', vid: v.vid });
          }
        }
      }
      this.tiles.set(displayed);
    } catch (e: any) {
      this.error.set(e?.error?.error ?? e?.message ?? 'API error');
    } finally {
      this.loading.set(false);
    }
  }

  open(tile: DisplayTile) {
    if (tile.vid) {
      this.router.navigate(['/safebox/edit', tile.vid]);
    } else {
      this.router.navigate(['/safebox/add'], { queryParams: { app: tile.appName } });
    }
  }
}

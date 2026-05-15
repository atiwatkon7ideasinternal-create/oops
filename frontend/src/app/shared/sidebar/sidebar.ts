import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarGroup {
  slug: string;
  label: string;
}

export const SAFEBOX_GROUPS: SidebarGroup[] = [
  { slug: 'all', label: 'แอพลิเคชั่นทั้งหมด' },
  { slug: 'สื่อสังคมออนไลน์', label: 'สื่อสังคมออนไลน์' },
  { slug: 'ธุรกรรม', label: 'ธุรกรรม' },
  { slug: 'ความบันเทิง', label: 'ความบันเทิง' },
  { slug: 'การศึกษา', label: 'การศึกษา' },
  { slug: 'หนังสือ', label: 'หนังสือ' },
  { slug: 'เกม', label: 'เกม' },
  { slug: 'อื่นๆ', label: 'อื่นๆ' },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  activeGroup = input<string | null>(null);
  groups = SAFEBOX_GROUPS;
}

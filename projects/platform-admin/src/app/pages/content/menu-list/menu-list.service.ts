import { Injectable } from '@angular/core';

export interface MenuLabel {
  id: string;
  name: string;
}

export interface MenuPageEntry {
  id: string;
  pageId: string;
  title: string;
  slug: string;
  order: number;
}

export interface PageItem {
  id: string;
  title: string;
  slug: string;
  template: string;
  status: 'Published' | 'Draft' | 'Archived';
  author: string;
  createdAt: string;
  updatedAt: string;
}

const LABELS_KEY = 'platform_menu_labels';
const ITEMS_KEY = 'platform_menu_items';
const PAGES_KEY = 'platform_pages';

const DEFAULT_LABELS: MenuLabel[] = [
  { id: 'm1', name: 'Company' },
  { id: 'm2', name: 'Policies' },
  { id: 'm3', name: 'Resources' },
  { id: 'm4', name: 'Keep in Touch' },
];

@Injectable({ providedIn: 'root' })
export class MenuListService {
  loadMenuLabels(): MenuLabel[] {
    try {
      const raw = sessionStorage.getItem(LABELS_KEY);
      if (raw) return JSON.parse(raw) as MenuLabel[];
    } catch { /* ignore */ }
    sessionStorage.setItem(LABELS_KEY, JSON.stringify(DEFAULT_LABELS));
    return DEFAULT_LABELS;
  }

  saveMenuLabels(labels: MenuLabel[]): void {
    try { sessionStorage.setItem(LABELS_KEY, JSON.stringify(labels)); } catch { /* ignore */ }
  }

  loadMenuItems(pages: PageItem[]): Record<string, MenuPageEntry[]> {
    try {
      const raw = sessionStorage.getItem(ITEMS_KEY);
      if (raw) return JSON.parse(raw) as Record<string, MenuPageEntry[]>;
    } catch { /* ignore */ }
    const seed: Record<string, MenuPageEntry[]> = {};
    const policySlugs = ['privacy-policy', 'terms-conditions', 'faq'];
    const policyPages = pages.filter(p => policySlugs.includes(p.slug));
    seed['m2'] = policyPages.map((p, i) => ({
      id: `seed-m2-${i}`,
      pageId: p.id,
      title: p.title,
      slug: p.slug,
      order: i,
    }));
    try { sessionStorage.setItem(ITEMS_KEY, JSON.stringify(seed)); } catch { /* ignore */ }
    return seed;
  }

  saveMenuItems(items: Record<string, MenuPageEntry[]>): void {
    try { sessionStorage.setItem(ITEMS_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  loadPages(): PageItem[] {
    try {
      const raw = sessionStorage.getItem(PAGES_KEY);
      if (raw) return JSON.parse(raw) as PageItem[];
    } catch { /* ignore */ }
    return [];
  }
}

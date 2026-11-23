import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

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

const STORAGE_KEY_LABELS = 'tenant_admin_menu_labels';
const STORAGE_KEY_ITEMS = 'tenant_admin_menu_items';

const INITIAL_LABELS: MenuLabel[] = [
  { id: 'lbl-header', name: 'Header Navigation' },
  { id: 'lbl-footer', name: 'Footer Links' },
  { id: 'lbl-support', name: 'Support & Help Menu' },
];

const INITIAL_ITEMS: Record<string, MenuPageEntry[]> = {
  'lbl-header': [
    { id: 'mi-1', pageId: 'page-1', title: 'About Us', slug: 'about-us', order: 1 },
    { id: 'mi-2', pageId: 'page-5', title: 'Help Center & FAQs', slug: 'faq', order: 2 },
  ],
  'lbl-footer': [
    { id: 'mi-3', pageId: 'page-1', title: 'About Us', slug: 'about-us', order: 1 },
    { id: 'mi-4', pageId: 'page-2', title: 'Terms & Conditions', slug: 'terms-and-conditions', order: 2 },
    { id: 'mi-5', pageId: 'page-3', title: 'Privacy Policy', slug: 'privacy-policy', order: 3 },
    { id: 'mi-6', pageId: 'page-4', title: 'Cancellation & Refund Policy', slug: 'cancellation-policy', order: 4 },
  ],
  'lbl-support': [
    { id: 'mi-7', pageId: 'page-5', title: 'Help Center & FAQs', slug: 'faq', order: 1 },
    { id: 'mi-8', pageId: 'page-4', title: 'Cancellation Policy', slug: 'cancellation-policy', order: 2 },
  ],
};

@Injectable({ providedIn: 'root' })
export class MenuListService {
  private readonly _labels = signal<MenuLabel[]>(this.loadLabelsFromStorage());
  private readonly _items = signal<Record<string, MenuPageEntry[]>>(this.loadItemsFromStorage());
  private readonly _loading = signal<boolean>(false);

  readonly labels = this._labels.asReadonly();
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();

  private loadLabelsFromStorage(): MenuLabel[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_LABELS);
      if (raw) return JSON.parse(raw) as MenuLabel[];
    } catch { /* ignore */ }
    this.persistLabels(INITIAL_LABELS);
    return INITIAL_LABELS;
  }

  private persistLabels(items: MenuLabel[]): void {
    try { sessionStorage.setItem(STORAGE_KEY_LABELS, JSON.stringify(items)); } catch { /* ignore */ }
  }

  private loadItemsFromStorage(): Record<string, MenuPageEntry[]> {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_ITEMS);
      if (raw) return JSON.parse(raw) as Record<string, MenuPageEntry[]>;
    } catch { /* ignore */ }
    this.persistItems(INITIAL_ITEMS);
    return INITIAL_ITEMS;
  }

  private persistItems(items: Record<string, MenuPageEntry[]>): void {
    try { sessionStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items)); } catch { /* ignore */ }
  }

  loadLabels(): void {
    this._labels.set(this.loadLabelsFromStorage());
  }

  loadItems(labelId: string): void {
    const all = this.loadItemsFromStorage();
    this._items.update(curr => ({ ...curr, [labelId]: all[labelId] ?? [] }));
  }

  addLabel(name: string): Observable<MenuLabel> {
    const newLabel: MenuLabel = { id: `lbl-${Date.now()}`, name };
    const updated = [...this._labels(), newLabel];
    this._labels.set(updated);
    this.persistLabels(updated);
    return of(newLabel);
  }

  updateLabel(id: string, name: string): Observable<MenuLabel> {
    const updated = this._labels().map(l => l.id === id ? { ...l, name } : l);
    this._labels.set(updated);
    this.persistLabels(updated);
    return of({ id, name });
  }

  deleteLabel(id: string): Observable<void> {
    const updated = this._labels().filter(l => l.id !== id);
    this._labels.set(updated);
    this.persistLabels(updated);

    const allItems = { ...this._items() };
    delete allItems[id];
    this._items.set(allItems);
    this.persistItems(allItems);
    return of(void 0);
  }

  saveMenuItems(labelId: string, pageIds: string[]): Observable<MenuPageEntry[]> {
    const current = this.loadItemsFromStorage();
    const existingForLabel = current[labelId] ?? [];
    const entries: MenuPageEntry[] = pageIds.map((pid, idx) => {
      const found = existingForLabel.find(e => e.pageId === pid);
      return {
        id: found?.id ?? `mi-${Date.now()}-${idx}`,
        pageId: pid,
        title: found?.title ?? `Page ${pid}`,
        slug: found?.slug ?? pid,
        order: idx + 1,
      };
    });

    const updated = { ...current, [labelId]: entries };
    this._items.set(updated);
    this.persistItems(updated);
    return of(entries);
  }

  deleteMenuItem(id: string, labelId: string): Observable<void> {
    const current = this.loadItemsFromStorage();
    const updatedForLabel = (current[labelId] ?? []).filter(e => e.id !== id);
    const updated = { ...current, [labelId]: updatedForLabel };
    this._items.set(updated);
    this.persistItems(updated);
    return of(void 0);
  }

  updateLabelsLocal(updated: MenuLabel[]): void {
    this._labels.set(updated);
    this.persistLabels(updated);
  }

  updateItemsLocal(labelId: string, entries: MenuPageEntry[]): void {
    this._items.update(all => {
      const copy = { ...all, [labelId]: entries };
      this.persistItems(copy);
      return copy;
    });
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from 'admin-core';

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

@Injectable({ providedIn: 'root' })
export class MenuListService {
  private readonly api = inject(ApiService);

  private readonly _labels = signal<MenuLabel[]>([]);
  private readonly _items = signal<Record<string, MenuPageEntry[]>>({});
  private readonly _loading = signal<boolean>(false);

  readonly labels = this._labels.asReadonly();
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadLabels(): void {
    this._loading.set(true);
    this.api.get<MenuLabel[] | { data: MenuLabel[] }>('/feature/menu-labels/admin').subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        this._labels.set(data);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadItems(labelId: string): void {
    this.api.get<MenuPageEntry[] | { data: MenuPageEntry[] }>(`/feature/menu-items/admin?labelId=${labelId}`).subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        this._items.update(curr => ({ ...curr, [labelId]: data }));
      },
      error: () => {},
    });
  }

  addLabel(name: string): Observable<MenuLabel> {
    return this.api.post<MenuLabel>('/feature/menu-labels/admin', { name }).pipe(
      tap((newLabel) => {
        this._labels.update(curr => [...curr, newLabel]);
      })
    );
  }

  updateLabel(id: string, name: string): Observable<MenuLabel> {
    return this.api.patch<MenuLabel>(`/feature/menu-labels/admin/${id}`, { name }).pipe(
      tap((updated) => {
        this._labels.update(curr => curr.map(l => l.id === id ? { ...l, name: updated.name } : l));
      })
    );
  }

  deleteLabel(id: string): Observable<void> {
    return this.api.delete<void>(`/feature/menu-labels/admin/${id}`).pipe(
      tap(() => {
        this._labels.update(curr => curr.filter(l => l.id !== id));
        this._items.update(curr => {
          const next = { ...curr };
          delete next[id];
          return next;
        });
      })
    );
  }

  saveMenuItems(labelId: string, pageIds: string[]): Observable<MenuPageEntry[]> {
    const current = this._items()[labelId] ?? [];
    const entries = pageIds.map((pid, idx) => {
      const found = current.find(e => e.pageId === pid);
      return {
        id: found?.id,
        pageId: pid,
        title: found?.title ?? `Page ${pid}`,
        slug: found?.slug ?? pid,
        order: idx + 1,
      };
    });

    return this.api.put<MenuPageEntry[]>('/feature/menu-items/admin/batch', { items: entries }).pipe(
      tap((saved) => {
        const data = Array.isArray(saved) ? saved : [];
        this._items.update(curr => ({ ...curr, [labelId]: data }));
      })
    );
  }

  deleteMenuItem(id: string, labelId: string): Observable<void> {
    return this.api.delete<void>(`/feature/menu-items/admin/${id}`).pipe(
      tap(() => {
        this._items.update(curr => ({
          ...curr,
          [labelId]: (curr[labelId] ?? []).filter(e => e.id !== id),
        }));
      })
    );
  }

  updateLabelsLocal(updated: MenuLabel[]): void {
    this._labels.set(updated);
  }

  updateItemsLocal(labelId: string, entries: MenuPageEntry[]): void {
    this._items.update(all => ({ ...all, [labelId]: entries }));
  }
}

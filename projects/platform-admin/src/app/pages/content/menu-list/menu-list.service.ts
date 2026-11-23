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
    this.api.get<MenuLabel[]>('/menu-labels').subscribe({
      next: (data) => {
        this._labels.set(data);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadItems(labelId: string): void {
    this.api.get<MenuPageEntry[]>(`/menu-items?labelId=${labelId}`).subscribe({
      next: (data) => {
        this._items.update(all => ({ ...all, [labelId]: data }));
      },
    });
  }

  addLabel(name: string): Observable<MenuLabel> {
    return this.api.post<MenuLabel>('/menu-labels', { name }).pipe(
      tap((label) => this._labels.update(list => [...list, label]))
    );
  }

  updateLabel(id: string, name: string): Observable<MenuLabel> {
    return this.api.patch<MenuLabel>(`/menu-labels/${id}`, { name }).pipe(
      tap((updated) => {
        this._labels.update(list => list.map(l => l.id === id ? updated : l));
      })
    );
  }

  deleteLabel(id: string): Observable<void> {
    return this.api.delete<void>(`/menu-labels/${id}`).pipe(
      tap(() => {
        this._labels.update(list => list.filter(l => l.id !== id));
        this._items.update(all => {
          const copy = { ...all };
          delete copy[id];
          return copy;
        });
      })
    );
  }

  saveMenuItems(labelId: string, pageIds: string[]): Observable<MenuPageEntry[]> {
    return this.api.post<MenuPageEntry[]>('/menu-items', { labelId, pageIds }).pipe(
      tap((entries) => {
        this._items.update(all => ({ ...all, [labelId]: entries }));
      })
    );
  }

  deleteMenuItem(id: string, labelId: string): Observable<void> {
    return this.api.delete<void>(`/menu-items/${id}`).pipe(
      tap(() => {
        this._items.update(all => ({
          ...all,
          [labelId]: (all[labelId] ?? []).filter(e => e.id !== id),
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

import { Injectable, signal, inject } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export abstract class BaseApiCrudService<T extends { id: string | number }> {
  protected readonly api = inject(ApiService);

  protected abstract readonly endpoint: string;

  protected readonly _items = signal<T[]>([]);
  protected readonly _loading = signal(false);
  protected readonly _error = signal<string | null>(null);
  protected readonly _total = signal(0);
  protected readonly _page = signal(1);
  protected readonly _limit = signal(50);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly limit = this._limit.asReadonly();

  load(params?: Record<string, string | number | boolean>): void {
    this._loading.set(true);
    this._error.set(null);
    const queryParams = { page: this._page(), limit: this._limit(), ...params };
    this.api.get<PaginatedResponse<T> | T[]>(this.endpoint, queryParams)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          if (Array.isArray(res)) {
            this._items.set(res);
            this._total.set(res.length);
          } else if (res && Array.isArray(res.data)) {
            this._items.set(res.data);
            this._total.set(typeof res.total === 'number' ? res.total : res.data.length);
          } else {
            this._items.set([]);
            this._total.set(0);
          }
          this._loading.set(false);
        },
        error: (err: unknown) => {
          const msg = (err as { error?: { message?: string } })?.error?.message ?? 'Failed to load data';
          this._error.set(msg);
          this._loading.set(false);
        },
      });
  }

  goToPage(page: number): void {
    this._page.set(page);
    this.load();
  }

  add(payload: object): Observable<T> {
    return this.api.post<T>(this.endpoint, payload).pipe(
      take(1),
      tap(created => this._items.update(list => [created, ...list])),
    );
  }

  update(id: string | number, payload: object): Observable<T> {
    return this.api.patch<T>(`${this.endpoint}/${id}`, payload).pipe(
      take(1),
      tap(updated => this._items.update(list => list.map(i => String(i.id) === String(id) ? updated : i))),
    );
  }

  delete(id: string | number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      take(1),
      tap(() => this._items.update(list => list.filter(i => String(i.id) !== String(id)))),
    );
  }

  deleteMultiple(ids: (string | number)[]): Observable<void> {
    const idSet = new Set(ids.map(id => String(id)));
    return this.api.post<void>(`${this.endpoint}/bulk-delete`, { ids }).pipe(
      take(1),
      tap(() => this._items.update(list => list.filter(i => !idSet.has(String(i.id))))),
    );
  }

  bulkDelete(ids: (string | number)[]): Observable<void> {
    return this.deleteMultiple(ids);
  }
}

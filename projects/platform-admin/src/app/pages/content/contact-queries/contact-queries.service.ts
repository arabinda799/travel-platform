import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from 'admin-core';

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  phone?: string;
  queryType: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved';
  createdDate: string;
}

@Injectable({ providedIn: 'root' })
export class ContactQueriesService {
  private readonly api = inject(ApiService);

  private readonly _queries = signal<ContactQuery[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly queries = this._queries.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  load(): void {
    this._loading.set(true);
    this.api.get<ContactQuery[]>('/contact-queries').subscribe({
      next: (data) => {
        this._queries.set(data);
        this._loading.set(false);
      },
      error: (err: { message?: string }) => {
        this._error.set(err?.message ?? 'Failed to load contact queries');
        this._loading.set(false);
      },
    });
  }

  updateStatus(id: string, status: 'New' | 'In Progress' | 'Resolved'): Observable<ContactQuery> {
    return this.api.patch<ContactQuery>(`/contact-queries/${id}/status`, { status }).pipe(
      tap((updated) => {
        this._queries.update(list => list.map(q => q.id === id ? updated : q));
      })
    );
  }

  deleteQuery(id: string): Observable<void> {
    return this.api.delete<void>(`/contact-queries/${id}`).pipe(
      tap(() => {
        this._queries.update(list => list.filter(q => q.id !== id));
      })
    );
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.api.post<void>('/contact-queries/bulk-delete', { ids }).pipe(
      tap(() => {
        const set = new Set(ids);
        this._queries.update(list => list.filter(q => !set.has(q.id)));
      })
    );
  }
}

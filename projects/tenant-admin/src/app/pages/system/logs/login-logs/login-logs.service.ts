import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from 'admin-core';

export interface LoginLog {
  id: string;
  userName: string;
  email: string;
  role: string;
  ipAddress: string;
  device: string;
  browser: string;
  status: 'Success' | 'Failed' | 'Blocked';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class LoginLogsService {
  private readonly api = inject(ApiService);

  private readonly _logs = signal<LoginLog[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly logs = this._logs.asReadonly();
  readonly loading = this._loading.asReadonly();

  load(): void {
    this._loading.set(true);
    this.api.get<LoginLog[] | { data: LoginLog[] }>('/login-logs').subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        this._logs.set(data);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/login-logs/${id}`).pipe(
      tap(() => this._logs.update(list => list.filter(l => l.id !== id)))
    );
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.api.post<void>('/login-logs/bulk-delete', { ids }).pipe(
      tap(() => {
        const set = new Set(ids);
        this._logs.update(list => list.filter(l => !set.has(l.id)));
      })
    );
  }
}

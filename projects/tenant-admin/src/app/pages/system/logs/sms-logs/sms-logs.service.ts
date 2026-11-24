import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from 'admin-core';

export interface SmsLog {
  id: string;
  to: string;
  message: string;
  template: string;
  status: 'Sent' | 'Failed' | 'Delivered' | 'Pending' | 'Queued';
  triggeredBy: string;
  sentAt: string;
  errorMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class SmsLogsService {
  private readonly api = inject(ApiService);

  private readonly _logs = signal<SmsLog[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly logs = this._logs.asReadonly();
  readonly loading = this._loading.asReadonly();

  load(): void {
    this._loading.set(true);
    this.api.get<SmsLog[] | { data: SmsLog[] }>('/shared/logs/sms').subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        this._logs.set(data);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  resend(id: string): Observable<SmsLog> {
    return this.api.patch<SmsLog>(`/shared/logs/sms/${id}/resend`, {}).pipe(
      tap((updated) => {
        this._logs.update(list => list.map(l => l.id === id ? updated : l));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/shared/logs/sms/${id}`).pipe(
      tap(() => this._logs.update(list => list.filter(l => l.id !== id)))
    );
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.api.post<void>('/shared/logs/sms/bulk-delete', { ids }).pipe(
      tap(() => {
        const set = new Set(ids);
        this._logs.update(list => list.filter(l => !set.has(l.id)));
      })
    );
  }
}

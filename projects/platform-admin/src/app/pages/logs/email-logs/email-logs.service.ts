import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from 'admin-core';

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: 'Sent' | 'Failed' | 'Bounced' | 'Queued';
  triggeredBy: string;
  sentAt: string;
  errorMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class EmailLogsService {
  private readonly api = inject(ApiService);

  private readonly _logs = signal<EmailLog[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly logs = this._logs.asReadonly();
  readonly loading = this._loading.asReadonly();

  load(): void {
    this._loading.set(true);
    this.api.get<EmailLog[]>('/email-logs').subscribe({
      next: (data) => { this._logs.set(data); this._loading.set(false); },
      error: () => this._loading.set(false),
    });
  }

  resend(id: string): Observable<EmailLog> {
    return this.api.patch<EmailLog>(`/email-logs/${id}/resend`, {}).pipe(
      tap((updated) => {
        this._logs.update(list => list.map(l => l.id === id ? updated : l));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/email-logs/${id}`).pipe(
      tap(() => this._logs.update(list => list.filter(l => l.id !== id)))
    );
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.api.post<void>('/email-logs/bulk-delete', { ids }).pipe(
      tap(() => {
        const set = new Set(ids);
        this._logs.update(list => list.filter(l => !set.has(l.id)));
      })
    );
  }
}

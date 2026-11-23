import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from 'admin-core';

export interface CouponLog {
  id: string;
  couponCode: string;
  usedBy: string;
  email: string;
  bookingId: string;
  discountAmount: number;
  discountType: 'Flat' | 'Percentage';
  status: 'Applied' | 'Expired' | 'Invalid' | 'Limit Reached';
  usedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CouponLogsService {
  private readonly api = inject(ApiService);

  private readonly _logs = signal<CouponLog[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly logs = this._logs.asReadonly();
  readonly loading = this._loading.asReadonly();

  load(): void {
    this._loading.set(true);
    this.api.get<CouponLog[]>('/coupon-logs').subscribe({
      next: (data) => { this._logs.set(data); this._loading.set(false); },
      error: () => this._loading.set(false),
    });
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/coupon-logs/${id}`).pipe(
      tap(() => this._logs.update(list => list.filter(l => l.id !== id)))
    );
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.api.post<void>('/coupon-logs/bulk-delete', { ids }).pipe(
      tap(() => {
        const set = new Set(ids);
        this._logs.update(list => list.filter(l => !set.has(l.id)));
      })
    );
  }
}

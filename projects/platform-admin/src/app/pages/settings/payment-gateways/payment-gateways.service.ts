import { Injectable, inject, signal } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { ApiService } from 'admin-core';

export type PaymentMode =
  | 'Credit Card'
  | 'RuPay Credit Card'
  | 'Visa Credit Card'
  | 'Mastercard Credit Card'
  | 'American Express Credit Card'
  | 'Debit Card'
  | 'Net Banking'
  | 'UPI'
  | 'Cash Card';

export const ALL_PAYMENT_MODES: PaymentMode[] = [
  'Credit Card', 'RuPay Credit Card', 'Visa Credit Card', 'Mastercard Credit Card',
  'American Express Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Cash Card',
];

export interface PaymentGateway {
  id: string;
  name: string;
  image: string;
  paymentModes: PaymentMode[];
  remark: string;
  credentials: Record<string, string>;
  status: 'Active' | 'Inactive';
  createdDate: string;
  updatedDate: string;
}

export type FeeType = 'Fixed' | 'Percentage';
export type ServiceType = 'Hotel' | 'Make Payment' | 'Flight' | 'Package';

export interface PaymentModeFeeConfig {
  mode: PaymentMode;
  value: number;
  type: FeeType;
}

export interface ConvenienceFeeRule {
  id: string;
  gatewayId: string;
  gatewayName: string;
  service: ServiceType;
  minAmount: number;
  maxAmount: number;
  feesByMode: PaymentModeFeeConfig[];
  status: 'Active' | 'Inactive';
  createdDate: string;
  updatedDate?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentGatewaysService {
  private readonly api = inject(ApiService);

  private readonly _gateways = signal<PaymentGateway[]>([]);
  private readonly _feeRules = signal<ConvenienceFeeRule[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly gateways = this._gateways.asReadonly();
  readonly feeRules = this._feeRules.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // ─── Gateways ───────────────────────────────────────────────────────────────

  loadGateways(): void {
    this._loading.set(true);
    this.api.get<any>('/feature/payment-gateways/admin').pipe(take(1)).subscribe({
      next: res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this._gateways.set(data);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const msg = (err as { error?: { message?: string } })?.error?.message ?? 'Failed to load gateways';
        this._error.set(msg);
        this._loading.set(false);
      },
    });
  }

  loadFeeRules(gatewayId?: string): void {
    const params = gatewayId ? { gatewayId } : undefined;
    this.api.get<any>('/feature/convenience-fees/admin', params).pipe(take(1)).subscribe({
      next: res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this._feeRules.set(data);
      },
      error: () => {},
    });
  }

  getGatewayById(id: string): PaymentGateway | undefined {
    return this._gateways().find(g => g.id === id);
  }

  createGateway(data: Omit<PaymentGateway, 'id' | 'createdDate' | 'updatedDate'>): Observable<PaymentGateway> {
    return this.api.post<PaymentGateway>('/feature/payment-gateways/admin', data).pipe(
      take(1),
      tap(created => this._gateways.update(list => [created, ...list])),
    );
  }

  updateGateway(id: string, updates: Partial<PaymentGateway>): Observable<PaymentGateway> {
    return this.api.patch<PaymentGateway>(`/feature/payment-gateways/admin/${id}`, updates).pipe(
      take(1),
      tap(updated => this._gateways.update(list => list.map(g => g.id === id ? updated : g))),
    );
  }

  updateGatewayStatus(id: string, status: 'Active' | 'Inactive'): Observable<PaymentGateway> {
    return this.updateGateway(id, { status });
  }

  updateMultipleStatus(ids: string[], status: 'Active' | 'Inactive'): Observable<PaymentGateway[]> {
    return this.api.patch<PaymentGateway[]>('/feature/payment-gateways/admin/bulk-status', { ids, status }).pipe(
      take(1),
      tap(updated => {
        const updatedMap = new Map(updated.map(g => [g.id, g]));
        this._gateways.update(list => list.map(g => updatedMap.get(g.id) ?? g));
      }),
    );
  }

  // ─── Convenience Fee Rules ──────────────────────────────────────────────────

  saveFeeRule(ruleData: Omit<ConvenienceFeeRule, 'createdDate' | 'updatedDate' | 'id'> & { id?: string }): Observable<ConvenienceFeeRule> {
    const request$ = ruleData.id
      ? this.api.patch<ConvenienceFeeRule>(`/feature/convenience-fees/admin/${ruleData.id}`, ruleData)
      : this.api.post<ConvenienceFeeRule>('/feature/convenience-fees/admin', ruleData);
    return request$.pipe(
      take(1),
      tap(saved => {
        this._feeRules.update(list => {
          const idx = list.findIndex(r => r.id === saved.id);
          return idx >= 0 ? list.map((r, i) => i === idx ? saved : r) : [saved, ...list];
        });
      }),
    );
  }

  deleteFeeRule(id: string): Observable<void> {
    return this.api.delete<void>(`/feature/convenience-fees/admin/${id}`).pipe(
      take(1),
      tap(() => this._feeRules.update(list => list.filter(r => r.id !== id))),
    );
  }
}

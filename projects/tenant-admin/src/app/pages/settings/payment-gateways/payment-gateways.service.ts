import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, take, tap } from 'rxjs';
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

const STORAGE_KEY_GATEWAYS = 'tenant_admin_payment_gateways';
const STORAGE_KEY_FEES = 'tenant_admin_convenience_fees';

const INITIAL_GATEWAYS: PaymentGateway[] = [
  {
    id: 'pg-razorpay',
    name: 'Razorpay PG',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&q=80',
    paymentModes: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking'],
    remark: 'Primary gateway for domestic INR collections and Instant UPI refund settlement.',
    credentials: { keyId: 'rzp_live_EasyFlysKey981', keySecret: '••••••••••••••••' },
    status: 'Active',
    createdDate: '2026-01-01T10:00:00.000Z',
    updatedDate: '2026-11-20T11:00:00.000Z',
  },
  {
    id: 'pg-stripe',
    name: 'Stripe International',
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=200&q=80',
    paymentModes: ['Visa Credit Card', 'Mastercard Credit Card', 'American Express Credit Card'],
    remark: 'Cross-border multi-currency gateway supporting AED, USD, EUR, and GBP hotel reservations.',
    credentials: { publishableKey: 'pk_live_EasyFlysStripeLiveKey', secretKey: '••••••••••••••••' },
    status: 'Active',
    createdDate: '2026-01-10T12:30:00.000Z',
    updatedDate: '2026-11-21T09:15:00.000Z',
  },
  {
    id: 'pg-payu',
    name: 'PayU Enterprise',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&q=80',
    paymentModes: ['Credit Card', 'Net Banking', 'Cash Card'],
    remark: 'Fallback aggregator with zero TDR for corporate netbanking transactions.',
    credentials: { merchantKey: 'EASYFLY_PAYU_KEY', merchantSalt: '••••••••••••••••' },
    status: 'Inactive',
    createdDate: '2026-02-01T15:00:00.000Z',
    updatedDate: '2026-02-01T15:00:00.000Z',
  },
];

const INITIAL_FEE_RULES: ConvenienceFeeRule[] = [
  {
    id: 'cfr-1',
    gatewayId: 'pg-razorpay',
    gatewayName: 'Razorpay PG',
    service: 'Hotel',
    minAmount: 500,
    maxAmount: 200000,
    status: 'Active',
    createdDate: '2026-01-05T10:00:00.000Z',
    feesByMode: [
      { mode: 'Credit Card', value: 1.8, type: 'Percentage' },
      { mode: 'UPI', value: 0, type: 'Fixed' },
      { mode: 'Net Banking', value: 15, type: 'Fixed' },
      { mode: 'Debit Card', value: 0.9, type: 'Percentage' },
    ],
  },
  {
    id: 'cfr-2',
    gatewayId: 'pg-stripe',
    gatewayName: 'Stripe International',
    service: 'Hotel',
    minAmount: 1000,
    maxAmount: 500000,
    status: 'Active',
    createdDate: '2026-01-12T14:30:00.000Z',
    feesByMode: [
      { mode: 'Visa Credit Card', value: 2.5, type: 'Percentage' },
      { mode: 'Mastercard Credit Card', value: 2.5, type: 'Percentage' },
      { mode: 'American Express Credit Card', value: 3.2, type: 'Percentage' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class PaymentGatewaysService {
  private readonly api = inject(ApiService);
  private readonly _gateways = signal<PaymentGateway[]>(this.loadGatewaysFromStorage());
  private readonly _feeRules = signal<ConvenienceFeeRule[]>(this.loadFeeRulesFromStorage());
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly gateways = this._gateways.asReadonly();
  readonly feeRules = this._feeRules.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadGatewaysFromStorage(): PaymentGateway[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_GATEWAYS);
      if (raw) return JSON.parse(raw) as PaymentGateway[];
    } catch { /* ignore */ }
    this.persistGateways(INITIAL_GATEWAYS);
    return INITIAL_GATEWAYS;
  }

  private persistGateways(items: PaymentGateway[]): void {
    try { sessionStorage.setItem(STORAGE_KEY_GATEWAYS, JSON.stringify(items)); } catch { /* ignore */ }
  }

  private loadFeeRulesFromStorage(): ConvenienceFeeRule[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_FEES);
      if (raw) return JSON.parse(raw) as ConvenienceFeeRule[];
    } catch { /* ignore */ }
    this.persistFeeRules(INITIAL_FEE_RULES);
    return INITIAL_FEE_RULES;
  }

  private persistFeeRules(items: ConvenienceFeeRule[]): void {
    try { sessionStorage.setItem(STORAGE_KEY_FEES, JSON.stringify(items)); } catch { /* ignore */ }
  }

  loadGateways(): void {
    this._loading.set(true);
    this.api.get<any>('/payment-gateways').pipe(take(1)).subscribe({
      next: res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this._gateways.set(data.length > 0 ? data : this.loadGatewaysFromStorage());
        this._loading.set(false);
      },
      error: () => {
        this._gateways.set(this.loadGatewaysFromStorage());
        this._loading.set(false);
      },
    });
  }

  loadFeeRules(gatewayId?: string): void {
    const params = gatewayId ? { gatewayId } : undefined;
    this.api.get<any>('/convenience-fees', params).pipe(take(1)).subscribe({
      next: res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this._feeRules.set(data.length > 0 ? data : this.loadFeeRulesFromStorage());
      },
      error: () => this._feeRules.set(this.loadFeeRulesFromStorage()),
    });
  }

  getGatewayById(id: string): PaymentGateway | undefined {
    return this._gateways().find(g => g.id === id);
  }

  createGateway(data: Omit<PaymentGateway, 'id' | 'createdDate' | 'updatedDate'>): Observable<PaymentGateway> {
    return this.api.post<PaymentGateway>('/payment-gateways', data).pipe(
      take(1),
      tap(created => this._gateways.update(list => [created, ...list])),
    );
  }

  updateGateway(id: string, updates: Partial<PaymentGateway>): Observable<PaymentGateway> {
    return this.api.patch<PaymentGateway>(`/payment-gateways/${id}`, updates).pipe(
      take(1),
      tap(updated => this._gateways.update(list => list.map(g => g.id === id ? updated : g))),
    );
  }

  updateGatewayStatus(id: string, status: 'Active' | 'Inactive'): Observable<PaymentGateway> {
    return this.updateGateway(id, { status });
  }

  updateMultipleStatus(ids: string[], status: 'Active' | 'Inactive'): Observable<PaymentGateway[]> {
    return this.api.patch<PaymentGateway[]>('/payment-gateways/bulk-status', { ids, status }).pipe(
      take(1),
      tap(updated => {
        const map = new Map(updated.map(g => [g.id, g]));
        this._gateways.update(list => list.map(g => map.get(g.id) ?? g));
      }),
    );
  }

  saveFeeRule(ruleData: Omit<ConvenienceFeeRule, 'createdDate' | 'updatedDate' | 'id'> & { id?: string }): Observable<ConvenienceFeeRule> {
    const list = this.loadFeeRulesFromStorage();
    let saved: ConvenienceFeeRule;
    if (ruleData.id) {
      saved = {
        ...(list.find(r => r.id === ruleData.id) || ({} as ConvenienceFeeRule)),
        ...ruleData,
        id: ruleData.id,
        updatedDate: new Date().toISOString(),
      };
      const updated = list.map(r => r.id === saved.id ? saved : r);
      this._feeRules.set(updated);
      this.persistFeeRules(updated);
    } else {
      saved = {
        ...ruleData,
        id: `cfr-${Date.now()}`,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };
      const updated = [saved, ...list];
      this._feeRules.set(updated);
      this.persistFeeRules(updated);
    }
    return of(saved);
  }

  deleteFeeRule(id: string): Observable<void> {
    const updated = this.loadFeeRulesFromStorage().filter(r => r.id !== id);
    this._feeRules.set(updated);
    this.persistFeeRules(updated);
    return of(void 0);
  }
}

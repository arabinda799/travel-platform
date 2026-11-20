import { Injectable, signal } from '@angular/core';

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
  'Credit Card',
  'RuPay Credit Card',
  'Visa Credit Card',
  'Mastercard Credit Card',
  'American Express Credit Card',
  'Debit Card',
  'Net Banking',
  'UPI',
  'Cash Card',
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
}

const INITIAL_GATEWAYS: PaymentGateway[] = [
  {
    id: 'pg-payu',
    name: 'PayU',
    image: 'https://images.seeklogo.com/logo-png/33/2/payu-logo-png_seeklogo-331201.png',
    paymentModes: [
      'Credit Card',
      'RuPay Credit Card',
      'Visa Credit Card',
      'Mastercard Credit Card',
      'American Express Credit Card',
      'Debit Card',
      'Net Banking',
      'UPI',
      'Cash Card',
    ],
    remark: 'Primary production payment gateway for all domestic and corporate card transactions.',
    credentials: {
      merchantId: 'MERCHANT_PAYU_78942',
      key: 'gtKFFx',
      salt: 'eCwWELxi',
      environment: 'production',
      authHeader: 'Bearer token_live_sec_9941',
    },
    status: 'Active',
    createdDate: '2026-01-15T14:30:00.000Z',
    updatedDate: '2026-02-01T10:15:00.000Z',
  },
  {
    id: 'pg-razorpay',
    name: 'Razorpay',
    image: 'https://images.seeklogo.com/logo-png/39/1/razorpay-logo-png_seeklogo-394334.png',
    paymentModes: [
      'Credit Card',
      'Visa Credit Card',
      'Mastercard Credit Card',
      'Debit Card',
      'Net Banking',
      'UPI',
    ],
    remark: 'Secondary gateway supporting instant UPI intents and auto-refunds.',
    credentials: {
      keyId: 'rzp_live_k194820491',
      keySecret: 'sec_live_94827519284',
      webhookSecret: 'whsec_rzp_live_8841',
      environment: 'production',
    },
    status: 'Active',
    createdDate: '2026-01-20T11:45:00.000Z',
    updatedDate: '2026-02-10T16:20:00.000Z',
  },
  {
    id: 'pg-cashfree',
    name: 'Cashfree',
    image: 'https://images.seeklogo.com/logo-png/43/1/cashfree-payments-logo-png_seeklogo-439527.png',
    paymentModes: [
      'Credit Card',
      'Debit Card',
      'Net Banking',
      'UPI',
    ],
    remark: 'Payment gateway specialized in instant vendor payouts and checkout routing.',
    credentials: {
      appId: 'CF_APP_994218',
      secretKey: 'cf_sec_key_448102847',
      environment: 'production',
    },
    status: 'Active',
    createdDate: '2026-01-25T09:15:00.000Z',
    updatedDate: '2026-02-05T12:00:00.000Z',
  },
  {
    id: 'pg-stripe',
    name: 'Stripe',
    image: 'https://images.seeklogo.com/logo-png/33/2/stripe-logo-png_seeklogo-331602.png',
    paymentModes: [
      'Credit Card',
      'Visa Credit Card',
      'Mastercard Credit Card',
      'American Express Credit Card',
    ],
    remark: 'International payment gateway configured for foreign inbound travelers.',
    credentials: {
      publishableKey: 'pk_test_51Mz948271049281',
      secretKey: 'sk_test_51Mz948271049281_secret',
      environment: 'sandbox',
    },
    status: 'Inactive',
    createdDate: '2026-02-01T16:00:00.000Z',
    updatedDate: '2026-02-12T09:30:00.000Z',
  },
  {
    id: 'pg-ccavenue',
    name: 'CCAvenue',
    image: 'https://images.seeklogo.com/logo-png/36/1/ccavenue-logo-png_seeklogo-360682.png',
    paymentModes: [
      'Credit Card',
      'Debit Card',
      'Net Banking',
    ],
    remark: 'Legacy gateway backup for specialized banking channels.',
    credentials: {
      merchantId: 'CCAV_994821',
      accessCode: 'AVCC449182',
      workingKey: 'WK_SEC_994827102948',
      environment: 'sandbox',
    },
    status: 'Inactive',
    createdDate: '2026-02-05T13:20:00.000Z',
    updatedDate: '2026-02-15T15:10:00.000Z',
  },
];

const INITIAL_FEE_RULES: ConvenienceFeeRule[] = [
  {
    id: 'fee-rule-1',
    gatewayId: 'pg-payu',
    gatewayName: 'PayU',
    service: 'Hotel',
    minAmount: 1,
    maxAmount: 1000000,
    feesByMode: [
      { mode: 'Credit Card', value: 1.85, type: 'Percentage' },
      { mode: 'RuPay Credit Card', value: 1.5, type: 'Percentage' },
      { mode: 'Visa Credit Card', value: 1.85, type: 'Percentage' },
      { mode: 'Mastercard Credit Card', value: 1.85, type: 'Percentage' },
      { mode: 'American Express Credit Card', value: 2.95, type: 'Percentage' },
      { mode: 'Debit Card', value: 0.9, type: 'Percentage' },
      { mode: 'Net Banking', value: 15, type: 'Fixed' },
      { mode: 'UPI', value: 0, type: 'Fixed' },
      { mode: 'Cash Card', value: 1.75, type: 'Percentage' },
    ],
    status: 'Active',
    createdDate: '2026-01-16T10:00:00.000Z',
  },
  {
    id: 'fee-rule-2',
    gatewayId: 'pg-payu',
    gatewayName: 'PayU',
    service: 'Make Payment',
    minAmount: 1,
    maxAmount: 500000,
    feesByMode: [
      { mode: 'Credit Card', value: 1.75, type: 'Percentage' },
      { mode: 'RuPay Credit Card', value: 1.4, type: 'Percentage' },
      { mode: 'Visa Credit Card', value: 1.75, type: 'Percentage' },
      { mode: 'Mastercard Credit Card', value: 1.75, type: 'Percentage' },
      { mode: 'American Express Credit Card', value: 2.8, type: 'Percentage' },
      { mode: 'Debit Card', value: 0.8, type: 'Percentage' },
      { mode: 'Net Banking', value: 12, type: 'Fixed' },
      { mode: 'UPI', value: 0, type: 'Fixed' },
      { mode: 'Cash Card', value: 1.5, type: 'Percentage' },
    ],
    status: 'Active',
    createdDate: '2026-01-18T14:20:00.000Z',
  },
  {
    id: 'fee-rule-3',
    gatewayId: 'pg-razorpay',
    gatewayName: 'Razorpay',
    service: 'Hotel',
    minAmount: 1,
    maxAmount: 1000000,
    feesByMode: [
      { mode: 'Credit Card', value: 1.9, type: 'Percentage' },
      { mode: 'Visa Credit Card', value: 1.9, type: 'Percentage' },
      { mode: 'Mastercard Credit Card', value: 1.9, type: 'Percentage' },
      { mode: 'Debit Card', value: 0.95, type: 'Percentage' },
      { mode: 'Net Banking', value: 18, type: 'Fixed' },
      { mode: 'UPI', value: 0, type: 'Fixed' },
    ],
    status: 'Active',
    createdDate: '2026-01-22T11:30:00.000Z',
  },
];

@Injectable({
  providedIn: 'root',
})
export class PaymentGatewaysService {
  private readonly STORAGE_GATEWAYS_KEY = 'platform_admin_payment_gateways';
  private readonly STORAGE_FEES_KEY = 'platform_admin_convenience_fees';

  private readonly _gateways = signal<PaymentGateway[]>(this.loadGateways());
  private readonly _feeRules = signal<ConvenienceFeeRule[]>(this.loadFeeRules());

  readonly gateways = this._gateways.asReadonly();
  readonly feeRules = this._feeRules.asReadonly();

  private loadGateways(): PaymentGateway[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_GATEWAYS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // LocalStorage fallback
    }
    return INITIAL_GATEWAYS;
  }

  private loadFeeRules(): ConvenienceFeeRule[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_FEES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // LocalStorage fallback
    }
    return INITIAL_FEE_RULES;
  }

  private persistGateways(list: PaymentGateway[]): void {
    try {
      localStorage.setItem(this.STORAGE_GATEWAYS_KEY, JSON.stringify(list));
    } catch {
      // Storage error handle
    }
  }

  private persistFeeRules(list: ConvenienceFeeRule[]): void {
    try {
      localStorage.setItem(this.STORAGE_FEES_KEY, JSON.stringify(list));
    } catch {
      // Storage error handle
    }
  }

  getGatewayById(id: string): PaymentGateway | undefined {
    return this._gateways().find((g) => g.id === id);
  }

  createGateway(data: Omit<PaymentGateway, 'id' | 'createdDate' | 'updatedDate'>): PaymentGateway {
    const newGateway: PaymentGateway = {
      ...data,
      id: `pg-${Date.now()}`,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    const updated = [newGateway, ...this._gateways()];
    this._gateways.set(updated);
    this.persistGateways(updated);
    return newGateway;
  }

  updateGateway(id: string, updates: Partial<PaymentGateway>): PaymentGateway {
    const list = this._gateways();
    const index = list.findIndex((g) => g.id === id);
    if (index === -1) {
      throw new Error(`Payment Gateway ${id} not found`);
    }

    const updatedItem: PaymentGateway = {
      ...list[index],
      ...updates,
      updatedDate: new Date().toISOString(),
    };

    const updatedList = [...list];
    updatedList[index] = updatedItem;
    this._gateways.set(updatedList);
    this.persistGateways(updatedList);
    return updatedItem;
  }

  updateGatewayStatus(id: string, status: 'Active' | 'Inactive'): void {
    this.updateGateway(id, { status });
  }

  updateMultipleStatus(ids: string[], status: 'Active' | 'Inactive'): void {
    const set = new Set(ids);
    const updated = this._gateways().map((g) => (set.has(g.id) ? { ...g, status, updatedDate: new Date().toISOString() } : g));
    this._gateways.set(updated);
    this.persistGateways(updated);
  }

  // Convenience Fee Rules
  saveFeeRule(ruleData: Omit<ConvenienceFeeRule, 'id' | 'createdDate'> & { id?: string }): ConvenienceFeeRule {
    const list = this._feeRules();
    if (ruleData.id) {
      const idx = list.findIndex((r) => r.id === ruleData.id);
      if (idx !== -1) {
        const updatedRule: ConvenienceFeeRule = {
          ...list[idx],
          ...ruleData,
          id: ruleData.id,
        };
        const updatedList = [...list];
        updatedList[idx] = updatedRule;
        this._feeRules.set(updatedList);
        this.persistFeeRules(updatedList);
        return updatedRule;
      }
    }

    const newRule: ConvenienceFeeRule = {
      ...ruleData,
      id: `fee-rule-${Date.now()}`,
      createdDate: new Date().toISOString(),
    };
    const updated = [newRule, ...list];
    this._feeRules.set(updated);
    this.persistFeeRules(updated);
    return newRule;
  }

  deleteFeeRule(id: string): void {
    const updated = this._feeRules().filter((r) => r.id !== id);
    this._feeRules.set(updated);
    this.persistFeeRules(updated);
  }
}

import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SmsLog {
  id: string;
  to: string;
  message: string;
  template: string;
  status: 'Sent' | 'Failed' | 'Delivered' | 'Queued';
  triggeredBy: string;
  sentAt: string;
  errorMessage: string | null;
}

const STORAGE_KEY = 'tenant_admin_sms_logs';

const INITIAL_SMS_LOGS: SmsLog[] = [
  {
    id: 'sms-1',
    to: '+91 98110 00001',
    message: 'Your EasyFlys OTP is 849201. Valid for 5 minutes. Do not share with anyone.',
    template: 'login_otp',
    status: 'Delivered',
    triggeredBy: 'Login OTP',
    sentAt: '2026-11-23 / 11:45 AM',
    errorMessage: null,
  },
  {
    id: 'sms-2',
    to: '+91 98110 00002',
    message: 'Booking EF-HTL-98001 confirmed at Taj Palace Delhi. Voucher sent to email.',
    template: 'booking_confirmation',
    status: 'Delivered',
    triggeredBy: 'Booking Confirmed',
    sentAt: '2026-11-23 / 11:30 AM',
    errorMessage: null,
  },
  {
    id: 'sms-3',
    to: '+91 90000 00099',
    message: 'Your payment of ₹14,800 is pending for reservation EF-HTL-98042.',
    template: 'payment_reminder',
    status: 'Failed',
    triggeredBy: 'Payment Reminder',
    sentAt: '2026-11-22 / 03:15 PM',
    errorMessage: 'Carrier routing error: Unreachable handset',
  },
];

@Injectable({ providedIn: 'root' })
export class SmsLogsService {
  private readonly _logs = signal<SmsLog[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);

  readonly logs = this._logs.asReadonly();
  readonly loading = this._loading.asReadonly();

  private loadFromStorage(): SmsLog[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as SmsLog[];
    } catch { /* ignore */ }
    this.persist(INITIAL_SMS_LOGS);
    return INITIAL_SMS_LOGS;
  }

  private persist(items: SmsLog[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  load(): void {
    this._logs.set(this.loadFromStorage());
  }

  resend(id: string): Observable<SmsLog> {
    const list = this._logs();
    const idx = list.findIndex(l => l.id === id);
    if (idx !== -1) {
      const updatedItem: SmsLog = {
        ...list[idx],
        status: 'Delivered',
        errorMessage: null,
        sentAt: 'Just now',
      };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._logs.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  delete(id: string): Observable<void> {
    const updated = this._logs().filter(l => l.id !== id);
    this._logs.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  bulkDelete(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._logs().filter(l => !set.has(l.id));
    this._logs.set(updated);
    this.persist(updated);
    return of(void 0);
  }
}

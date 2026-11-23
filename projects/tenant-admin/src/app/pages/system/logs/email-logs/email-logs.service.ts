import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

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

const STORAGE_KEY = 'tenant_admin_email_logs';

const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: 'eml-1',
    to: 'priya.sharma@gmail.com',
    subject: 'Booking Confirmed – EF-HTL-98001',
    template: 'booking_confirmation',
    status: 'Sent',
    triggeredBy: 'Booking Confirmed',
    sentAt: '2026-11-23 / 11:30 AM',
    errorMessage: null,
  },
  {
    id: 'eml-2',
    to: 'rahul.verma@outlook.com',
    subject: 'Your Password Reset Request',
    template: 'password_reset',
    status: 'Sent',
    triggeredBy: 'Password Reset',
    sentAt: '2026-11-23 / 10:15 AM',
    errorMessage: null,
  },
  {
    id: 'eml-3',
    to: 'anita.kapoor@yahoo.com',
    subject: 'Refund Processed – ₹12,500',
    template: 'refund_notification',
    status: 'Failed',
    triggeredBy: 'Refund Processed',
    sentAt: '2026-11-22 / 04:45 PM',
    errorMessage: 'SMTP connection timeout after 30s.',
  },
  {
    id: 'eml-4',
    to: 'david.smith@uktravel.co.uk',
    subject: 'Hotel Voucher Update – EF-HTL-98015',
    template: 'booking_amendment',
    status: 'Sent',
    triggeredBy: 'Amendment Approved',
    sentAt: '2026-11-22 / 02:20 PM',
    errorMessage: null,
  },
  {
    id: 'eml-5',
    to: 'bounced.recipient@testdomain.com',
    subject: 'Booking Inquiry Confirmation',
    template: 'query_acknowledgement',
    status: 'Bounced',
    triggeredBy: 'Contact Query',
    sentAt: '2026-11-21 / 09:10 AM',
    errorMessage: '550 5.1.1 The email account does not exist.',
  },
];

@Injectable({ providedIn: 'root' })
export class EmailLogsService {
  private readonly _logs = signal<EmailLog[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);

  readonly logs = this._logs.asReadonly();
  readonly loading = this._loading.asReadonly();

  private loadFromStorage(): EmailLog[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as EmailLog[];
    } catch { /* ignore */ }
    this.persist(INITIAL_EMAIL_LOGS);
    return INITIAL_EMAIL_LOGS;
  }

  private persist(items: EmailLog[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  load(): void {
    this._logs.set(this.loadFromStorage());
  }

  resend(id: string): Observable<EmailLog> {
    const list = this._logs();
    const idx = list.findIndex(l => l.id === id);
    if (idx !== -1) {
      const updatedItem: EmailLog = {
        ...list[idx],
        status: 'Sent',
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

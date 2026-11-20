import { Injectable, signal } from '@angular/core';

export interface SmsLog {
  id: string;
  to: string;
  message: string;
  template: string;
  status: 'Sent' | 'Failed' | 'Pending';
  triggeredBy: string;
  sentAt: string;
  errorMessage: string | null;
}

const STORAGE_KEY = 'platform_sms_logs';

const INITIAL_LOGS: SmsLog[] = [
  {
    id: 'sl-1',
    to: '+91 98765 43210',
    message: 'Your EasyFlys booking BK-2026-90432 is confirmed. Check-in: 22 Nov 2026. Hotel: Taj Palace, New Delhi. Reply HELP for support.',
    template: 'booking_confirmation',
    status: 'Sent',
    triggeredBy: 'Booking Confirmed',
    sentAt: '19 Nov 2026 / 09:13 AM',
    errorMessage: null,
  },
  {
    id: 'sl-2',
    to: '+91 97654 32109',
    message: 'Your OTP for EasyFlys login is 847291. Valid for 10 minutes. Do not share with anyone.',
    template: 'otp',
    status: 'Sent',
    triggeredBy: 'Login OTP Request',
    sentAt: '19 Nov 2026 / 08:50 AM',
    errorMessage: null,
  },
  {
    id: 'sl-3',
    to: '+91 96543 21098',
    message: 'Reminder: Check-in tomorrow at The Leela Palace, Bengaluru. Booking ref: BK-2026-88750. Carry a valid ID.',
    template: 'checkin_reminder',
    status: 'Sent',
    triggeredBy: 'Check-in Reminder Scheduler',
    sentAt: '18 Nov 2026 / 06:00 PM',
    errorMessage: null,
  },
  {
    id: 'sl-4',
    to: '+91 95432 10987',
    message: 'Your amendment request for BK-2026-88201 has been approved. New check-in: 25 Nov 2026.',
    template: 'amendment_notification',
    status: 'Failed',
    triggeredBy: 'Amendment Approved',
    sentAt: '18 Nov 2026 / 03:20 PM',
    errorMessage: 'DND filter active on destination number. Carrier rejected.',
  },
  {
    id: 'sl-5',
    to: '+91 94321 09876',
    message: 'Refund of Rs.12500 for booking BK-2026-85300 has been processed. Expected credit in 5–7 business days.',
    template: 'refund_notification',
    status: 'Sent',
    triggeredBy: 'Refund Processed',
    sentAt: '18 Nov 2026 / 11:05 AM',
    errorMessage: null,
  },
  {
    id: 'sl-6',
    to: '+91 93210 98765',
    message: 'Your OTP for EasyFlys password reset is 391047. Valid for 10 minutes.',
    template: 'otp',
    status: 'Sent',
    triggeredBy: 'Password Reset OTP',
    sentAt: '17 Nov 2026 / 07:45 PM',
    errorMessage: null,
  },
  {
    id: 'sl-7',
    to: '+91 92109 87654',
    message: 'Booking BK-2026-86111 cancelled successfully. Cancellation charges may apply. Check email for details.',
    template: 'cancellation_notification',
    status: 'Pending',
    triggeredBy: 'Booking Cancelled',
    sentAt: '17 Nov 2026 / 02:30 PM',
    errorMessage: null,
  },
  {
    id: 'sl-8',
    to: '+91 91098 76543',
    message: 'Welcome to EasyFlys! Your account is ready. Book hotels at unbeatable prices. Visit easyflys.com',
    template: 'welcome',
    status: 'Failed',
    triggeredBy: 'User Registration',
    sentAt: '16 Nov 2026 / 10:00 AM',
    errorMessage: 'Network error: Gateway timeout (504) from SMS provider.',
  },
  {
    id: 'sl-9',
    to: '+91 90987 65432',
    message: 'Your EasyFlys booking BK-2026-84500 is confirmed. Check-in: 20 Nov 2026. Hotel: ITC Grand Chola, Chennai.',
    template: 'booking_confirmation',
    status: 'Sent',
    triggeredBy: 'Booking Confirmed',
    sentAt: '15 Nov 2026 / 05:15 PM',
    errorMessage: null,
  },
  {
    id: 'sl-10',
    to: '+91 89876 54321',
    message: 'Reminder: Check-in tomorrow at Marriott Resort, Goa. Booking ref: BK-2026-83210. Have a great stay!',
    template: 'checkin_reminder',
    status: 'Sent',
    triggeredBy: 'Check-in Reminder Scheduler',
    sentAt: '14 Nov 2026 / 06:00 PM',
    errorMessage: null,
  },
];

@Injectable({ providedIn: 'root' })
export class SmsLogsService {
  private readonly _logs = signal<SmsLog[]>(this.load());
  readonly logs = this._logs.asReadonly();

  private load(): SmsLog[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as SmsLog[];
    } catch { /* ignore */ }
    this.persist(INITIAL_LOGS);
    return INITIAL_LOGS;
  }

  private persist(items: SmsLog[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  delete(id: string): void {
    const updated = this._logs().filter(l => l.id !== id);
    this._logs.set(updated);
    this.persist(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._logs().filter(l => !set.has(l.id));
    this._logs.set(updated);
    this.persist(updated);
  }

  resend(id: string): SmsLog | undefined {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = `${day} ${month} ${year} / ${strHours}:${minutes} ${ampm}`;

    let updatedItem: SmsLog | undefined;
    const updated = this._logs().map(l => {
      if (l.id === id) {
        updatedItem = { ...l, status: 'Sent' as const, errorMessage: null, sentAt: formattedDate };
        return updatedItem;
      }
      return l;
    });
    this._logs.set(updated);
    this.persist(updated);
    return updatedItem;
  }
}

import { Injectable, signal } from '@angular/core';

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

const STORAGE_KEY = 'platform_email_logs';

const INITIAL_LOGS: EmailLog[] = [
  {
    id: 'el-1',
    to: 'priya.sharma@gmail.com',
    subject: 'Booking Confirmed – BK-2026-90432',
    template: 'booking_confirmation',
    status: 'Sent',
    triggeredBy: 'Booking Confirmed',
    sentAt: '19 Nov 2026 / 09:12 AM',
    errorMessage: null,
  },
  {
    id: 'el-2',
    to: 'rajesh.mehta@outlook.com',
    subject: 'Your Password Reset Request',
    template: 'password_reset',
    status: 'Sent',
    triggeredBy: 'Password Reset',
    sentAt: '19 Nov 2026 / 08:45 AM',
    errorMessage: null,
  },
  {
    id: 'el-3',
    to: 'anita.verma@travelcorp.in',
    subject: 'Amendment Approved – BK-2026-88201',
    template: 'amendment_notification',
    status: 'Sent',
    triggeredBy: 'Amendment Approved',
    sentAt: '18 Nov 2026 / 05:30 PM',
    errorMessage: null,
  },
  {
    id: 'el-4',
    to: 'john.doe@voyageplus.com',
    subject: 'Refund Processed – ₹12,500',
    template: 'refund_notification',
    status: 'Failed',
    triggeredBy: 'Refund Processed',
    sentAt: '18 Nov 2026 / 03:15 PM',
    errorMessage: 'SMTP connection timeout after 30s. Host: smtp.relay.example.com:465',
  },
  {
    id: 'el-5',
    to: 'kavita.chawla@gmail.com',
    subject: 'Your Invoice – INV-2026-5541',
    template: 'invoice',
    status: 'Sent',
    triggeredBy: 'Invoice Generated',
    sentAt: '18 Nov 2026 / 11:00 AM',
    errorMessage: null,
  },
  {
    id: 'el-6',
    to: 'sales@gosling.bangeshop.com',
    subject: 'Booking Confirmed – BK-2026-87654',
    template: 'booking_confirmation',
    status: 'Bounced',
    triggeredBy: 'Booking Confirmed',
    sentAt: '17 Nov 2026 / 06:20 PM',
    errorMessage: '550 5.1.1 The email account that you tried to reach does not exist.',
  },
  {
    id: 'el-7',
    to: 'user.test@easyflys.com',
    subject: 'Welcome to EasyFlys Platform',
    template: 'welcome',
    status: 'Sent',
    triggeredBy: 'User Registration',
    sentAt: '17 Nov 2026 / 02:00 PM',
    errorMessage: null,
  },
  {
    id: 'el-8',
    to: 'manish.kapoor@b2btravel.in',
    subject: 'Cancellation Confirmed – BK-2026-86111',
    template: 'cancellation_notification',
    status: 'Sent',
    triggeredBy: 'Booking Cancelled',
    sentAt: '16 Nov 2026 / 10:45 AM',
    errorMessage: null,
  },
  {
    id: 'el-9',
    to: 'deepika.rao@gmail.com',
    subject: 'Check-in Reminder – Tomorrow at Taj Goa',
    template: 'checkin_reminder',
    status: 'Queued',
    triggeredBy: 'Check-in Reminder Scheduler',
    sentAt: '16 Nov 2026 / 08:00 AM',
    errorMessage: null,
  },
  {
    id: 'el-10',
    to: 'suresh.pillai@kochi.travel',
    subject: 'Your Password Reset Request',
    template: 'password_reset',
    status: 'Failed',
    triggeredBy: 'Password Reset',
    sentAt: '15 Nov 2026 / 07:30 PM',
    errorMessage: 'Recipient server rejected: 421 Too many connections.',
  },
  {
    id: 'el-11',
    to: 'amit.singh@delhitravel.co',
    subject: 'Amendment Pending Review – BK-2026-84900',
    template: 'amendment_notification',
    status: 'Sent',
    triggeredBy: 'Amendment Submitted',
    sentAt: '15 Nov 2026 / 11:20 AM',
    errorMessage: null,
  },
  {
    id: 'el-12',
    to: 'riya.bansal@gmail.com',
    subject: 'Refund Initiated – ₹8,200',
    template: 'refund_notification',
    status: 'Queued',
    triggeredBy: 'Refund Initiated',
    sentAt: '14 Nov 2026 / 04:55 PM',
    errorMessage: null,
  },
];

@Injectable({ providedIn: 'root' })
export class EmailLogsService {
  private readonly _logs = signal<EmailLog[]>(this.load());
  readonly logs = this._logs.asReadonly();

  private load(): EmailLog[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as EmailLog[];
    } catch { /* ignore */ }
    this.persist(INITIAL_LOGS);
    return INITIAL_LOGS;
  }

  private persist(items: EmailLog[]): void {
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

  resend(id: string): EmailLog | undefined {
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

    let updatedItem: EmailLog | undefined;
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

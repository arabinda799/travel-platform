import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  phone?: string;
  queryType: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved';
  createdDate: string;
}

const STORAGE_KEY = 'tenant_admin_contact_queries';

const INITIAL_QUERIES: ContactQuery[] = [
  {
    id: 'cq-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 98110 00001',
    queryType: 'Booking Issue',
    subject: 'Unable to process payment for Taj Palace booking',
    message: 'I am unable to complete my hotel voucher payment via netbanking. The transaction timed out while debited.',
    status: 'New',
    createdDate: '2026-11-23 / 11:45 AM',
  },
  {
    id: 'cq-2',
    name: 'Rahul Verma',
    email: 'rahul.verma@outlook.com',
    phone: '+91 98110 00002',
    queryType: 'Refund',
    subject: 'Refund status for cancelled booking #EF-HTL-98012',
    message: 'My amendment refund of ₹8,500 has not reflected in my corporate bank account after 5 business days.',
    status: 'In Progress',
    createdDate: '2026-11-22 / 03:20 PM',
  },
  {
    id: 'cq-3',
    name: 'Mohammed Al-Mansoor',
    email: 'm.almansoor@travelnet.ae',
    phone: '+971 55 987 6543',
    queryType: 'Corporate Partnership',
    subject: 'Credit limit increase for Dubai seasonal packages',
    message: 'We are requesting an evaluation of our B2B agent wallet credit limit from ₹5,00,000 to ₹12,00,000 for Q1.',
    status: 'New',
    createdDate: '2026-11-22 / 10:15 AM',
  },
  {
    id: 'cq-4',
    name: 'David Smith',
    email: 'david.smith@uktravel.co.uk',
    phone: '+44 20 7946 0912',
    queryType: 'General Inquiry',
    subject: 'GST invoice generation with UK billing address',
    message: 'Need a revised tax invoice with our foreign VAT registration details included on the PDF receipt.',
    status: 'Resolved',
    createdDate: '2026-11-20 / 04:30 PM',
  },
];

@Injectable({ providedIn: 'root' })
export class ContactQueriesService {
  private readonly _queries = signal<ContactQuery[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly queries = this._queries.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadFromStorage(): ContactQuery[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ContactQuery[];
    } catch { /* ignore */ }
    this.persist(INITIAL_QUERIES);
    return INITIAL_QUERIES;
  }

  private persist(items: ContactQuery[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  load(): void {
    this._queries.set(this.loadFromStorage());
  }

  updateStatus(id: string, status: 'New' | 'In Progress' | 'Resolved'): Observable<ContactQuery> {
    const list = this._queries();
    const idx = list.findIndex(q => q.id === id);
    if (idx !== -1) {
      const updatedItem = { ...list[idx], status };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._queries.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  deleteQuery(id: string): Observable<void> {
    const updated = this._queries().filter(q => q.id !== id);
    this._queries.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  bulkDelete(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._queries().filter(q => !set.has(q.id));
    this._queries.set(updated);
    this.persist(updated);
    return of(void 0);
  }
}

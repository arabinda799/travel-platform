import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export type CustomerStatus = 'Active' | 'Inactive' | 'Blocked';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  status: CustomerStatus;
  registeredAt: string;
  lastLogin: string;
}

const STORAGE_KEY = 'tenant_admin_customers';

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 98110 00001',
    country: 'India',
    status: 'Active',
    registeredAt: '2026-01-12 / 10:30 AM',
    lastLogin: '2026-11-22 / 04:15 PM',
  },
  {
    id: 'cust-2',
    firstName: 'Rahul',
    lastName: 'Verma',
    email: 'rahul.verma@outlook.com',
    phone: '+91 98110 00002',
    country: 'India',
    status: 'Active',
    registeredAt: '2026-01-18 / 02:45 PM',
    lastLogin: '2026-11-23 / 11:10 AM',
  },
  {
    id: 'cust-3',
    firstName: 'Anita',
    lastName: 'Kapoor',
    email: 'anita.kapoor@yahoo.com',
    phone: '+971 50 123 4567',
    country: 'UAE',
    status: 'Inactive',
    registeredAt: '2026-02-05 / 11:20 AM',
    lastLogin: '2026-09-14 / 08:30 PM',
  },
  {
    id: 'cust-4',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 415 555 2671',
    country: 'USA',
    status: 'Blocked',
    registeredAt: '2026-02-14 / 09:15 AM',
    lastLogin: '2026-05-10 / 03:22 PM',
  },
  {
    id: 'cust-5',
    firstName: 'Mohammed',
    lastName: 'Al-Mansoor',
    email: 'm.almansoor@travelnet.ae',
    phone: '+971 55 987 6543',
    country: 'UAE',
    status: 'Active',
    registeredAt: '2026-03-01 / 01:10 PM',
    lastLogin: '2026-11-23 / 09:40 AM',
  },
  {
    id: 'cust-6',
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@gmail.com',
    phone: '+91 99440 12345',
    country: 'India',
    status: 'Active',
    registeredAt: '2026-03-15 / 04:50 PM',
    lastLogin: '2026-11-21 / 06:12 PM',
  },
  {
    id: 'cust-7',
    firstName: 'Aarav',
    lastName: 'Mehta',
    email: 'aarav.mehta@hotmail.com',
    phone: '+91 98220 54321',
    country: 'India',
    status: 'Active',
    registeredAt: '2026-04-02 / 12:00 PM',
    lastLogin: '2026-11-22 / 10:05 PM',
  },
  {
    id: 'cust-8',
    firstName: 'Fatima',
    lastName: 'Zahra',
    email: 'fatima.zahra@gulfair.qa',
    phone: '+974 33 221 100',
    country: 'Qatar',
    status: 'Active',
    registeredAt: '2026-04-18 / 03:30 PM',
    lastLogin: '2026-11-20 / 01:15 PM',
  },
  {
    id: 'cust-9',
    firstName: 'David',
    lastName: 'Smith',
    email: 'david.smith@uktravel.co.uk',
    phone: '+44 20 7946 0912',
    country: 'UK',
    status: 'Inactive',
    registeredAt: '2026-05-10 / 10:15 AM',
    lastLogin: '2026-08-01 / 04:40 PM',
  },
  {
    id: 'cust-10',
    firstName: 'Karan',
    lastName: 'Malhotra',
    email: 'karan.m@gmail.com',
    phone: '+91 97110 99887',
    country: 'India',
    status: 'Active',
    registeredAt: '2026-06-01 / 05:25 PM',
    lastLogin: '2026-11-23 / 12:50 PM',
  },
];

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly _items = signal<Customer[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly customers = this.items;
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadFromStorage(): Customer[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Customer[];
    } catch { /* ignore */ }
    this.persist(INITIAL_CUSTOMERS);
    return INITIAL_CUSTOMERS;
  }

  private persist(items: Customer[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  private formatNow(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${y}-${m}-${d} / ${time}`;
  }

  // Public load method matching BaseApiCrudService API
  load(): void {
    this._items.set(this.loadFromStorage());
  }

  add(payload: Partial<Customer>): Observable<Customer> {
    const newItem: Customer = {
      id: `cust-${Date.now()}`,
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      email: payload.email || '',
      phone: payload.phone || '',
      country: payload.country || 'India',
      status: payload.status || 'Active',
      registeredAt: this.formatNow(),
      lastLogin: 'Never',
    };
    const updated = [newItem, ...this._items()];
    this._items.set(updated);
    this.persist(updated);
    return of(newItem);
  }

  update(id: string, payload: Partial<Customer>): Observable<Customer> {
    const list = this._items();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      const updatedItem = { ...list[idx], ...payload };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._items.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  updateStatus(id: string, status: CustomerStatus): Observable<Customer> {
    return this.update(id, { status });
  }

  delete(id: string): Observable<void> {
    const updated = this._items().filter(c => c.id !== id);
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  deleteMultiple(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._items().filter(c => !set.has(c.id));
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }
}

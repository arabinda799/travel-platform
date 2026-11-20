import { Injectable, signal } from '@angular/core';

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

const STORAGE_KEY = 'easyflys_customers';

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '+91 98765 43210',
    country: 'India',
    status: 'Active',
    registeredAt: '12 Jan 2025 / 10:24 AM',
    lastLogin: '19 Nov 2026 / 8:45 AM',
  },
  {
    id: 'cust-2',
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@outlook.com',
    phone: '+91 91234 56789',
    country: 'India',
    status: 'Active',
    registeredAt: '28 Feb 2025 / 3:15 PM',
    lastLogin: '18 Nov 2026 / 11:30 AM',
  },
  {
    id: 'cust-3',
    firstName: 'Ahmed',
    lastName: 'Al-Farsi',
    email: 'ahmed.alfarsi@hotmail.com',
    phone: '+971 50 123 4567',
    country: 'UAE',
    status: 'Active',
    registeredAt: '05 Mar 2025 / 9:00 AM',
    lastLogin: '15 Nov 2026 / 2:00 PM',
  },
  {
    id: 'cust-4',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@yahoo.com',
    phone: '+1 415 555 0101',
    country: 'USA',
    status: 'Inactive',
    registeredAt: '20 Apr 2025 / 6:40 PM',
    lastLogin: '02 Oct 2026 / 9:15 AM',
  },
  {
    id: 'cust-5',
    firstName: 'Mohammed',
    lastName: 'Khalid',
    email: 'm.khalid@gmail.com',
    phone: '+966 55 987 6543',
    country: 'Saudi Arabia',
    status: 'Blocked',
    registeredAt: '14 Jun 2025 / 1:20 PM',
    lastLogin: '10 Sep 2026 / 4:50 PM',
  },
  {
    id: 'cust-6',
    firstName: 'Ananya',
    lastName: 'Pillai',
    email: 'ananya.pillai@gmail.com',
    phone: '+91 70123 45678',
    country: 'India',
    status: 'Active',
    registeredAt: '30 Jul 2025 / 11:05 AM',
    lastLogin: '19 Nov 2026 / 7:00 AM',
  },
  {
    id: 'cust-7',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen@proton.me',
    phone: '+65 9123 4567',
    country: 'Singapore',
    status: 'Active',
    registeredAt: '08 Sep 2025 / 5:30 PM',
    lastLogin: '17 Nov 2026 / 3:20 PM',
  },
  {
    id: 'cust-8',
    firstName: 'Fatima',
    lastName: 'Hassan',
    email: 'fatima.h@gmail.com',
    phone: '+973 3600 1234',
    country: 'Bahrain',
    status: 'Active',
    registeredAt: '22 Oct 2025 / 8:15 AM',
    lastLogin: '16 Nov 2026 / 10:45 AM',
  },
];

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly customersSignal = signal<Customer[]>(this.loadFromSession());
  readonly customers = this.customersSignal.asReadonly();

  private loadFromSession(): Customer[] {
    if (typeof window === 'undefined') return INITIAL_CUSTOMERS;
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fall through to default
    }
    this.saveToSession(INITIAL_CUSTOMERS);
    return INITIAL_CUSTOMERS;
  }

  private saveToSession(items: Customer[]): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable
    }
  }

  private formatNow(): string {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()} / ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  add(data: Omit<Customer, 'id' | 'registeredAt' | 'lastLogin'>): Customer {
    const item: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      registeredAt: this.formatNow(),
      lastLogin: '-',
    };
    const updated = [item, ...this.customersSignal()];
    this.customersSignal.set(updated);
    this.saveToSession(updated);
    return item;
  }

  update(id: string, data: Partial<Omit<Customer, 'id' | 'registeredAt' | 'lastLogin'>>): void {
    const list = this.customersSignal();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return;
    const next = [...list];
    next[idx] = { ...next[idx], ...data };
    this.customersSignal.set(next);
    this.saveToSession(next);
  }

  delete(id: string): void {
    const filtered = this.customersSignal().filter(c => c.id !== id);
    this.customersSignal.set(filtered);
    this.saveToSession(filtered);
  }

  deleteMultiple(ids: string[]): void {
    const filtered = this.customersSignal().filter(c => !ids.includes(c.id));
    this.customersSignal.set(filtered);
    this.saveToSession(filtered);
  }

  updateStatus(id: string, status: CustomerStatus): void {
    this.update(id, { status });
  }
}

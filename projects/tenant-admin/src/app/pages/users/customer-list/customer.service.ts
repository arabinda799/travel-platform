import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

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
export class CustomerService extends BaseApiCrudService<Customer> {
  protected readonly endpoint = '/customers';
  readonly customers = this.items;

  constructor() {
    super();
    this.load();
  }

  override add(payload: Partial<Customer>): Observable<Customer> {
    return super.add(payload);
  }

  override update(id: string, payload: Partial<Customer>): Observable<Customer> {
    return super.update(id, payload);
  }

  updateStatus(id: string, status: CustomerStatus): Observable<Customer> {
    return this.update(id, { status });
  }

  override delete(id: string): Observable<void> {
    return super.delete(id);
  }

  override deleteMultiple(ids: string[]): Observable<void> {
    return super.deleteMultiple(ids);
  }
}

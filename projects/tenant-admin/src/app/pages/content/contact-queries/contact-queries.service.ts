import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

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
export class ContactQueriesService extends BaseApiCrudService<ContactQuery> {
  protected readonly endpoint = '/contact-queries';
  readonly queries = this.items;

  constructor() {
    super();
    this.load();
  }

  updateStatus(id: string, status: 'New' | 'In Progress' | 'Resolved'): Observable<ContactQuery> {
    return this.api.patch<ContactQuery>(`${this.endpoint}/${id}/status`, { status });
  }

  deleteQuery(id: string): Observable<void> {
    return this.delete(id);
  }
}

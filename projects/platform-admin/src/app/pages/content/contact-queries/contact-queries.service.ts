import { Injectable, signal } from '@angular/core';

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

const STORAGE_KEY = 'easyflys_contact_queries';

const INITIAL_QUERIES: ContactQuery[] = [
  {
    id: 'cq-1',
    name: 'Rose Hughes',
    email: 'Rosehughes974@gmail.com',
    phone: '+1 555-0142',
    queryType: 'Agent',
    subject: 'Improve Your Search Engine Visibility',
    message: 'Hello, we noticed your portal is rapidly growing in the travel space. We would love to discuss custom SEO and search engine visibility packages tailored for B2C travel bookings.',
    status: 'New',
    createdDate: '18 Nov 2026 / 10:15 AM',
  },
  {
    id: 'cq-2',
    name: 'Joanna Riggs',
    email: 'Joannariggs25@gmail.com',
    phone: '+1 555-0189',
    queryType: 'Agent',
    subject: 'Video Promotion for your website',
    message: 'Hi team EasyFlys, we produce high-converting animated explanatory videos and destination reels for online booking engines. Let us know if you would like a free mockup video sample.',
    status: 'In Progress',
    createdDate: '17 Nov 2026 / 03:40 PM',
  },
  {
    id: 'cq-3',
    name: 'Rajesh Soni',
    email: 'Rs@intrkt.com',
    phone: '+91 98234 56789',
    queryType: 'Agent',
    subject: 'AI voice calling from Rs. 2/min – free demo',
    message: 'Greetings! We provide AI-powered interactive voice agents to automate hotel booking confirmations, customer flight reschedule reminders, and instant query resolution 24x7.',
    status: 'New',
    createdDate: '16 Nov 2026 / 11:20 AM',
  },
  {
    id: 'cq-4',
    name: 'Carlton',
    email: 'Carlton@easyflys.com',
    phone: '+91 98111 22334',
    queryType: 'Agent',
    subject: 'Contactus',
    message: 'Internal query regarding API gateway webhook logs and flight inventory supplier sync interval configuration.',
    status: 'Resolved',
    createdDate: '15 Nov 2026 / 04:05 PM',
  },
  {
    id: 'cq-5',
    name: 'Tawanna',
    email: 'Tawanna@easyflys.com',
    phone: '+91 97222 33445',
    queryType: 'Agent',
    subject: 'Contactus',
    message: 'Requesting permission update to grant refund manager approval rights for hotel booking amendments.',
    status: 'In Progress',
    createdDate: '14 Nov 2026 / 02:30 PM',
  },
  {
    id: 'cq-6',
    name: 'Kenny',
    email: 'Kenny@easyflys.com',
    phone: '+91 96333 44556',
    queryType: 'Agent',
    subject: 'Contactus',
    message: 'Inquiry on bulk credit limit top-up for corporate B2B travel sub-agents in Delhi NCR region.',
    status: 'Resolved',
    createdDate: '12 Nov 2026 / 09:45 AM',
  },
  {
    id: 'cq-7',
    name: 'Dustin',
    email: 'Dustin@easyflys.com',
    phone: '+91 95444 55667',
    queryType: 'Agent',
    subject: 'Contactus',
    message: 'Please review updated GST tax invoice format requirements from our auditing partner.',
    status: 'Resolved',
    createdDate: '10 Nov 2026 / 01:15 PM',
  },
  {
    id: 'cq-8',
    name: 'Jerri',
    email: 'Jerri@easyflys.com',
    phone: '+91 94555 66778',
    queryType: 'Agent',
    subject: 'Contactus',
    message: 'Need clarification on hotel cancellation fee percentage calculation for non-refundable peak season reservations.',
    status: 'New',
    createdDate: '08 Nov 2026 / 05:50 PM',
  },
  {
    id: 'cq-9',
    name: 'Nichole',
    email: 'Sales@gosling.bangeshop.com',
    phone: '+1 555-0198',
    queryType: 'Agent',
    subject: 'Nichole Gosling',
    message: 'Inquiring regarding corporate hotel booking discounts and group corporate tour packages for international conventions in 2027.',
    status: 'New',
    createdDate: '05 Nov 2026 / 12:00 PM',
  },
  {
    id: 'cq-10',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 99888 77665',
    queryType: 'Customer',
    subject: 'Hotel Booking Date Amendment Assistance',
    message: 'I have an upcoming booking at Grand Hyatt Goa (BK-2026-90432) and wish to postpone check-in by two days. Please advise on amendment process.',
    status: 'New',
    createdDate: '03 Nov 2026 / 11:10 AM',
  },
  {
    id: 'cq-11',
    name: 'Johnathan Miller',
    email: 'j.miller@voyagepartner.com',
    phone: '+44 20 7946 0991',
    queryType: 'Partner',
    subject: 'Wholesale Inventory API Partnership',
    message: 'We operate international hotel distribution channels and would like to integrate our wholesale inventory into the EasyFlys platform.',
    status: 'In Progress',
    createdDate: '01 Nov 2026 / 02:45 PM',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ContactQueriesService {
  private readonly _queries = signal<ContactQuery[]>(this.loadQueries());
  readonly queries = this._queries.asReadonly();

  private loadQueries(): ContactQuery[] {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    this.saveToStorage(INITIAL_QUERIES);
    return INITIAL_QUERIES;
  }

  private saveToStorage(items: ContactQuery[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Fallback
    }
  }

  updateStatus(id: string, status: 'New' | 'In Progress' | 'Resolved'): ContactQuery | null {
    let updatedItem: ContactQuery | null = null;
    const updated = this._queries().map(q => {
      if (q.id === id) {
        updatedItem = { ...q, status };
        return updatedItem;
      }
      return q;
    });

    this._queries.set(updated);
    this.saveToStorage(updated);
    return updatedItem;
  }

  deleteQuery(id: string): void {
    const updated = this._queries().filter(q => q.id !== id);
    this._queries.set(updated);
    this.saveToStorage(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._queries().filter(q => !set.has(q.id));
    this._queries.set(updated);
    this.saveToStorage(updated);
  }
}

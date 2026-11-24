import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  status: 'Subscribed' | 'Unsubscribed';
  createdDate: string;
}

const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'sub-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    status: 'Subscribed',
    createdDate: '2026-01-10 / 10:30 AM',
  },
  {
    id: 'sub-2',
    name: 'Rahul Verma',
    email: 'rahul.verma@outlook.com',
    status: 'Subscribed',
    createdDate: '2026-01-15 / 02:45 PM',
  },
  {
    id: 'sub-3',
    name: 'Mohammed Al-Mansoor',
    email: 'm.almansoor@travelnet.ae',
    status: 'Subscribed',
    createdDate: '2026-01-20 / 11:20 AM',
  },
  {
    id: 'sub-4',
    name: 'Anita Kapoor',
    email: 'anita.kapoor@yahoo.com',
    status: 'Unsubscribed',
    createdDate: '2026-02-01 / 04:15 PM',
  },
  {
    id: 'sub-5',
    name: 'David Smith',
    email: 'david.smith@uktravel.co.uk',
    status: 'Subscribed',
    createdDate: '2026-02-14 / 09:10 AM',
  },
  {
    id: 'sub-6',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@gmail.com',
    status: 'Subscribed',
    createdDate: '2026-03-01 / 01:25 PM',
  },
];

@Injectable({ providedIn: 'root' })
export class NewsletterService extends BaseApiCrudService<NewsletterSubscriber> {
  protected readonly endpoint = '/newsletter';
  readonly subscribers = this.items;

  constructor() {
    super();
    this.load();
  }

  addSubscriber(payload: { name: string; email: string; status: 'Subscribed' | 'Unsubscribed' }): Observable<NewsletterSubscriber> {
    return this.add(payload);
  }

  updateSubscriber(id: string, updates: Partial<NewsletterSubscriber>): Observable<NewsletterSubscriber> {
    return this.update(id, updates);
  }

  deleteSubscriber(id: string): Observable<void> {
    return this.delete(id);
  }
}

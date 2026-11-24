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

@Injectable({ providedIn: 'root' })
export class NewsletterService extends BaseApiCrudService<NewsletterSubscriber> {
  protected readonly endpoint = '/feature/newsletter/admin';
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

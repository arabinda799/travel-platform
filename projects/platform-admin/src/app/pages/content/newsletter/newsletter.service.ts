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
  protected readonly endpoint = '/newsletter';

  readonly subscribers = this.items;

  addSubscriber(payload: { name: string; email: string; status: 'Subscribed' | 'Unsubscribed' }): Observable<NewsletterSubscriber> {
    return this.add(payload as Omit<NewsletterSubscriber, 'id' | 'createdDate'>);
  }

  updateSubscriber(id: string, updates: Partial<NewsletterSubscriber>): Observable<NewsletterSubscriber> {
    return this.update(id, updates);
  }

  deleteSubscriber(id: string): Observable<void> {
    return this.delete(id);
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.deleteMultiple(ids);
  }
}

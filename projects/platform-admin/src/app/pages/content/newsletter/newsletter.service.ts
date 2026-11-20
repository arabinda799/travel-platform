import { Injectable, signal } from '@angular/core';

export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  status: 'Subscribed' | 'Unsubscribed';
  createdDate: string;
}

const STORAGE_KEY = 'easyflys_newsletter_subscribers';

const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'nws-1',
    name: 'Rishi Ram Shukla',
    email: 'rrishiramshukla@gmail.com',
    status: 'Subscribed',
    createdDate: '20 Aug 2025 / 2:20 PM',
  },
  {
    id: 'nws-2',
    name: '',
    email: 'vineetkadyan@gmail.com',
    status: 'Subscribed',
    createdDate: '30 Jul 2025 / 9:01 AM',
  },
  {
    id: 'nws-3',
    name: 'Amitabh Sen',
    email: 'amitabh.sen@travelcorp.in',
    status: 'Subscribed',
    createdDate: '14 Sep 2025 / 11:35 AM',
  },
  {
    id: 'nws-4',
    name: 'Priyanka Desai',
    email: 'priyanka.d@outlook.com',
    status: 'Subscribed',
    createdDate: '02 Oct 2025 / 4:15 PM',
  },
  {
    id: 'nws-5',
    name: '',
    email: 'rohit.wanderlust@gmail.com',
    status: 'Subscribed',
    createdDate: '18 Nov 2025 / 6:50 PM',
  },
  {
    id: 'nws-6',
    name: 'Kavita Chawla',
    email: 'kavitac@voyageur.co',
    status: 'Subscribed',
    createdDate: '05 Dec 2025 / 1:10 PM',
  },
];

@Injectable({
  providedIn: 'root',
})
export class NewsletterService {
  private readonly _subscribers = signal<NewsletterSubscriber[]>(this.loadSubscribers());
  readonly subscribers = this._subscribers.asReadonly();

  private loadSubscribers(): NewsletterSubscriber[] {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    this.saveToStorage(INITIAL_SUBSCRIBERS);
    return INITIAL_SUBSCRIBERS;
  }

  private saveToStorage(items: NewsletterSubscriber[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Fallback
    }
  }

  addSubscriber(payload: { name?: string; email: string; status?: 'Subscribed' | 'Unsubscribed' }): NewsletterSubscriber {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} / ${now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;

    const newSubscriber: NewsletterSubscriber = {
      id: `nws-${Date.now()}`,
      name: payload.name || '',
      email: payload.email.trim().toLowerCase(),
      status: payload.status || 'Subscribed',
      createdDate: formattedDate,
    };

    const updated = [newSubscriber, ...this._subscribers()];
    this._subscribers.set(updated);
    this.saveToStorage(updated);
    return newSubscriber;
  }

  updateSubscriber(id: string, updates: Partial<NewsletterSubscriber>): NewsletterSubscriber | null {
    let updatedItem: NewsletterSubscriber | null = null;
    const updated = this._subscribers().map(sub => {
      if (sub.id === id) {
        updatedItem = { ...sub, ...updates };
        return updatedItem;
      }
      return sub;
    });

    this._subscribers.set(updated);
    this.saveToStorage(updated);
    return updatedItem;
  }

  deleteSubscriber(id: string): void {
    const updated = this._subscribers().filter(s => s.id !== id);
    this._subscribers.set(updated);
    this.saveToStorage(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._subscribers().filter(s => !set.has(s.id));
    this._subscribers.set(updated);
    this.saveToStorage(updated);
  }
}

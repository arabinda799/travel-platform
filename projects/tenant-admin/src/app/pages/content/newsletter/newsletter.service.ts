import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  status: 'Subscribed' | 'Unsubscribed';
  createdDate: string;
}

const STORAGE_KEY = 'tenant_admin_newsletter_subscribers';

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
export class NewsletterService {
  private readonly _items = signal<NewsletterSubscriber[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly subscribers = this.items;
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadFromStorage(): NewsletterSubscriber[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as NewsletterSubscriber[];
    } catch { /* ignore */ }
    this.persist(INITIAL_SUBSCRIBERS);
    return INITIAL_SUBSCRIBERS;
  }

  private persist(items: NewsletterSubscriber[]): void {
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

  load(): void {
    this._items.set(this.loadFromStorage());
  }

  add(payload: { name: string; email: string; status: 'Subscribed' | 'Unsubscribed' }): Observable<NewsletterSubscriber> {
    const newItem: NewsletterSubscriber = {
      ...payload,
      id: `sub-${Date.now()}`,
      createdDate: this.formatNow(),
    };
    const updated = [newItem, ...this._items()];
    this._items.set(updated);
    this.persist(updated);
    return of(newItem);
  }

  addSubscriber(payload: { name: string; email: string; status: 'Subscribed' | 'Unsubscribed' }): Observable<NewsletterSubscriber> {
    return this.add(payload);
  }

  update(id: string, updates: Partial<NewsletterSubscriber>): Observable<NewsletterSubscriber> {
    const list = this._items();
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      const updatedItem = { ...list[idx], ...updates };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._items.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  updateSubscriber(id: string, updates: Partial<NewsletterSubscriber>): Observable<NewsletterSubscriber> {
    return this.update(id, updates);
  }

  delete(id: string): Observable<void> {
    const updated = this._items().filter(s => s.id !== id);
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  deleteSubscriber(id: string): Observable<void> {
    return this.delete(id);
  }

  deleteMultiple(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._items().filter(s => !set.has(s.id));
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.deleteMultiple(ids);
  }
}

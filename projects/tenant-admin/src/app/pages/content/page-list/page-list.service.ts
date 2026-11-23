import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PageItem {
  id: string;
  title: string;
  slug: string;
  template: string;
  status: 'Published' | 'Draft' | 'Archived';
  author: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'tenant_admin_pages';

const INITIAL_PAGES: PageItem[] = [
  {
    id: 'page-1',
    title: 'About Us',
    slug: 'about-us',
    template: 'Standard Page',
    status: 'Published',
    author: 'Admin Team',
    content: 'EasyFly Travels is a premier B2B and B2C travel management platform providing curated hotel bookings and worldwide vacation packages.',
    createdAt: '2026-01-05 / 10:00 AM',
    updatedAt: '2026-11-20 / 02:30 PM',
  },
  {
    id: 'page-2',
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    template: 'Legal Policy',
    status: 'Published',
    author: 'Legal Dept',
    content: 'Review the booking terms, service agreements, payment schedules, and user responsibilities governing use of the platform.',
    createdAt: '2026-01-08 / 11:15 AM',
    updatedAt: '2026-10-15 / 04:00 PM',
  },
  {
    id: 'page-3',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    template: 'Legal Policy',
    status: 'Published',
    author: 'Legal Dept',
    content: 'Details on user data protection, cookie policy, security precautions, and compliance under international privacy directives.',
    createdAt: '2026-01-08 / 11:20 AM',
    updatedAt: '2026-10-15 / 04:05 PM',
  },
  {
    id: 'page-4',
    title: 'Hotel Booking Cancellation & Refund Policy',
    slug: 'cancellation-policy',
    template: 'Policy Page',
    status: 'Published',
    author: 'Operations Team',
    content: 'Comprehensive guidelines detailing hotel cancellation deadlines, non-refundable rates, auto-refund calculations, and GST adjustments.',
    createdAt: '2026-01-15 / 03:00 PM',
    updatedAt: '2026-11-22 / 11:10 AM',
  },
  {
    id: 'page-5',
    title: 'Help Center & FAQs',
    slug: 'faq',
    template: 'FAQ Layout',
    status: 'Published',
    author: 'Support Team',
    content: 'Frequently asked questions regarding booking confirmations, voucher re-downloads, tax invoices, and modification procedures.',
    createdAt: '2026-02-01 / 09:30 AM',
    updatedAt: '2026-11-21 / 05:45 PM',
  },
  {
    id: 'page-6',
    title: 'Monsoon Getaways 2026',
    slug: 'monsoon-getaways-2026',
    template: 'Promotional Landing',
    status: 'Draft',
    author: 'Marketing Team',
    content: 'Curated mountain and coastal resort deals with complimentary breakfast and free cancellation.',
    createdAt: '2026-03-01 / 01:20 PM',
    updatedAt: '2026-03-01 / 01:20 PM',
  },
];

@Injectable({ providedIn: 'root' })
export class PageListService {
  private readonly _items = signal<PageItem[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly pages = this.items;
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadFromStorage(): PageItem[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as PageItem[];
    } catch { /* ignore */ }
    this.persist(INITIAL_PAGES);
    return INITIAL_PAGES;
  }

  private persist(items: PageItem[]): void {
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

  add(payload: Omit<PageItem, 'id' | 'createdAt' | 'updatedAt'>): Observable<PageItem> {
    const newItem: PageItem = {
      ...payload,
      id: `page-${Date.now()}`,
      createdAt: this.formatNow(),
      updatedAt: this.formatNow(),
    };
    const updated = [newItem, ...this._items()];
    this._items.set(updated);
    this.persist(updated);
    return of(newItem);
  }

  addPage(payload: Omit<PageItem, 'id' | 'createdAt' | 'updatedAt'>): Observable<PageItem> {
    return this.add(payload);
  }

  update(id: string, updates: Partial<PageItem>): Observable<PageItem> {
    const list = this._items();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      const updatedItem: PageItem = { ...list[idx], ...updates, updatedAt: this.formatNow() };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._items.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  updatePage(id: string, updates: Partial<PageItem>): Observable<PageItem> {
    return this.update(id, updates);
  }

  delete(id: string): Observable<void> {
    const updated = this._items().filter(p => p.id !== id);
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  deletePage(id: string): Observable<void> {
    return this.delete(id);
  }

  deleteMultiple(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._items().filter(p => !set.has(p.id));
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.deleteMultiple(ids);
  }
}

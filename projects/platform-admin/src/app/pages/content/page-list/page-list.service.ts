import { Injectable, signal } from '@angular/core';

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

const STORAGE_KEY = 'platform_pages';

const INITIAL_PAGES: PageItem[] = [
  { id: 'pg-1', title: 'About Us', slug: 'about-us', template: 'About', status: 'Published', author: 'Arabinda Jena', createdAt: '01 Jan 2026 / 10:00 AM', updatedAt: '10 Nov 2026 / 09:00 AM' },
  { id: 'pg-2', title: 'Contact Us', slug: 'contact-us', template: 'Contact', status: 'Published', author: 'Arabinda Jena', createdAt: '01 Jan 2026 / 10:05 AM', updatedAt: '12 Nov 2026 / 11:00 AM' },
  { id: 'pg-3', title: 'Privacy Policy', slug: 'privacy-policy', template: 'Generic', status: 'Published', author: 'Priya Sharma', createdAt: '15 Jan 2026 / 09:00 AM', updatedAt: '05 Oct 2026 / 03:00 PM' },
  { id: 'pg-4', title: 'Terms & Conditions', slug: 'terms-conditions', template: 'Generic', status: 'Published', author: 'Priya Sharma', createdAt: '15 Jan 2026 / 09:30 AM', updatedAt: '05 Oct 2026 / 03:30 PM' },
  { id: 'pg-5', title: 'FAQ', slug: 'faq', template: 'Generic', status: 'Published', author: 'Rahul Verma', createdAt: '20 Jan 2026 / 11:00 AM', updatedAt: '01 Nov 2026 / 10:00 AM' },
  { id: 'pg-6', title: 'Careers', slug: 'careers', template: 'Generic', status: 'Draft', author: 'Rahul Verma', createdAt: '25 Feb 2026 / 02:00 PM', updatedAt: '15 Nov 2026 / 04:00 PM' },
  { id: 'pg-7', title: 'Blog', slug: 'blog', template: 'Blog', status: 'Published', author: 'Arabinda Jena', createdAt: '01 Mar 2026 / 08:00 AM', updatedAt: '18 Nov 2026 / 08:30 AM' },
  { id: 'pg-8', title: 'Gallery', slug: 'gallery', template: 'Generic', status: 'Draft', author: 'Meera Nair', createdAt: '10 Apr 2026 / 01:00 PM', updatedAt: '10 Nov 2026 / 01:00 PM' },
  { id: 'pg-9', title: 'Destinations', slug: 'destinations', template: 'Home', status: 'Published', author: 'Meera Nair', createdAt: '20 Apr 2026 / 03:00 PM', updatedAt: '17 Nov 2026 / 05:00 PM' },
  { id: 'pg-10', title: 'Deals', slug: 'deals', template: 'Home', status: 'Archived', author: 'Rahul Verma', createdAt: '01 May 2026 / 09:00 AM', updatedAt: '01 Sep 2026 / 09:00 AM' },
];

@Injectable({ providedIn: 'root' })
export class PageListService {
  private readonly _pages = signal<PageItem[]>(this.loadPages());
  readonly pages = this._pages.asReadonly();

  private loadPages(): PageItem[] {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch { /* ignore */ }
    this.saveToStorage(INITIAL_PAGES);
    return INITIAL_PAGES;
  }

  private saveToStorage(items: PageItem[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  private formatDate(): string {
    const now = new Date();
    return `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} / ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  addPage(payload: Omit<PageItem, 'id' | 'createdAt' | 'updatedAt'>): PageItem {
    const now = this.formatDate();
    const item: PageItem = { id: `pg-${Date.now()}`, ...payload, createdAt: now, updatedAt: now };
    const updated = [item, ...this._pages()];
    this._pages.set(updated);
    this.saveToStorage(updated);
    return item;
  }

  updatePage(id: string, updates: Partial<PageItem>): void {
    const updated = this._pages().map(p => p.id === id ? { ...p, ...updates, updatedAt: this.formatDate() } : p);
    this._pages.set(updated);
    this.saveToStorage(updated);
  }

  deletePage(id: string): void {
    const updated = this._pages().filter(p => p.id !== id);
    this._pages.set(updated);
    this.saveToStorage(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._pages().filter(p => !set.has(p.id));
    this._pages.set(updated);
    this.saveToStorage(updated);
  }
}

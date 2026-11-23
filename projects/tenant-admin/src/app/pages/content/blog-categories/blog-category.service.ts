import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  status: 'Active' | 'Inactive';
  metaRobots: string;
  metaTitle: string;
  metaKeyword: string;
  metaDescription: string;
  createdAt: string;
  modifiedAt: string;
}

const STORAGE_KEY = 'tenant_admin_blog_categories';

const INITIAL_CATEGORIES: BlogCategory[] = [
  {
    id: 'cat-1',
    name: 'Travel Tips & Guides',
    slug: 'travel-tips-guides',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80',
    description: 'Expert tips on smart packing, airport navigation, hotel check-ins, and currency exchange.',
    status: 'Active',
    metaRobots: 'index,follow',
    metaTitle: 'Travel Tips & Tricks | EasyFly Travel Blog',
    metaKeyword: 'travel tips, smart packing, airport tips',
    metaDescription: 'Read the latest travel hacks and practical tips from experienced frequent flyers.',
    createdAt: '2026-01-10 / 10:00 AM',
    modifiedAt: '2026-11-15 / 03:20 PM',
  },
  {
    id: 'cat-2',
    name: 'Luxury Destinations',
    slug: 'luxury-destinations',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80',
    description: 'Discover world-class resorts, private villas, and high-end retreats in Dubai, Maldives, and Europe.',
    status: 'Active',
    metaRobots: 'index,follow',
    metaTitle: 'Luxury Travel & Top Resorts | EasyFly',
    metaKeyword: 'luxury travel, 5 star hotels, luxury resorts',
    metaDescription: 'Explore the most glamorous hotels and exotic luxury getaways around the world.',
    createdAt: '2026-01-15 / 11:30 AM',
    modifiedAt: '2026-11-18 / 01:15 PM',
  },
  {
    id: 'cat-3',
    name: 'Hotel Reviews & Insider Looks',
    slug: 'hotel-reviews',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
    description: 'Detailed walkthroughs of heritage palaces, boutique city hotels, and seaside wellness resorts.',
    status: 'Active',
    metaRobots: 'index,follow',
    metaTitle: 'Hotel Reviews & Property Tours | EasyFly',
    metaKeyword: 'hotel reviews, property inspection, luxury hotel stay',
    metaDescription: 'Unfiltered reviews of the best hotels across India, UAE, and Southeast Asia.',
    createdAt: '2026-01-20 / 02:45 PM',
    modifiedAt: '2026-11-20 / 04:30 PM',
  },
  {
    id: 'cat-4',
    name: 'Food & Cultural Journeys',
    slug: 'food-culture',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    description: 'Local culinary trails, street food secrets, and UNESCO heritage exploration.',
    status: 'Inactive',
    metaRobots: 'noindex,nofollow',
    metaTitle: 'Culinary Travel & Culture | EasyFly',
    metaKeyword: 'food tours, street food, heritage walks',
    metaDescription: 'Discover the world through taste and cultural discoveries.',
    createdAt: '2026-02-01 / 09:15 AM',
    modifiedAt: '2026-02-01 / 09:15 AM',
  },
];

@Injectable({ providedIn: 'root' })
export class BlogCategoryService {
  private readonly _items = signal<BlogCategory[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  get categories() { return this.items; }
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadFromStorage(): BlogCategory[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as BlogCategory[];
    } catch { /* ignore */ }
    this.persist(INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  }

  private persist(items: BlogCategory[]): void {
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

  add(data: Omit<BlogCategory, 'id' | 'createdAt' | 'modifiedAt'>): Observable<BlogCategory> {
    const newItem: BlogCategory = {
      ...data,
      id: `cat-${Date.now()}`,
      createdAt: this.formatNow(),
      modifiedAt: this.formatNow(),
    };
    const updated = [newItem, ...this._items()];
    this._items.set(updated);
    this.persist(updated);
    return of(newItem);
  }

  addCategory(data: Omit<BlogCategory, 'id' | 'createdAt' | 'modifiedAt'>): Observable<BlogCategory> {
    return this.add(data);
  }

  update(id: string, data: Partial<BlogCategory>): Observable<BlogCategory> {
    const list = this._items();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      const updatedItem: BlogCategory = { ...list[idx], ...data, modifiedAt: this.formatNow() };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._items.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  updateCategory(id: string, data: Partial<BlogCategory>): Observable<BlogCategory> {
    return this.update(id, data);
  }

  delete(id: string): Observable<void> {
    const updated = this._items().filter(c => c.id !== id);
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  deleteCategory(id: string): Observable<void> {
    return this.delete(id);
  }

  deleteMultiple(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._items().filter(c => !set.has(c.id));
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.deleteMultiple(ids);
  }

  updateStatus(id: string, status: 'Active' | 'Inactive'): Observable<BlogCategory> {
    return this.update(id, { status });
  }
}

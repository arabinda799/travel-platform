import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  image: string;
  description: string;
  status: 'Active' | 'Inactive';
  postedBy: string;
  metaRobots: string;
  metaTitle: string;
  metaKeyword: string;
  metaDescription: string;
  createdAt: string;
  modifiedAt: string;
}

const STORAGE_KEY = 'tenant_admin_blog_posts';

const INITIAL_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Top 10 Boutique Hotels to Experience in Rajasthan This Season',
    slug: 'top-10-boutique-hotels-rajasthan',
    categoryId: 'cat-3',
    categoryName: 'Hotel Reviews & Insider Looks',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80',
    description: 'From lakeside palaces in Udaipur to sand dune retreats in Jaisalmer, here are the most mesmerizing stays.',
    status: 'Active',
    postedBy: 'Amit Kumar',
    metaRobots: 'index,follow',
    metaTitle: 'Top 10 Boutique Hotels in Rajasthan | EasyFly',
    metaKeyword: 'rajasthan hotels, udaipur palace hotels, luxury boutique rajasthan',
    metaDescription: 'A complete guide to our top boutique hotel selections in Rajasthan.',
    createdAt: '2026-01-12 / 11:30 AM',
    modifiedAt: '2026-11-20 / 02:40 PM',
  },
  {
    id: 'post-2',
    title: 'The Ultimate Guide to Booking Luxury Resorts in Dubai & UAE',
    slug: 'ultimate-guide-luxury-resorts-dubai',
    categoryId: 'cat-2',
    categoryName: 'Luxury Destinations',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80',
    description: 'Everything you need to know about Palm Jumeirah beach clubs, desert oasis lodges, and VIP amenities.',
    status: 'Active',
    postedBy: 'Priya Sharma',
    metaRobots: 'index,follow',
    metaTitle: 'Dubai Luxury Resort Booking Guide | EasyFly',
    metaKeyword: 'dubai luxury hotels, palm jumeirah resorts, uae 5 star stays',
    metaDescription: 'Discover insider booking tips and perk upgrades for high-end Dubai hotels.',
    createdAt: '2026-01-18 / 03:15 PM',
    modifiedAt: '2026-11-21 / 10:10 AM',
  },
  {
    id: 'post-3',
    title: 'How to Navigate Hotel Amendment & Refund Policies Like a Pro',
    slug: 'hotel-amendment-refund-tips',
    categoryId: 'cat-1',
    categoryName: 'Travel Tips & Guides',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
    description: 'Understand free cancellation cutoff dates, partial refund calculations, and date modification workflows.',
    status: 'Active',
    postedBy: 'Operations Desk',
    metaRobots: 'index,follow',
    metaTitle: 'Hotel Amendment & Cancellation Guide | EasyFly',
    metaKeyword: 'hotel refund, hotel cancellation policy, booking amendment tips',
    metaDescription: 'Save money and avoid unexpected penalty fees with our hotel modification guide.',
    createdAt: '2026-02-05 / 09:45 AM',
    modifiedAt: '2026-11-22 / 04:00 PM',
  },
  {
    id: 'post-4',
    title: 'Hidden Culinary Trails Across Old Delhi and Mumbai',
    slug: 'culinary-trails-delhi-mumbai',
    categoryId: 'cat-4',
    categoryName: 'Food & Cultural Journeys',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    description: 'A curated walking itinerary covering historic chaat corners, Irani cafes, and authentic regional feasts.',
    status: 'Inactive',
    postedBy: 'Guest Contributor',
    metaRobots: 'noindex,nofollow',
    metaTitle: 'Delhi & Mumbai Street Food Trails | EasyFly',
    metaKeyword: 'street food delhi, mumbai irani cafes, food guide',
    metaDescription: 'Take a journey through the authentic culinary streets of India.',
    createdAt: '2026-02-20 / 01:20 PM',
    modifiedAt: '2026-02-20 / 01:20 PM',
  },
];

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly _items = signal<BlogPost[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly blogs = this.items;
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadFromStorage(): BlogPost[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as BlogPost[];
    } catch { /* ignore */ }
    this.persist(INITIAL_POSTS);
    return INITIAL_POSTS;
  }

  private persist(items: BlogPost[]): void {
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

  add(data: Omit<BlogPost, 'id' | 'createdAt' | 'modifiedAt'>): Observable<BlogPost> {
    const newItem: BlogPost = {
      ...data,
      id: `post-${Date.now()}`,
      createdAt: this.formatNow(),
      modifiedAt: this.formatNow(),
    };
    const updated = [newItem, ...this._items()];
    this._items.set(updated);
    this.persist(updated);
    return of(newItem);
  }

  addBlog(data: Omit<BlogPost, 'id' | 'createdAt' | 'modifiedAt'>): Observable<BlogPost> {
    return this.add(data);
  }

  update(id: string, data: Partial<BlogPost>): Observable<BlogPost> {
    const list = this._items();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      const updatedItem: BlogPost = { ...list[idx], ...data, modifiedAt: this.formatNow() };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._items.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  updateBlog(id: string, data: Partial<BlogPost>): Observable<BlogPost> {
    return this.update(id, data);
  }

  delete(id: string): Observable<void> {
    const updated = this._items().filter(p => p.id !== id);
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  deleteBlog(id: string): Observable<void> {
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

  updateStatus(id: string, status: 'Active' | 'Inactive'): Observable<BlogPost> {
    return this.update(id, { status });
  }
}

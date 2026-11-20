import { Injectable, signal } from '@angular/core';

export interface TrendingDestination {
  id: string;
  tenantId: string;
  name: string;
  subtitle: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'platform_trending_destinations';

const INITIAL_DESTINATIONS: TrendingDestination[] = [
  {
    id: 'td-1',
    tenantId: 'tenant-easyfly',
    name: 'Dubai',
    subtitle: '1,240 properties',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80',
    sortOrder: 1,
    isActive: true,
    createdAt: '15 Jan 2026 / 10:00 AM',
    updatedAt: '-',
  },
  {
    id: 'td-2',
    tenantId: 'tenant-easyfly',
    name: 'Bali',
    subtitle: '980 properties',
    imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&q=80',
    sortOrder: 2,
    isActive: true,
    createdAt: '15 Jan 2026 / 10:05 AM',
    updatedAt: '-',
  },
  {
    id: 'td-3',
    tenantId: 'tenant-easyfly',
    name: 'Goa',
    subtitle: '850 properties',
    imageUrl: 'https://images.unsplash.com/photo-1587922546307-776227941871?w=400&q=80',
    sortOrder: 3,
    isActive: true,
    createdAt: '15 Jan 2026 / 10:10 AM',
    updatedAt: '-',
  },
  {
    id: 'td-4',
    tenantId: 'tenant-easyfly',
    name: 'Bangkok',
    subtitle: '1,890 properties',
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80',
    sortOrder: 4,
    isActive: true,
    createdAt: '15 Jan 2026 / 10:15 AM',
    updatedAt: '-',
  },
  {
    id: 'td-5',
    tenantId: 'tenant-easyfly',
    name: 'Paris',
    subtitle: '2,100 properties',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
    sortOrder: 5,
    isActive: true,
    createdAt: '15 Jan 2026 / 10:20 AM',
    updatedAt: '-',
  },
  {
    id: 'td-6',
    tenantId: 'tenant-easyfly',
    name: 'Singapore',
    subtitle: '760 properties',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80',
    sortOrder: 6,
    isActive: false,
    createdAt: '16 Jan 2026 / 09:00 AM',
    updatedAt: '-',
  },
  {
    id: 'td-7',
    tenantId: 'tenant-easyfly',
    name: 'Maldives',
    subtitle: '320 properties',
    imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80',
    sortOrder: 7,
    isActive: true,
    createdAt: '17 Jan 2026 / 11:30 AM',
    updatedAt: '-',
  },
  {
    id: 'td-8',
    tenantId: 'tenant-easyfly',
    name: 'London',
    subtitle: '3,500 properties',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80',
    sortOrder: 8,
    isActive: false,
    createdAt: '18 Jan 2026 / 02:00 PM',
    updatedAt: '-',
  },
];

@Injectable({ providedIn: 'root' })
export class TrendingDestinationsService {
  private readonly _destinations = signal<TrendingDestination[]>(this.load());
  readonly destinations = this._destinations.asReadonly();

  private load(): TrendingDestination[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as TrendingDestination[];
    } catch { /* ignore */ }
    this.persist(INITIAL_DESTINATIONS);
    return INITIAL_DESTINATIONS;
  }

  private persist(items: TrendingDestination[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  private formatNow(): string {
    const now = new Date();
    return `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} / ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  add(payload: Omit<TrendingDestination, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): TrendingDestination {
    const item: TrendingDestination = {
      ...payload,
      id: `td-${Date.now()}`,
      tenantId: 'tenant-easyfly',
      createdAt: this.formatNow(),
      updatedAt: '-',
    };
    const updated = [item, ...this._destinations()];
    this._destinations.set(updated);
    this.persist(updated);
    return item;
  }

  update(id: string, changes: Partial<TrendingDestination>): void {
    const updated = this._destinations().map(d =>
      d.id === id ? { ...d, ...changes, updatedAt: this.formatNow() } : d,
    );
    this._destinations.set(updated);
    this.persist(updated);
  }

  delete(id: string): void {
    const updated = this._destinations().filter(d => d.id !== id);
    this._destinations.set(updated);
    this.persist(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._destinations().filter(d => !set.has(d.id));
    this._destinations.set(updated);
    this.persist(updated);
  }

  updateStatus(id: string, isActive: boolean): void {
    this.update(id, { isActive });
  }
}

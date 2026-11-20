import { Injectable, signal } from '@angular/core';

export interface PopularHotel {
  id: string;
  tenantId: string;
  title: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'platform_popular_hotels';

const INITIAL_HOTELS: PopularHotel[] = [
  {
    id: 'ph-1',
    tenantId: 'tenant-easyfly',
    title: 'Taj Palace New Delhi',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
    sortOrder: 1,
    isActive: true,
    createdAt: '15 Jan 2026 / 10:00 AM',
    updatedAt: '-',
  },
  {
    id: 'ph-2',
    tenantId: 'tenant-easyfly',
    title: 'Oberoi Udaivilas Udaipur',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80',
    sortOrder: 2,
    isActive: true,
    createdAt: '15 Jan 2026 / 10:05 AM',
    updatedAt: '-',
  },
  {
    id: 'ph-3',
    tenantId: 'tenant-easyfly',
    title: 'The Leela Palace Bengaluru',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80',
    sortOrder: 3,
    isActive: true,
    createdAt: '15 Jan 2026 / 10:10 AM',
    updatedAt: '-',
  },
  {
    id: 'ph-4',
    tenantId: 'tenant-easyfly',
    title: 'ITC Grand Chola Chennai',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
    sortOrder: 4,
    isActive: true,
    createdAt: '15 Jan 2026 / 10:15 AM',
    updatedAt: '-',
  },
  {
    id: 'ph-5',
    tenantId: 'tenant-easyfly',
    title: 'Marriott Resort Goa',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
    sortOrder: 5,
    isActive: true,
    createdAt: '15 Jan 2026 / 10:20 AM',
    updatedAt: '-',
  },
  {
    id: 'ph-6',
    tenantId: 'tenant-easyfly',
    title: 'Hyatt Regency Mumbai',
    imageUrl: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&q=80',
    sortOrder: 6,
    isActive: false,
    createdAt: '16 Jan 2026 / 09:30 AM',
    updatedAt: '-',
  },
];

@Injectable({ providedIn: 'root' })
export class PopularHotelsService {
  private readonly _hotels = signal<PopularHotel[]>(this.load());
  readonly hotels = this._hotels.asReadonly();

  private load(): PopularHotel[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as PopularHotel[];
    } catch { /* ignore */ }
    this.persist(INITIAL_HOTELS);
    return INITIAL_HOTELS;
  }

  private persist(items: PopularHotel[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  private formatNow(): string {
    const now = new Date();
    return `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} / ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  add(payload: Omit<PopularHotel, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): PopularHotel {
    const item: PopularHotel = {
      ...payload,
      id: `ph-${Date.now()}`,
      tenantId: 'tenant-easyfly',
      createdAt: this.formatNow(),
      updatedAt: '-',
    };
    const updated = [item, ...this._hotels()];
    this._hotels.set(updated);
    this.persist(updated);
    return item;
  }

  update(id: string, changes: Partial<PopularHotel>): void {
    const updated = this._hotels().map(h =>
      h.id === id ? { ...h, ...changes, updatedAt: this.formatNow() } : h,
    );
    this._hotels.set(updated);
    this.persist(updated);
  }

  delete(id: string): void {
    const updated = this._hotels().filter(h => h.id !== id);
    this._hotels.set(updated);
    this.persist(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._hotels().filter(h => !set.has(h.id));
    this._hotels.set(updated);
    this.persist(updated);
  }

  updateStatus(id: string, isActive: boolean): void {
    this.update(id, { isActive });
  }
}

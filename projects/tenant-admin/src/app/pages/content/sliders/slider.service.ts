import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SliderBadge {
  icon: string;
  text: string;
}

export type SliderPlatform = 'ALL' | 'WEB' | 'ANDROID' | 'IOS';

export interface Slider {
  id: string;
  tenantId?: string;
  serviceType: 'HOTEL' | 'FLIGHT' | 'HOLIDAY' | 'BUS';
  userType: 'B2C' | 'B2B';
  platform: SliderPlatform;
  mainTitle: string;
  smallSubtitle: string;
  rightItalicText: string;
  badges: SliderBadge[];
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

const STORAGE_KEY = 'tenant_admin_sliders';

const INITIAL_SLIDERS: Slider[] = [
  {
    id: 'sld-1',
    tenantId: 'tenant-easyfly',
    serviceType: 'HOTEL',
    userType: 'B2C',
    platform: 'ALL',
    mainTitle: 'Exclusive 5-Star Hotel Escapes',
    smallSubtitle: 'Save up to 35% on verified luxury properties worldwide',
    rightItalicText: 'Instant Confirmation',
    badges: [{ icon: 'verified', text: 'Best Rate Guarantee' }, { icon: 'free_cancellation', text: 'Free Cancellation' }],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    sortOrder: 1,
    isActive: true,
    createdAt: '2026-01-10 / 10:00 AM',
    modifiedAt: '2026-11-20 / 01:15 PM',
  },
  {
    id: 'sld-2',
    tenantId: 'tenant-easyfly',
    serviceType: 'HOTEL',
    userType: 'B2B',
    platform: 'WEB',
    mainTitle: 'Corporate & Agent Special Pricing',
    smallSubtitle: 'Unlock net rates, automated tax vouchers, and bulk commission tiers',
    rightItalicText: 'B2B Portal Deals',
    badges: [{ icon: 'handshake', text: 'B2B Direct Connect' }, { icon: 'receipt_long', text: 'GST Invoicing' }],
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
    sortOrder: 2,
    isActive: true,
    createdAt: '2026-01-15 / 11:30 AM',
    modifiedAt: '2026-11-22 / 11:00 AM',
  },
  {
    id: 'sld-3',
    tenantId: 'tenant-easyfly',
    serviceType: 'HOTEL',
    userType: 'B2C',
    platform: 'ANDROID',
    mainTitle: 'App Only: Flat ₹1,200 Off On First Hotel Booking',
    smallSubtitle: 'Use promo code APPFLY at mobile checkout',
    rightItalicText: 'Mobile Exclusive',
    badges: [{ icon: 'smartphone', text: 'App Only Deal' }],
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
    sortOrder: 3,
    isActive: true,
    createdAt: '2026-02-01 / 02:20 PM',
    modifiedAt: '2026-11-21 / 04:30 PM',
  },
  {
    id: 'sld-4',
    tenantId: 'tenant-easyfly',
    serviceType: 'HOLIDAY',
    userType: 'B2C',
    platform: 'IOS',
    mainTitle: 'Dubai & Bali Holiday Packages',
    smallSubtitle: 'All-inclusive resort stays with private airport transfers',
    rightItalicText: 'Limited Seats',
    badges: [{ icon: 'flight_takeoff', text: 'Flights + Hotel' }],
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    sortOrder: 4,
    isActive: false,
    createdAt: '2026-02-15 / 09:45 AM',
    modifiedAt: '2026-02-15 / 09:45 AM',
  },
];

@Injectable({ providedIn: 'root' })
export class SliderService {
  private readonly _items = signal<Slider[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly sliders = this.items;
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadFromStorage(): Slider[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Slider[];
    } catch { /* ignore */ }
    this.persist(INITIAL_SLIDERS);
    return INITIAL_SLIDERS;
  }

  private persist(items: Slider[]): void {
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

  add(payload: Omit<Slider, 'id' | 'createdAt' | 'modifiedAt'>): Observable<Slider> {
    const newItem: Slider = {
      ...payload,
      id: `sld-${Date.now()}`,
      createdAt: this.formatNow(),
      modifiedAt: this.formatNow(),
    };
    const updated = [newItem, ...this._items()];
    this._items.set(updated);
    this.persist(updated);
    return of(newItem);
  }

  addSlider(payload: Omit<Slider, 'id' | 'createdAt' | 'modifiedAt'>): Observable<Slider> {
    return this.add(payload);
  }

  update(id: string, updates: Partial<Slider>): Observable<Slider> {
    const list = this._items();
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      const updatedItem: Slider = { ...list[idx], ...updates, modifiedAt: this.formatNow() };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._items.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  updateSlider(id: string, updates: Partial<Slider>): Observable<Slider> {
    return this.update(id, updates);
  }

  delete(id: string): Observable<void> {
    const updated = this._items().filter(s => s.id !== id);
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  deleteSlider(id: string): Observable<void> {
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

  updateStatus(id: string, isActive: boolean): Observable<Slider> {
    return this.update(id, { isActive });
  }
}

import { Injectable, signal } from '@angular/core';

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

const STORAGE_KEY = 'easyflys_sliders';

// Initial seeds matching travel-api/database/seeds/slider.seed.ts
const INITIAL_SLIDERS: Slider[] = [
  {
    id: 'sld-1',
    serviceType: 'HOTEL',
    userType: 'B2C',
    platform: 'ALL',
    smallSubtitle: 'EXPLORE THE WORLD',
    mainTitle: 'Best Hotels Great Deals',
    rightItalicText: 'Travel More Live Better',
    badges: [
      { icon: 'verified_user', text: 'Best Price' },
      { icon: 'star', text: 'Verified Properties' },
      { icon: 'local_offer', text: 'Exclusive Offers' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    sortOrder: 1,
    isActive: true,
    createdAt: '15 Jan 2026 / 11:20 AM',
    modifiedAt: '-',
  },
  {
    id: 'sld-2',
    serviceType: 'FLIGHT',
    userType: 'B2C',
    platform: 'ALL',
    smallSubtitle: 'DISCOVER PARADISE',
    mainTitle: 'Fly Anywhere Best Fares',
    rightItalicText: 'Book Now Save More',
    badges: [
      { icon: 'flight_takeoff', text: 'Easy Booking' },
      { icon: 'support_agent', text: '24/7 Support' },
      { icon: 'payments', text: 'Secure Payment' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    sortOrder: 2,
    isActive: true,
    createdAt: '12 Jan 2026 / 04:45 PM',
    modifiedAt: '-',
  },
  {
    id: 'sld-3',
    serviceType: 'HOTEL',
    userType: 'B2B',
    platform: 'WEB',
    smallSubtitle: 'CORPORATE PARTNERS',
    mainTitle: 'B2B Exclusive Rates',
    rightItalicText: 'Higher Margins More Growth',
    badges: [
      { icon: 'handshake', text: 'Instant Commission' },
      { icon: 'business', text: 'Wholesale Inventory' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    sortOrder: 3,
    isActive: true,
    createdAt: '08 Jan 2026 / 09:15 AM',
    modifiedAt: '-',
  },
];

@Injectable({
  providedIn: 'root',
})
export class SliderService {
  private readonly _sliders = signal<Slider[]>(this.loadSliders());
  readonly sliders = this._sliders.asReadonly();

  private loadSliders(): Slider[] {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: Slider[] = JSON.parse(data);
        return parsed.map(item => ({
          ...item,
          platform: item.platform || 'ALL',
        }));
      }
    } catch {
      // Fallback
    }
    this.saveToStorage(INITIAL_SLIDERS);
    return INITIAL_SLIDERS;
  }

  private saveToStorage(items: Slider[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Fallback if quota exceeded
    }
  }

  addSlider(payload: Omit<Slider, 'id' | 'createdAt' | 'modifiedAt'>): Slider {
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

    const newSlider: Slider = {
      ...payload,
      id: `sld-${Date.now()}`,
      createdAt: formattedDate,
      modifiedAt: '-',
    };

    const updated = [newSlider, ...this._sliders()];
    this._sliders.set(updated);
    this.saveToStorage(updated);
    return newSlider;
  }

  updateSlider(id: string, updates: Partial<Slider>): Slider | null {
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

    let updatedItem: Slider | null = null;

    const updated = this._sliders().map(item => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          ...updates,
          modifiedAt: formattedDate,
        };
        return updatedItem;
      }
      return item;
    });

    this._sliders.set(updated);
    this.saveToStorage(updated);
    return updatedItem;
  }

  deleteSlider(id: string): void {
    const updated = this._sliders().filter(item => item.id !== id);
    this._sliders.set(updated);
    this.saveToStorage(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._sliders().filter(item => !set.has(item.id));
    this._sliders.set(updated);
    this.saveToStorage(updated);
  }

  updateStatus(id: string, isActive: boolean): void {
    this.updateSlider(id, { isActive });
  }
}

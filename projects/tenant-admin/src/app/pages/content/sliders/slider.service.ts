import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

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
export class SliderService extends BaseApiCrudService<Slider> {
  protected readonly endpoint = '/sliders';
  readonly sliders = this.items;

  constructor() {
    super();
    this.load();
  }

  addSlider(payload: Omit<Slider, 'id' | 'createdAt' | 'modifiedAt'>): Observable<Slider> {
    return this.add(payload);
  }

  updateSlider(id: string, updates: Partial<Slider>): Observable<Slider> {
    return this.update(id, updates);
  }

  deleteSlider(id: string): Observable<void> {
    return this.delete(id);
  }

  updateStatus(id: string, isActive: boolean): Observable<Slider> {
    return this.update(id, { isActive });
  }
}

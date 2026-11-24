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

@Injectable({ providedIn: 'root' })
export class SliderService extends BaseApiCrudService<Slider> {
  protected readonly endpoint = '/feature/sliders/admin';
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

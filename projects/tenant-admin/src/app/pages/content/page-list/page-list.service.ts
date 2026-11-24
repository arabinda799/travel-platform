import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

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
export class PageListService extends BaseApiCrudService<PageItem> {
  protected readonly endpoint = '/pages';
  readonly pages = this.items;

  constructor() {
    super();
    this.load();
  }

  addPage(payload: Omit<PageItem, 'id' | 'createdAt' | 'updatedAt'>): Observable<PageItem> {
    return this.add(payload);
  }

  updatePage(id: string, updates: Partial<PageItem>): Observable<PageItem> {
    return this.update(id, updates);
  }

  deletePage(id: string): Observable<void> {
    return this.delete(id);
  }
}

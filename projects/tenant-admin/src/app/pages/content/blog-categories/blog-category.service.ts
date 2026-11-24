import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

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
export class BlogCategoryService extends BaseApiCrudService<BlogCategory> {
  protected readonly endpoint = '/blog-categories';
  get categories() { return this.items; }

  constructor() {
    super();
    this.load();
  }

  addCategory(data: Omit<BlogCategory, 'id' | 'createdAt' | 'modifiedAt'>): Observable<BlogCategory> {
    return this.add(data);
  }

  updateCategory(id: string, data: Partial<BlogCategory>): Observable<BlogCategory> {
    return this.update(id, data);
  }

  deleteCategory(id: string): Observable<void> {
    return this.delete(id);
  }

  updateStatus(id: string, status: 'Active' | 'Inactive'): Observable<BlogCategory> {
    return this.update(id, { status });
  }
}

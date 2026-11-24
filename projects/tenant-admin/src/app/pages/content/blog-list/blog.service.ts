import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

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
export class BlogService extends BaseApiCrudService<BlogPost> {
  protected readonly endpoint = '/blog-posts';
  readonly blogs = this.items;

  constructor() {
    super();
    this.load();
  }

  addBlog(data: Omit<BlogPost, 'id' | 'createdAt' | 'modifiedAt'>): Observable<BlogPost> {
    return this.add(data);
  }

  updateBlog(id: string, data: Partial<BlogPost>): Observable<BlogPost> {
    return this.update(id, data);
  }

  deleteBlog(id: string): Observable<void> {
    return this.delete(id);
  }

  updateStatus(id: string, status: 'Active' | 'Inactive'): Observable<BlogPost> {
    return this.update(id, { status });
  }
}

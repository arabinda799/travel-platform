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

const STORAGE_KEY = 'easyflys_blog_categories';

const INITIAL_CATEGORIES: BlogCategory[] = [
  {
    id: 'bc-1',
    name: 'Bali Tour & Customizable Bali Tour Packages 2025',
    slug: 'bali-tour-packages-2025',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=160&q=80',
    description: '<p>Complete guide to luxury and budget tours across Bali, Nusa Penida, and Ubud.</p>',
    status: 'Active',
    metaRobots: 'INDEX, FOLLOW',
    metaTitle: 'Bali Tour & Customizable Packages 2025',
    metaKeyword: 'bali tour, packages, indonesia travel',
    metaDescription: 'Find customized Bali tour packages for unforgettable vacation experiences.',
    createdAt: '10 Dec 2025 / 5:33 PM',
    modifiedAt: '-',
  },
  {
    id: 'bc-2',
    name: 'Exploring the World: Your Ultimate Dream Tour Itinerary',
    slug: 'exploring-the-world-ultimate-itinerary',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=160&q=80',
    description: '<p>Curated dream destinations, travel itineraries, flights, and stay recommendations worldwide.</p>',
    status: 'Active',
    metaRobots: 'INDEX, FOLLOW',
    metaTitle: 'Exploring the World: Your Ultimate Dream Tour Itinerary',
    metaKeyword: 'world tour, dream travel, itineraries',
    metaDescription: 'Step-by-step itineraries to explore top world destinations.',
    createdAt: '06 Dec 2025 / 4:44 PM',
    modifiedAt: '-',
  },
  {
    id: 'bc-3',
    name: 'Test',
    slug: 'test',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=160&q=80',
    description: '<p>Testing blog category record for CRS content testing.</p>',
    status: 'Active',
    metaRobots: 'INDEX, FOLLOW',
    metaTitle: 'Test Blog Category',
    metaKeyword: 'test, sample',
    metaDescription: 'Test meta description content.',
    createdAt: '29 Mar 2025 / 1:34 PM',
    modifiedAt: '-',
  },
];

import { Injectable, Signal } from '@angular/core';
import { BaseCrudService, formatTimestamp } from 'admin-core';

@Injectable({
  providedIn: 'root',
})
export class BlogCategoryService extends BaseCrudService<BlogCategory> {
  protected override storageKey = STORAGE_KEY;

  constructor() {
    super();
    this.itemsSignal.set(this.loadFromStorage(INITIAL_CATEGORIES));
  }

  get categories(): Signal<BlogCategory[]> {
    return this.items;
  }

  addCategory(data: Omit<BlogCategory, 'id' | 'createdAt' | 'modifiedAt'>): BlogCategory {
    const newCategory: BlogCategory = {
      ...data,
      id: `bc-${Date.now()}`,
      status: 'Active', // Default status is always Active on Add
      createdAt: formatTimestamp(),
      modifiedAt: '-',
    };
    return this.add(newCategory);
  }

  updateCategory(id: string, data: Partial<BlogCategory>): BlogCategory | null {
    return this.update(id, {
      ...data,
      modifiedAt: formatTimestamp(),
    });
  }

  deleteCategory(id: string): void {
    this.delete(id);
  }

  updateStatus(id: string, status: 'Active' | 'Inactive'): void {
    this.updateCategory(id, { status });
  }
}

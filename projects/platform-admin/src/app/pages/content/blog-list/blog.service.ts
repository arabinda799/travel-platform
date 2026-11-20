import { Injectable, signal } from '@angular/core';

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

const STORAGE_KEY = 'easyflys_blog_posts';

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Georgia Tour Package',
    slug: 'georgia-tour-package',
    categoryId: 'bc-2',
    categoryName: 'Exploring the World: Your Ultimate Dream Tour Itinerary',
    image: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=160&q=80',
    description: '<p>Discover Tbilisi, Kazbegi, and the Caucasus mountains with our curated Georgia tour package.</p>',
    status: 'Active',
    postedBy: 'Admin',
    metaRobots: 'INDEX, FOLLOW',
    metaTitle: 'Georgia Tour Package | Easyflys',
    metaKeyword: 'georgia tour, tbilisi, kazbegi, caucasus travel',
    metaDescription: 'Explore Georgia with customizable tour packages, flights, and guided itineraries.',
    createdAt: '29 Mar 2025 / 1:35 PM',
    modifiedAt: '11 Dec 2025 / 2:21 PM',
  },
  {
    id: 'blog-2',
    title: 'EXPLORE DUBAI',
    slug: 'explore-dubai',
    categoryId: 'bc-2',
    categoryName: 'Exploring the World: Your Ultimate Dream Tour Itinerary',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=160&q=80',
    description: '<p>Experience luxury shopping, desert safaris, and iconic skyline views in Dubai.</p>',
    status: 'Active',
    postedBy: 'Admin',
    metaRobots: 'INDEX, FOLLOW',
    metaTitle: 'Explore Dubai | Easyflys',
    metaKeyword: 'dubai tour, uae travel, desert safari, burj khalifa',
    metaDescription: 'Plan your dream Dubai vacation with our complete travel guide and packages.',
    createdAt: '10 Dec 2025 / 5:01 PM',
    modifiedAt: '04 Feb 2026 / 3:03 PM',
  },
  {
    id: 'blog-3',
    title: 'Bali Tour & Customizable Bali Tour Packages 2026',
    slug: 'bali-tour-customizable-bali-tour-packages-2026',
    categoryId: 'bc-1',
    categoryName: 'Bali Tour & Customizable Bali Tour Packages 2025',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=160&q=80',
    description: '<p>Handcrafted Bali itineraries covering Ubud, Seminyak, Nusa Penida, and cultural temples.</p>',
    status: 'Active',
    postedBy: 'KOCHI HOLIDAY TEAM',
    metaRobots: 'INDEX, FOLLOW',
    metaTitle: 'Bali Tour & Customizable Bali Tour Packages 2026',
    metaKeyword: 'bali tour 2026, ubud, nusa penida, bali packages',
    metaDescription: 'Book customizable Bali tour packages for 2026 with flights and resort stays.',
    createdAt: '19 Dec 2025 / 3:59 PM',
    modifiedAt: '-',
  },
  {
    id: 'blog-4',
    title: 'Maldives Tour Package. 3N/4D',
    slug: 'explore-male',
    categoryId: 'bc-1',
    categoryName: 'Bali Tour & Customizable Bali Tour Packages 2025',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=160&q=80',
    description: '<p>Relax in overwater villas and crystal-clear lagoons with our 3N/4D Maldives getaway.</p>',
    status: 'Active',
    postedBy: 'KOCHI HOLIDAY TEAM',
    metaRobots: 'INDEX, FOLLOW',
    metaTitle: 'Maldives Tour Package 3N/4D | Explore Male',
    metaKeyword: 'maldives tour, male, overwater villa, honeymoon package',
    metaDescription: '3 Nights / 4 Days Maldives tour package with water villa stays and transfers.',
    createdAt: '27 Dec 2025 / 3:40 PM',
    modifiedAt: '-',
  },
  {
    id: 'blog-5',
    title: 'THAILAND',
    slug: 'bangkok-pattaya',
    categoryId: 'bc-2',
    categoryName: 'Exploring the World: Your Ultimate Dream Tour Itinerary',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=160&q=80',
    description: '<p>Vibrant Bangkok street life, Pattaya beaches, and island hopping adventures.</p>',
    status: 'Active',
    postedBy: 'Admin',
    metaRobots: 'INDEX, FOLLOW',
    metaTitle: 'Thailand Tour | Bangkok - Pattaya',
    metaKeyword: 'thailand tour, bangkok, pattaya, island hopping',
    metaDescription: 'Explore Bangkok and Pattaya with our best-selling Thailand holiday packages.',
    createdAt: '04 Feb 2026 / 3:56 PM',
    modifiedAt: '-',
  },
];

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private readonly blogsSignal = signal<BlogPost[]>(this.loadFromSession());
  readonly blogs = this.blogsSignal.asReadonly();

  private loadFromSession(): BlogPost[] {
    if (typeof window === 'undefined') return INITIAL_BLOGS;
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading blog posts from sessionStorage', e);
    }
    this.saveToSession(INITIAL_BLOGS);
    return INITIAL_BLOGS;
  }

  private saveToSession(items: BlogPost[]): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error persisting blog posts to sessionStorage', e);
    }
  }

  private formatNow(): string {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()} / ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  addBlog(data: Omit<BlogPost, 'id' | 'createdAt' | 'modifiedAt'>): BlogPost {
    const newBlog: BlogPost = {
      ...data,
      id: `blog-${Date.now()}`,
      createdAt: this.formatNow(),
      modifiedAt: '-',
    };

    const updated = [newBlog, ...this.blogsSignal()];
    this.blogsSignal.set(updated);
    this.saveToSession(updated);
    return newBlog;
  }

  updateBlog(id: string, data: Partial<BlogPost>): BlogPost | null {
    const current = this.blogsSignal();
    const index = current.findIndex(b => b.id === id);
    if (index === -1) return null;

    const updatedItem: BlogPost = {
      ...current[index],
      ...data,
      modifiedAt: this.formatNow(),
    };

    const nextList = [...current];
    nextList[index] = updatedItem;

    this.blogsSignal.set(nextList);
    this.saveToSession(nextList);
    return updatedItem;
  }

  deleteBlog(id: string): void {
    const filtered = this.blogsSignal().filter(b => b.id !== id);
    this.blogsSignal.set(filtered);
    this.saveToSession(filtered);
  }

  deleteMultiple(ids: string[]): void {
    const filtered = this.blogsSignal().filter(b => !ids.includes(b.id));
    this.blogsSignal.set(filtered);
    this.saveToSession(filtered);
  }

  updateStatus(id: string, status: 'Active' | 'Inactive'): void {
    this.updateBlog(id, { status });
  }
}

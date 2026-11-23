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

@Injectable({ providedIn: 'root' })
export class BlogCategoryService extends BaseApiCrudService<BlogCategory> {
  protected readonly endpoint = '/blog-categories';

  get categories() { return this.items; }

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

import { Injectable } from '@angular/core';
import { BaseApiCrudService } from 'admin-core';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  status: 'Active' | 'Inactive';
  metaTitle: string;
  metaKeyword: string;
  metaDescription: string;
  createdAt: string;
  modifiedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BlogCategoryService extends BaseApiCrudService<BlogCategory> {
  protected readonly endpoint = '/feature/blogs/categories/admin';
  readonly categories = this.items;
}

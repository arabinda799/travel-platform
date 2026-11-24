import { Injectable } from '@angular/core';
import { BaseApiCrudService } from 'admin-core';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  categoryId: string | null;
  categoryName: string;
  image: string;
  description: string;
  status: 'Active' | 'Inactive';
  postedBy: string;
  metaTitle: string;
  metaKeyword: string;
  metaDescription: string;
  createdAt: string;
  modifiedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BlogService extends BaseApiCrudService<BlogPost> {
  protected readonly endpoint = '/feature/blogs/admin';
  readonly posts = this.items;
}

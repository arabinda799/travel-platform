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

@Injectable({ providedIn: 'root' })
export class BlogService extends BaseApiCrudService<BlogPost> {
  protected readonly endpoint = '/blog-posts';

  readonly blogs = this.items;

  addBlog(data: Omit<BlogPost, 'id' | 'createdAt' | 'modifiedAt'>): Observable<BlogPost> {
    return this.add(data);
  }

  updateBlog(id: string, data: Partial<BlogPost>): Observable<BlogPost> {
    return this.update(id, data);
  }

  deleteBlog(id: string): Observable<void> {
    return this.delete(id);
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.deleteMultiple(ids);
  }

  updateStatus(id: string, status: 'Active' | 'Inactive'): Observable<BlogPost> {
    return this.update(id, { status });
  }
}

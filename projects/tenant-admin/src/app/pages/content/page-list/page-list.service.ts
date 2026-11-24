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

@Injectable({ providedIn: 'root' })
export class PageListService extends BaseApiCrudService<PageItem> {
  protected readonly endpoint = '/feature/pages/admin';
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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  phone?: string;
  queryType: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved';
  createdDate: string;
}

@Injectable({ providedIn: 'root' })
export class ContactQueriesService extends BaseApiCrudService<ContactQuery> {
  protected readonly endpoint = '/feature/contact-queries/admin';
  readonly queries = this.items;

  constructor() {
    super();
    this.load();
  }

  updateStatus(id: string, status: 'New' | 'In Progress' | 'Resolved'): Observable<ContactQuery> {
    return this.update(id, { status });
  }

  deleteQuery(id: string): Observable<void> {
    return this.delete(id);
  }
}

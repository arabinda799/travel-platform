import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

export type CustomerStatus = 'Active' | 'Inactive' | 'Blocked';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  status: CustomerStatus;
  registeredAt: string;
  lastLogin: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerService extends BaseApiCrudService<Customer> {
  protected readonly endpoint = '/shared/customers';

  readonly customers = this.items;

  updateStatus(id: string, status: CustomerStatus): Observable<Customer> {
    return this.update(id, { status });
  }
}

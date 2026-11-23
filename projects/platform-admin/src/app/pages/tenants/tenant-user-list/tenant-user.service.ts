import { Injectable } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

export type TenantUserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

export interface TenantUser {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  status: TenantUserStatus;
  disabledPermissionIds: string[];
  isPrimary: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class TenantUserService extends BaseApiCrudService<TenantUser> {
  protected readonly endpoint = '/tenant-users';

  readonly users = this.items;

  loadByTenant(tenantId: string): void {
    this.load({ tenantId });
  }

  updateDisabledPermissions(id: string, disabledPermissionIds: string[]): Observable<TenantUser> {
    return this.api.patch<TenantUser>(`${this.endpoint}/${id}/permissions`, { disabledPermissionIds }).pipe(
      take(1),
      tap(updated => this._items.update(list => list.map(u => u.id === id ? updated : u))),
    );
  }
}

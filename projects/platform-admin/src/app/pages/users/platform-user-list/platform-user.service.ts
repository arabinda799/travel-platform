import { Injectable, inject } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

export type PlatformUserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

export interface PlatformUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  status: PlatformUserStatus;
  disabledPermissionIds: string[];
  isPrimary: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class PlatformUserService extends BaseApiCrudService<PlatformUser> {
  protected readonly endpoint = '/platform-users';

  // Alias so existing component code using users() needs no changes
  readonly users = this.items;

  updateDisabledPermissions(id: string, disabledPermissionIds: string[]): Observable<PlatformUser> {
    return this.api.patch<PlatformUser>(`${this.endpoint}/${id}/permissions`, { disabledPermissionIds }).pipe(
      take(1),
      tap(updated => this._items.update(list => list.map(u => u.id === id ? updated : u))),
    );
  }
}

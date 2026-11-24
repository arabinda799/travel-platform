import { Injectable } from '@angular/core';
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
  protected readonly endpoint = '/tenant/users';
  readonly users = this.items;

  constructor() {
    super();
    this.load();
  }

  override add(payload: Partial<PlatformUser>): Observable<PlatformUser> {
    return super.add(payload);
  }

  override update(id: string, payload: Partial<PlatformUser>): Observable<PlatformUser> {
    return super.update(id, payload);
  }

  loadById(id: string): Observable<PlatformUser> {
    return this.api.get<PlatformUser>(`${this.endpoint}/${id}`).pipe(
      take(1),
      tap(user => {
        this._items.update(list => {
          const idx = list.findIndex(u => u.id === id);
          return idx >= 0 ? list.map((u, i) => i === idx ? user : u) : [user, ...list];
        });
      }),
    );
  }

  updateDisabledPermissions(id: string, disabledPermissionIds: string[]): Observable<PlatformUser> {
    return this.api.patch<PlatformUser>(`${this.endpoint}/${id}/permissions`, { disabledPermissionIds }).pipe(
      take(1),
      tap(updated => this._items.update(list => list.map(u => u.id === id ? updated : u))),
    );
  }

  override delete(id: string): Observable<void> {
    return super.delete(id);
  }

  override deleteMultiple(ids: string[]): Observable<void> {
    return super.deleteMultiple(ids);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PageContainerComponent, ButtonComponent } from 'admin-core';
import { Role, RoleService } from '../../users/role-list/role.service';
import { PERMISSION_GROUPS, PermGroup } from '../../users/role-permissions/role-permissions';
import { TenantUser, TenantUserService } from '../tenant-user-list/tenant-user.service';

@Component({
  selector: 'app-tenant-user-permissions',
  standalone: true,
  imports: [PageContainerComponent, ButtonComponent],
  templateUrl: './tenant-user-permissions.html',
  styleUrl: './tenant-user-permissions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantUserPermissionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(TenantUserService);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);

  readonly userId = signal<string>('');

  readonly user = computed<TenantUser | null>(() =>
    this.userService.users().find(u => u.id === this.userId()) ?? null,
  );

  readonly role = computed<Role | null>(() => {
    const u = this.user();
    if (!u) return null;
    return this.roleService.roles().find(r => r.id === u.roleId) ?? null;
  });

  readonly rolePermSet = computed<Set<string>>(() => new Set(this.role()?.permissionIds ?? []));
  readonly draftDisabledIds = signal<string[]>([]);
  readonly draftDisabledSet = computed(() => new Set(this.draftDisabledIds()));
  readonly expandedGroups = signal<Set<string>>(new Set(PERMISSION_GROUPS.map(g => g.key)));
  readonly permissionGroups = PERMISSION_GROUPS;
  readonly rolePermCount = computed(() => this.role()?.permissionIds.length ?? 0);
  readonly disabledCount = computed(() => this.draftDisabledIds().length);
  readonly effectiveCount = computed(() => this.rolePermCount() - this.disabledCount());

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.userId.set(id);
      const user = this.userService.users().find(u => u.id === id);
      if (user) this.draftDisabledIds.set([...user.disabledPermissionIds]);
    }
  }

  readonly breadcrumbs = computed(() => {
    const u = this.user();
    return [
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Tenant Management' },
      { label: 'Tenant Users', route: '/tenants/users' },
      { label: u ? `${u.firstName} ${u.lastName}` : 'Permissions' },
    ];
  });

  isInRole(id: string): boolean { return this.rolePermSet().has(id); }
  isDisabled(id: string): boolean { return this.draftDisabledSet().has(id); }
  isExpanded(key: string): boolean { return this.expandedGroups().has(key); }

  toggleExpand(key: string): void {
    const s = new Set(this.expandedGroups());
    if (s.has(key)) { s.delete(key); } else { s.add(key); }
    this.expandedGroups.set(s);
  }

  expandAll(): void { this.expandedGroups.set(new Set(PERMISSION_GROUPS.map(g => g.key))); }
  collapseAll(): void { this.expandedGroups.set(new Set()); }

  toggleRestrict(id: string): void {
    if (!this.isInRole(id)) return;
    const s = new Set(this.draftDisabledIds());
    if (s.has(id)) { s.delete(id); } else { s.add(id); }
    this.draftDisabledIds.set([...s]);
  }

  restrictGroup(group: PermGroup): void {
    const rolePerms = this.rolePermSet();
    const s = new Set(this.draftDisabledIds());
    group.allPermIds.filter(id => rolePerms.has(id)).forEach(id => s.add(id));
    this.draftDisabledIds.set([...s]);
  }

  allowGroup(group: PermGroup): void {
    const s = new Set(this.draftDisabledIds());
    group.allPermIds.forEach(id => s.delete(id));
    this.draftDisabledIds.set([...s]);
  }

  groupRoleCount(group: PermGroup): number {
    const rolePerms = this.rolePermSet();
    return group.allPermIds.filter(id => rolePerms.has(id)).length;
  }

  groupRestrictedCount(group: PermGroup): number {
    const disabled = this.draftDisabledSet();
    return group.allPermIds.filter(id => disabled.has(id)).length;
  }

  clearAllRestrictions(): void { this.draftDisabledIds.set([]); }

  restrictAll(): void {
    this.draftDisabledIds.set([...this.rolePermSet()]);
  }

  save(): void {
    const user = this.user();
    if (!user) return;
    this.userService.updateDisabledPermissions(user.id, this.draftDisabledIds());
    const name = `${user.firstName} ${user.lastName}`;
    this.messageService.add({
      severity: 'success',
      summary: 'Permissions Updated',
      detail: `${name}: ${this.effectiveCount()} active, ${this.disabledCount()} restricted.`,
    });
    this.router.navigate(['/tenants/users']);
  }

  goBack(): void { this.router.navigate(['/tenants/users']); }
}

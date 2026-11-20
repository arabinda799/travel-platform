import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PageContainerComponent, ButtonComponent } from 'admin-core';
import { ALL_PERMISSIONS, MODULE_TITLES, Role, RoleService } from '../role-list/role.service';
import { PERMISSION_GROUPS, PermGroup, TOTAL_PERM_COUNT } from '../role-permissions/role-permissions';
import { PlatformUser, PlatformUserService } from '../platform-user-list/platform-user.service';

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [PageContainerComponent, ButtonComponent],
  templateUrl: './user-permissions.html',
  styleUrl: './user-permissions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPermissionsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(PlatformUserService);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);

  readonly userId = signal<string>('');

  readonly user = computed<PlatformUser | null>(() =>
    this.userService.users().find(u => u.id === this.userId()) ?? null,
  );

  readonly role = computed<Role | null>(() => {
    const u = this.user();
    if (!u) return null;
    return this.roleService.roles().find(r => r.id === u.roleId) ?? null;
  });

  // Set of permission IDs that are IN the assigned role
  readonly rolePermSet = computed<Set<string>>(() => new Set(this.role()?.permissionIds ?? []));

  // Draft: set of permission IDs that are DISABLED for this user (overrides)
  readonly draftDisabledIds = signal<string[]>([]);
  readonly draftDisabledSet = computed(() => new Set(this.draftDisabledIds()));

  // Accordion state
  readonly expandedGroups = signal<Set<string>>(new Set(PERMISSION_GROUPS.map(g => g.key)));

  readonly permissionGroups = PERMISSION_GROUPS;
  readonly totalPermCount = TOTAL_PERM_COUNT;

  readonly rolePermCount = computed(() => this.role()?.permissionIds.length ?? 0);
  readonly disabledCount = computed(() => this.draftDisabledIds().length);
  readonly effectiveCount = computed(() => this.rolePermCount() - this.disabledCount());

  constructor() {
    effect(() => {
      const id = this.route.snapshot.params['id'];
      if (id) {
        this.userId.set(id);
        const user = this.userService.users().find(u => u.id === id);
        if (user) this.draftDisabledIds.set([...user.disabledPermissionIds]);
      }
    });
  }

  readonly breadcrumbs = computed(() => {
    const u = this.user();
    return [
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Users & Access' },
      { label: 'Platform Users', route: '/users/platform' },
      { label: u ? `${u.firstName} ${u.lastName}` : 'Permissions' },
    ];
  });

  // ─── Permission state helpers ──────────────────────────────────────────────

  /** Is this permission available in the user's role? */
  isInRole(id: string): boolean { return this.rolePermSet().has(id); }

  /** Is this permission currently disabled (restricted) for this user? */
  isDisabled(id: string): boolean { return this.draftDisabledSet().has(id); }

  /** Is this permission effectively active (in role AND not disabled)? */
  isActive(id: string): boolean { return this.isInRole(id) && !this.isDisabled(id); }

  isExpanded(key: string): boolean { return this.expandedGroups().has(key); }

  toggleExpand(key: string): void {
    const s = new Set(this.expandedGroups());
    if (s.has(key)) { s.delete(key); } else { s.add(key); }
    this.expandedGroups.set(s);
  }

  expandAll(): void { this.expandedGroups.set(new Set(PERMISSION_GROUPS.map(g => g.key))); }
  collapseAll(): void { this.expandedGroups.set(new Set()); }

  /** Toggle restriction: enabling/disabling a specific permission for this user */
  toggleRestrict(id: string): void {
    if (!this.isInRole(id)) return; // can't toggle what role doesn't have
    const s = new Set(this.draftDisabledIds());
    if (s.has(id)) { s.delete(id); } else { s.add(id); }
    this.draftDisabledIds.set([...s]);
  }

  /** Restrict all permissions in a group (disable all role permissions in group) */
  restrictGroup(group: PermGroup): void {
    const rolePerms = this.rolePermSet();
    const s = new Set(this.draftDisabledIds());
    group.allPermIds.filter(id => rolePerms.has(id)).forEach(id => s.add(id));
    this.draftDisabledIds.set([...s]);
  }

  /** Allow all permissions in a group (remove all disabled in group) */
  allowGroup(group: PermGroup): void {
    const s = new Set(this.draftDisabledIds());
    group.allPermIds.forEach(id => s.delete(id));
    this.draftDisabledIds.set([...s]);
  }

  isGroupAllAllowed(group: PermGroup): boolean {
    const rolePerms = this.rolePermSet();
    const disabled = this.draftDisabledSet();
    return group.allPermIds.filter(id => rolePerms.has(id)).every(id => !disabled.has(id));
  }

  isGroupAllRestricted(group: PermGroup): boolean {
    const rolePerms = this.rolePermSet();
    const disabled = this.draftDisabledSet();
    const roleGroupPerms = group.allPermIds.filter(id => rolePerms.has(id));
    return roleGroupPerms.length > 0 && roleGroupPerms.every(id => disabled.has(id));
  }

  isGroupPartial(group: PermGroup): boolean {
    return !this.isGroupAllAllowed(group) && !this.isGroupAllRestricted(group);
  }

  /** How many in this group are from role? */
  groupRoleCount(group: PermGroup): number {
    const rolePerms = this.rolePermSet();
    return group.allPermIds.filter(id => rolePerms.has(id)).length;
  }

  /** How many in this group are restricted? */
  groupRestrictedCount(group: PermGroup): number {
    const disabled = this.draftDisabledSet();
    return group.allPermIds.filter(id => disabled.has(id)).length;
  }

  clearAllRestrictions(): void { this.draftDisabledIds.set([]); }

  restrictAll(): void {
    const rolePerms = this.rolePermSet();
    this.draftDisabledIds.set([...rolePerms]);
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
    this.router.navigate(['/users/platform']);
  }

  goBack(): void { this.router.navigate(['/users/platform']); }
}

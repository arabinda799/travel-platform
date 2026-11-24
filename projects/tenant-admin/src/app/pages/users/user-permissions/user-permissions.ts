import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PageContainerComponent, ButtonComponent } from 'admin-core';
import { Role, RoleService } from '../role-list/role.service';
import { PERMISSION_GROUPS, PermGroup } from '../role-permissions/role-permissions';
import { PlatformUser, PlatformUserService } from '../staff-user-list/staff-user.service';

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [PageContainerComponent, ButtonComponent],
  templateUrl: './user-permissions.html',
  styleUrl: './user-permissions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPermissionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(PlatformUserService);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

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

  readonly rolePermCount = computed(() => this.role()?.permissionIds.length ?? 0);
  readonly disabledCount = computed(() => this.draftDisabledIds().length);
  readonly effectiveCount = computed(() => this.rolePermCount() - this.disabledCount());

  readonly loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (!id) return;
    this.userId.set(id);

    const cached = this.userService.users().find(u => u.id === id);
    if (cached) {
      this.draftDisabledIds.set([...cached.disabledPermissionIds]);
      this._ensureRoleLoaded(cached.roleId);
    } else {
      this.loading.set(true);
      this.userService.loadById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: user => {
            this.draftDisabledIds.set([...user.disabledPermissionIds]);
            this.loading.set(false);
            this._ensureRoleLoaded(user.roleId);
          },
          error: () => {
            this.loading.set(false);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user.' });
          },
        });
    }
  }

  private _ensureRoleLoaded(roleId: string): void {
    if (!this.roleService.roles().find(r => r.id === roleId)) {
      this.roleService.loadById(roleId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  readonly breadcrumbs = computed(() => {
    const u = this.user();
    return [
      { label: 'Dashboard', route: '/' },
      { label: 'Users & Access' },
      { label: 'Staff Users', route: '/users/staff' },
      { label: u ? `${u.firstName} ${u.lastName}` : 'Permissions' },
    ];
  });

  // ─── Permission state helpers ──────────────────────────────────────────────

  /** Is this permission available in the user's role? */
  isInRole(id: string): boolean { return this.rolePermSet().has(id); }

  /** Is this permission currently disabled (restricted) for this user? */
  isDisabled(id: string): boolean { return this.draftDisabledSet().has(id); }
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
    const name = `${user.firstName} ${user.lastName}`;
    this.userService.updateDisabledPermissions(user.id, this.draftDisabledIds())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Permissions Updated',
            detail: `${name}: ${this.effectiveCount()} active, ${this.disabledCount()} restricted.`,
          });
          this.router.navigate(['/users/staff']);
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save permissions.' }),
      });
  }

  goBack(): void { this.router.navigate(['/users/staff']); }
}

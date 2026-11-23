import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  ButtonComponent,
} from 'admin-core';
import { ALL_PERMISSIONS, MODULE_TITLES, Role, RoleService } from '../role-list/role.service';

// ─── Permission matrix types ──────────────────────────────────────────────────

interface PermCol { key: string; label: string; }
interface PermRow { key: string; label: string; permMap: Record<string, string>; }

export interface PermGroup {
  key: string;
  label: string;
  parentViewPermId: string | null;
  columns: PermCol[];
  rows: PermRow[];
  allPermIds: string[];
}

const ACTION_LABEL: Record<string, string> = {
  VIEW: 'View', ADD: 'Add', EDIT: 'Edit', DELETE: 'Delete', STATUS: 'Status',
  EXPORT: 'Export', CHANGE_PASSWORD: 'Chg Pwd', IMPERSONATE: 'Impersonate',
  CREDIT: 'Credit', DEBIT: 'Debit', CREDIT_LIMIT: 'Crd Limit', RESEND: 'Resend',
};

const ACTION_ORDER = ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'EXPORT', 'CHANGE_PASSWORD', 'IMPERSONATE', 'CREDIT', 'DEBIT', 'CREDIT_LIMIT', 'RESEND'];

function buildPermissionGroups(): PermGroup[] {
  const parentKeys = new Set(
    ALL_PERMISSIONS.map(p => p.parentKey).filter((k): k is string => k !== null),
  );
  const childrenByParent = new Map<string, typeof ALL_PERMISSIONS>();
  for (const perm of ALL_PERMISSIONS) {
    if (perm.parentKey) {
      if (!childrenByParent.has(perm.parentKey)) childrenByParent.set(perm.parentKey, []);
      childrenByParent.get(perm.parentKey)!.push(perm);
    }
  }

  const groups: PermGroup[] = [];
  const processedParents = new Set<string>();

  for (const perm of ALL_PERMISSIONS) {
    if (!perm.parentKey) continue;
    const parentKey = perm.parentKey;
    if (processedParents.has(parentKey)) continue;
    processedParents.add(parentKey);

    const children = childrenByParent.get(parentKey) ?? [];
    const moduleKeys = [...new Set(children.map(p => p.moduleKey))];
    const actionKeys = [...new Set(children.map(p => p.actionKey))];
    actionKeys.sort((a, b) => ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b));
    const columns: PermCol[] = actionKeys.map(k => ({ key: k, label: ACTION_LABEL[k] ?? k }));
    const rows: PermRow[] = moduleKeys.map(mk => {
      const permMap: Record<string, string> = {};
      children.filter(p => p.moduleKey === mk).forEach(p => { permMap[p.actionKey] = p.id; });
      return { key: mk, label: MODULE_TITLES[mk] ?? mk, permMap };
    });
    const parentViewPerm = ALL_PERMISSIONS.find(p => !p.parentKey && p.moduleKey === parentKey && p.actionKey === 'VIEW');
    const allPermIds = [...(parentViewPerm ? [parentViewPerm.id] : []), ...children.map(p => p.id)];
    groups.push({ key: parentKey, label: MODULE_TITLES[parentKey] ?? parentKey, parentViewPermId: parentViewPerm?.id ?? null, columns, rows, allPermIds });
  }

  // Standalone modules (no parent in hierarchy)
  const standaloneKeys = [...new Set(
    ALL_PERMISSIONS.filter(p => !p.parentKey && !parentKeys.has(p.moduleKey)).map(p => p.moduleKey),
  )];
  if (standaloneKeys.length > 0) {
    const standalonePerms = ALL_PERMISSIONS.filter(p => standaloneKeys.includes(p.moduleKey));
    const actionKeys = [...new Set(standalonePerms.map(p => p.actionKey))];
    actionKeys.sort((a, b) => ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b));
    const columns = actionKeys.map(k => ({ key: k, label: ACTION_LABEL[k] ?? k }));
    const rows = standaloneKeys.map(mk => {
      const permMap: Record<string, string> = {};
      standalonePerms.filter(p => p.moduleKey === mk).forEach(p => { permMap[p.actionKey] = p.id; });
      return { key: mk, label: MODULE_TITLES[mk] ?? mk, permMap };
    });
    groups.push({ key: 'GENERAL', label: 'General', parentViewPermId: null, columns, rows, allPermIds: standalonePerms.map(p => p.id) });
  }

  return groups;
}

export const PERMISSION_GROUPS: PermGroup[] = buildPermissionGroups();
export const TOTAL_PERM_COUNT = ALL_PERMISSIONS.length;

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [PageContainerComponent, ButtonComponent],
  templateUrl: './role-permissions.html',
  styleUrl: './role-permissions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePermissionsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly roleId = signal<string>('');
  readonly role = computed<Role | null>(() =>
    this.roleService.roles().find(r => r.id === this.roleId()) ?? null,
  );

  // Draft permission state
  readonly draftPermIds = signal<string[]>([]);
  readonly draftPermSet = computed(() => new Set(this.draftPermIds()));
  readonly selectedPermCount = computed(() => this.draftPermIds().length);

  // Accordion state: all groups expanded by default
  readonly expandedGroups = signal<Set<string>>(new Set(PERMISSION_GROUPS.map(g => g.key)));

  readonly permissionGroups = PERMISSION_GROUPS;
  readonly totalPermCount = TOTAL_PERM_COUNT;

  constructor() {
    effect(() => {
      const id = this.route.snapshot.params['id'];
      if (id) {
        this.roleId.set(id);
        const role = this.roleService.roles().find(r => r.id === id);
        if (role) this.draftPermIds.set([...role.permissionIds]);
      }
    });
  }

  readonly breadcrumbs = computed(() => {
    const r = this.role();
    return [
      { label: 'Dashboard', route: '/' },
      { label: 'Users & Access' },
      { label: 'Roles & Permissions', route: '/users/roles' },
      { label: r ? r.name : 'Permissions' },
    ];
  });

  // ─── Accordion ─────────────────────────────────────────────────────────────

  isExpanded(key: string): boolean { return this.expandedGroups().has(key); }

  toggleExpand(key: string): void {
    const s = new Set(this.expandedGroups());
    if (s.has(key)) { s.delete(key); } else { s.add(key); }
    this.expandedGroups.set(s);
  }

  expandAll(): void { this.expandedGroups.set(new Set(PERMISSION_GROUPS.map(g => g.key))); }
  collapseAll(): void { this.expandedGroups.set(new Set()); }

  // ─── Permission toggles ────────────────────────────────────────────────────

  isPermSelected(id: string): boolean { return this.draftPermSet().has(id); }

  isGroupAllSelected(group: PermGroup): boolean {
    const s = this.draftPermSet();
    return group.allPermIds.every(id => s.has(id));
  }

  isGroupPartialSelected(group: PermGroup): boolean {
    const s = this.draftPermSet();
    const some = group.allPermIds.some(id => s.has(id));
    return some && !group.allPermIds.every(id => s.has(id));
  }

  togglePermission(id: string, expand?: string): void {
    if (expand) this.expandedGroups.update(s => { const n = new Set(s); n.add(expand); return n; });
    const s = new Set(this.draftPermIds());
    if (s.has(id)) { s.delete(id); } else { s.add(id); }
    this.draftPermIds.set([...s]);
  }

  toggleGroupAll(group: PermGroup): void {
    const s = new Set(this.draftPermIds());
    if (this.isGroupAllSelected(group)) { group.allPermIds.forEach(id => s.delete(id)); }
    else { group.allPermIds.forEach(id => s.add(id)); }
    this.draftPermIds.set([...s]);
  }

  selectAll(): void { this.draftPermIds.set(ALL_PERMISSIONS.map(p => p.id)); }
  clearAll(): void { this.draftPermIds.set([]); }

  // ─── Save ──────────────────────────────────────────────────────────────────

  save(): void {
    const role = this.role();
    if (!role) return;
    this.roleService.updatePermissions(role.id, this.draftPermIds())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Permissions Saved',
            detail: `${this.draftPermIds().length} permissions assigned to "${role.name}".`,
          });
          this.router.navigate(['/users/roles']);
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save permissions.' }),
      });
  }

  goBack(): void { this.router.navigate(['/users/roles']); }
}

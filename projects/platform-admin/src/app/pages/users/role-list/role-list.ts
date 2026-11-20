import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  DataTableComponent,
  ButtonComponent,
  FormModalComponent,
  TextFieldComponent,
  SelectFieldComponent,
  TextareaFieldComponent,
  FilterSidebarComponent,
  ConfirmDialogComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  SelectOption,
} from 'admin-core';
import { ALL_PERMISSIONS } from './role.service';
import { Role, RoleScope, RoleService, RoleStatus, RoleType } from './role.service';

const TOTAL_PERM_COUNT = ALL_PERMISSIONS.length;

const ROLE_TYPE_OPTIONS: SelectOption<RoleType>[] = [
  { label: 'System', value: 'SYSTEM', description: 'Platform-defined role' },
  { label: 'Custom', value: 'CUSTOM', description: 'Tenant-defined custom role' },
];

const SCOPE_OPTIONS: SelectOption<RoleScope>[] = [
  { label: 'Platform', value: 'PLATFORM', description: 'Assigned to platform (admin) users' },
  { label: 'Tenant', value: 'TENANT', description: 'Assigned to tenant company users' },
  { label: 'B2B Agent', value: 'B2B', description: 'Assigned to B2B agent users' },
  { label: 'B2C Customer', value: 'B2C', description: 'Assigned to B2C end customers' },
  { label: 'Supplier', value: 'SUPPLIER', description: 'Assigned to supplier users' },
  { label: 'Vendor', value: 'VENDOR', description: 'Assigned to vendor users' },
];

const STATUS_OPTIONS: SelectOption<RoleStatus>[] = [
  { label: 'Active', value: 'ACTIVE', description: 'Role is active and can be assigned' },
  { label: 'Inactive', value: 'INACTIVE', description: 'Role is disabled' },
];

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
    ButtonComponent,
    FormModalComponent,
    TextFieldComponent,
    TextareaFieldComponent,
    SelectFieldComponent,
    FilterSidebarComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    TableActionComponent,
  ],
  templateUrl: './role-list.html',
  styleUrl: './role-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleListComponent {
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly roles = this.roleService.roles;
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly selectedRoles = signal<Role[]>([]);
  readonly totalPermCount = TOTAL_PERM_COUNT;

  // Filter state
  readonly filterVisible = signal<boolean>(false);
  readonly selectedTypeFilter = signal<string | null>(null);
  readonly selectedScopeFilter = signal<string | null>(null);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly appliedTypeFilter = signal<string | null>(null);
  readonly appliedScopeFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);

  // Modal state
  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);

  // Confirm delete state
  readonly confirmDeleteVisible = signal<boolean>(false);
  readonly itemToDelete = signal<Role | null>(null);

  readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    type: new FormControl<RoleType>('CUSTOM', Validators.required),
    scope: new FormControl<RoleScope>('PLATFORM', Validators.required),
    status: new FormControl<RoleStatus>('ACTIVE', Validators.required),
  });

  // Template refs
  readonly nameTpl = viewChild<TemplateRef<any>>('nameTpl');
  readonly typeTpl = viewChild<TemplateRef<any>>('typeTpl');
  readonly scopeTpl = viewChild<TemplateRef<any>>('scopeTpl');
  readonly permCountTpl = viewChild<TemplateRef<any>>('permCountTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly roleTypeOptions = ROLE_TYPE_OPTIONS;
  readonly scopeOptions = SCOPE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedTypeFilter()) count++;
    if (this.appliedScopeFilter()) count++;
    if (this.appliedStatusFilter()) count++;
    return count;
  });

  readonly filteredRoles = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const typeFilter = this.appliedTypeFilter();
    const scopeFilter = this.appliedScopeFilter();
    const statusFilter = this.appliedStatusFilter();

    let list = this.roles();
    if (typeFilter) list = list.filter(r => r.type === typeFilter);
    if (scopeFilter) list = list.filter(r => r.scope === scopeFilter);
    if (statusFilter) list = list.filter(r => r.status === statusFilter);
    if (!query) return list;
    return list.filter(
      r =>
        r.name.toLowerCase().includes(query) ||
        r.key.toLowerCase().includes(query) ||
        (r.description ?? '').toLowerCase().includes(query),
    );
  });

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'name', header: 'Role', width: '20rem', sortable: true, bodyTemplate: this.nameTpl() },
    { field: 'type', header: 'Type', width: '8rem', align: 'center', bodyTemplate: this.typeTpl() },
    { field: 'scope', header: 'Scope', width: '9rem', align: 'center', bodyTemplate: this.scopeTpl() },
    { field: 'permissionIds', header: 'Permissions', width: '10rem', align: 'center', bodyTemplate: this.permCountTpl() },
    { field: 'status', header: 'Status', width: '8rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'actions', header: 'Action', width: '7.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  onSearch(query: string): void { this.searchQuery.set(query); }

  applyFilters(): void {
    this.appliedTypeFilter.set(this.selectedTypeFilter());
    this.appliedScopeFilter.set(this.selectedScopeFilter());
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.filterVisible.set(false);
  }

  resetFilters(): void {
    this.selectedTypeFilter.set(null); this.selectedScopeFilter.set(null); this.selectedStatusFilter.set(null);
    this.appliedTypeFilter.set(null); this.appliedScopeFilter.set(null); this.appliedStatusFilter.set(null);
    this.filterVisible.set(false);
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ name: '', description: '', type: 'CUSTOM', scope: 'PLATFORM', status: 'ACTIVE' });
    this.modalVisible.set(true);
  }

  openEditModal(item: Role): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.form.patchValue({ name: item.name, description: item.description ?? '', type: item.type, scope: item.scope, status: item.status });
    this.modalVisible.set(true);
  }

  saveRole(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.' });
      return;
    }

    const v = this.form.getRawValue();
    const name = (v.name ?? '').trim();
    const payload = {
      name,
      key: name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      description: v.description ? v.description.trim() || null : null,
      type: v.type as RoleType,
      scope: v.scope as RoleScope,
      ownerType: 'PLATFORM' as const,
      ownerId: null,
      status: v.status as RoleStatus,
    };

    if (this.isEditing() && this.editingId()) {
      this.roleService.update(this.editingId()!, payload);
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: `"${payload.name}" updated.` });
    } else {
      const created = this.roleService.add(payload);
      this.messageService.add({ severity: 'success', summary: 'Created', detail: `"${payload.name}" created. Assign permissions now.` });
      this.modalVisible.set(false);
      this.router.navigate(['/users/roles', created.id, 'permissions']);
      return;
    }
    this.modalVisible.set(false);
  }

  openPermissions(role: Role): void {
    this.router.navigate(['/users/roles', role.id, 'permissions']);
  }

  confirmDelete(item: Role): void {
    this.itemToDelete.set(item);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    if (single) {
      this.roleService.delete(single.id);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${single.name}" deleted.` });
    } else {
      const ids = this.selectedRoles().map(r => r.id);
      this.roleService.deleteMultiple(ids);
      this.selectedRoles.set([]);
      this.messageService.add({ severity: 'success', summary: 'Bulk Deleted', detail: `${ids.length} roles deleted.` });
    }
    this.confirmDeleteVisible.set(false);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
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
  FilterSidebarComponent,
  StatusModalComponent,
  ConfirmDialogComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  TableLazyEvent,
  SelectOption,
} from 'admin-core';
import { TenantUser, TenantUserService, TenantUserStatus } from './tenant-user.service';
import { CompanyService } from '../company-list/company.service';
import { RoleService } from '../../users/role-list/role.service';

const STATUS_OPTIONS: SelectOption<TenantUserStatus>[] = [
  { label: 'Active', value: 'ACTIVE', description: 'User can log in' },
  { label: 'Inactive', value: 'INACTIVE', description: 'Account temporarily disabled' },
  { label: 'Blocked', value: 'BLOCKED', description: 'Account permanently blocked' },
  { label: 'Pending', value: 'PENDING', description: 'Awaiting email verification' },
];

@Component({
  selector: 'app-tenant-user-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
    ButtonComponent,
    FormModalComponent,
    TextFieldComponent,
    SelectFieldComponent,
    FilterSidebarComponent,
    StatusModalComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    TableActionComponent,
  ],
  templateUrl: './tenant-user-list.html',
  styleUrl: './tenant-user-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantUserListComponent implements OnInit {
  readonly userService = inject(TenantUserService);
  private readonly companyService = inject(CompanyService);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = this.userService.users;
  readonly searchQuery = signal<string>('');
  readonly loading = this.userService.loading;
  readonly selectedUsers = signal<TenantUser[]>([]);

  readonly filterVisible = signal<boolean>(false);
  readonly selectedTenantFilter = signal<string | null>(null);
  readonly selectedRoleFilter = signal<string | null>(null);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly appliedTenantFilter = signal<string | null>(null);
  readonly appliedRoleFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);

  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);

  readonly statusModalVisible = signal<boolean>(false);
  readonly confirmDeleteVisible = signal<boolean>(false);
  readonly itemToDelete = signal<TenantUser | null>(null);

  readonly nameTpl = viewChild<TemplateRef<any>>('nameTpl');
  readonly tenantTpl = viewChild<TemplateRef<any>>('tenantTpl');
  readonly permTpl = viewChild<TemplateRef<any>>('permTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly statusOptions = STATUS_OPTIONS;

  readonly tenantMap = computed(() => new Map(this.companyService.companies().map(c => [c.id, c])));
  readonly roleMap = computed(() => new Map(this.roleService.roles().map(r => [r.id, r])));

  readonly tenantOptions = computed<SelectOption<string>[]>(() =>
    this.companyService.companies()
      .filter(c => c.status === 'ACTIVE' || c.status === 'TRIAL')
      .map(c => ({ label: c.companyName, value: c.id, description: c.companyCode })),
  );

  readonly roleOptions = computed<SelectOption<string>[]>(() =>
    this.roleService.roles()
      .filter(r => r.status === 'ACTIVE' && r.scope === 'TENANT')
      .map(r => ({ label: r.name, value: r.id, description: r.type === 'SYSTEM' ? 'System role' : 'Custom role' })),
  );

  readonly tenantFilterOptions = computed<SelectOption<string>[]>(() =>
    this.companyService.companies().map(c => ({ label: c.companyName, value: c.id })),
  );

  readonly roleFilterOptions = computed<SelectOption<string>[]>(() =>
    this.roleService.roles()
      .filter(r => r.scope === 'TENANT')
      .map(r => ({ label: r.name, value: r.id })),
  );

  readonly activeFilterCount = computed(() => {
    let n = 0;
    if (this.appliedTenantFilter()) n++;
    if (this.appliedRoleFilter()) n++;
    if (this.appliedStatusFilter()) n++;
    return n;
  });

  readonly filteredUsers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const tenantFilter = this.appliedTenantFilter();
    const roleFilter = this.appliedRoleFilter();
    const statusFilter = this.appliedStatusFilter();
    let list = this.users();
    if (tenantFilter) list = list.filter(u => u.tenantId === tenantFilter);
    if (roleFilter) list = list.filter(u => u.roleId === roleFilter);
    if (statusFilter) list = list.filter(u => u.status === statusFilter);
    if (!query) return list;
    return list.filter(
      u =>
        u.firstName.toLowerCase().includes(query) ||
        u.lastName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone.includes(query),
    );
  });

  readonly form = new FormGroup({
    tenantId: new FormControl('', Validators.required),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    roleId: new FormControl('', Validators.required),
    status: new FormControl<TenantUserStatus>('ACTIVE', Validators.required),
  });

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'name', header: 'User', width: '18rem', sortable: true, bodyTemplate: this.nameTpl() },
    { field: 'tenantId', header: 'Tenant', width: '14rem', bodyTemplate: this.tenantTpl() },
    { field: 'phone', header: 'Phone', width: '12rem' },
    { field: 'permissions', header: 'Role & Permissions', width: '15rem', bodyTemplate: this.permTpl() },
    { field: 'status', header: 'Status', width: '8rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'actions', header: 'Action', width: '9.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  getTenantName(tenantId: string): string { return this.tenantMap().get(tenantId)?.companyName ?? '—'; }
  getTenantCode(tenantId: string): string { return this.tenantMap().get(tenantId)?.companyCode ?? ''; }
  getRoleName(roleId: string): string { return this.roleMap().get(roleId)?.name ?? '—'; }
  getRolePermCount(roleId: string): number { return this.roleMap().get(roleId)?.permissionIds.length ?? 0; }

  getEffectivePermCount(user: TenantUser): number {
    return this.getRolePermCount(user.roleId) - user.disabledPermissionIds.length;
  }

  getOverrideCount(user: TenantUser): number {
    return user.disabledPermissionIds.length;
  }

  onSearch(query: string): void { this.searchQuery.set(query); }

  applyFilters(): void {
    this.appliedTenantFilter.set(this.selectedTenantFilter());
    this.appliedRoleFilter.set(this.selectedRoleFilter());
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.filterVisible.set(false);
  }

  ngOnInit(): void { this.userService.load(); }

  onLazyLoad(e: TableLazyEvent): void {
    const page = Math.floor((e.first ?? 0) / (e.rows ?? 50)) + 1;
    if (page !== this.userService.page()) this.userService.goToPage(page);
  }

  resetFilters(): void {
    this.selectedTenantFilter.set(null); this.selectedRoleFilter.set(null); this.selectedStatusFilter.set(null);
    this.appliedTenantFilter.set(null); this.appliedRoleFilter.set(null); this.appliedStatusFilter.set(null);
    this.filterVisible.set(false);
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ tenantId: '', firstName: '', lastName: '', email: '', phone: '', roleId: '', status: 'ACTIVE' });
    this.modalVisible.set(true);
  }

  openEditModal(item: TenantUser): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.form.patchValue({ tenantId: item.tenantId, firstName: item.firstName, lastName: item.lastName, email: item.email, phone: item.phone, roleId: item.roleId, status: item.status });
    this.modalVisible.set(true);
  }

  saveUser(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields correctly.' });
      return;
    }
    const v = this.form.getRawValue();
    const payload = {
      tenantId: v.tenantId ?? '',
      firstName: (v.firstName ?? '').trim(),
      lastName: (v.lastName ?? '').trim(),
      email: (v.email ?? '').trim().toLowerCase(),
      phone: (v.phone ?? '').trim(),
      roleId: v.roleId ?? '',
      status: v.status as TenantUserStatus,
      isPrimary: false,
    };
    const fullName = `${payload.firstName} ${payload.lastName}`;

    if (this.isEditing() && this.editingId()) {
      this.userService.update(this.editingId()!, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Updated', detail: `${fullName} updated.` });
            this.modalVisible.set(false);
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user.' }),
        });
    } else {
      this.userService.add(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: created => {
            this.messageService.add({ severity: 'success', summary: 'Created', detail: `${fullName} created. Configure permission overrides now.` });
            this.modalVisible.set(false);
            this.router.navigate(['/tenants/users', created.id, 'permissions']);
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create user.' }),
        });
    }
  }

  openBulkStatusModal(): void {
    if (this.selectedUsers().length === 0) return;
    this.statusModalVisible.set(true);
  }

  onBulkStatusConfirm(newStatus: string): void {
    const selected = this.selectedUsers();
    forkJoin(selected.map(u => this.userService.update(u.id, { status: newStatus as TenantUserStatus })))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedUsers.set([]);
          this.statusModalVisible.set(false);
          this.messageService.add({ severity: 'info', summary: 'Status Updated', detail: `Updated ${selected.length} user(s) to ${newStatus}.` });
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Bulk status update failed.' }),
      });
  }

  openPermissions(user: TenantUser): void {
    this.router.navigate(['/tenants/users', user.id, 'permissions']);
  }

  confirmDelete(item: TenantUser): void {
    this.itemToDelete.set(item);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    const obs = single
      ? this.userService.delete(single.id)
      : this.userService.deleteMultiple(this.selectedUsers().map(u => u.id));

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (single) {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${single.firstName} ${single.lastName} deleted.` });
        } else {
          const count = this.selectedUsers().length;
          this.selectedUsers.set([]);
          this.messageService.add({ severity: 'success', summary: 'Bulk Deleted', detail: `${count} users deleted.` });
        }
        this.confirmDeleteVisible.set(false);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' }),
    });
  }
}

import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal, TemplateRef, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent, DataTableComponent, ButtonComponent,
  ViewModalComponent, FilterSidebarComponent, ConfirmDialogComponent,
  SelectFieldComponent, StatusBadgeComponent, TableActionComponent,
  TableColumn, BreadcrumbItem,
} from 'admin-core';
import { LoginLog, LoginLogsService } from './login-logs.service';
import { exportToCsv } from 'admin-core';

@Component({
  selector: 'app-login-logs',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    ViewModalComponent, FilterSidebarComponent, ConfirmDialogComponent,
    SelectFieldComponent, StatusBadgeComponent, TableActionComponent,
  ],
  templateUrl: './login-logs.html',
  styleUrl: './login-logs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginLogsComponent implements OnInit {
  private readonly service = inject(LoginLogsService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Logs', route: '/system/logs/login' },
    { label: 'Login Logs' },
  ];

  readonly logs = this.service.logs;
  readonly loading = this.service.loading;
  readonly searchQuery = signal('');
  readonly selectedItems = signal<LoginLog[]>([]);
  readonly filterVisible = signal(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedRoleFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedRoleFilter = signal<string | null>(null);
  readonly detailVisible = signal(false);
  readonly activeLog = signal<LoginLog | null>(null);
  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<LoginLog | null>(null);

  readonly userTpl = viewChild<TemplateRef<unknown>>('userTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly statusOptions = [
    { label: 'Success', value: 'Success' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Blocked', value: 'Blocked' },
  ];

  readonly roleOptions = [
    { label: 'Super Admin', value: 'Super Admin' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Staff', value: 'Staff' },
  ];

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'userName', header: 'User', width: '18rem', sortable: true, bodyTemplate: this.userTpl() },
    { field: 'role', header: 'Role', width: '10rem', sortable: true },
    { field: 'ipAddress', header: 'IP Address', width: '12rem', sortable: true },
    { field: 'device', header: 'Device', width: '10rem', sortable: true },
    { field: 'browser', header: 'Browser', width: '10rem', sortable: true },
    { field: 'status', header: 'Status', width: '9rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'createdAt', header: 'Date & Time', width: '16rem', sortable: true },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => {
    let c = 0;
    if (this.appliedStatusFilter()) c++;
    if (this.appliedRoleFilter()) c++;
    return c;
  });

  readonly filteredLogs = computed(() => {
    let list = this.logs();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) list = list.filter(l => l.userName.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.ipAddress.toLowerCase().includes(q));
    const sf = this.appliedStatusFilter();
    if (sf) list = list.filter(l => l.status === sf);
    const rf = this.appliedRoleFilter();
    if (rf) list = list.filter(l => l.role === rf);
    return list;
  });

  ngOnInit(): void { this.service.load(); }

  onSearch(q: string): void { this.searchQuery.set(q); }

  onApplyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedRoleFilter.set(this.selectedRoleFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedStatusFilter.set(null); this.selectedRoleFilter.set(null);
    this.appliedStatusFilter.set(null); this.appliedRoleFilter.set(null);
    this.filterVisible.set(false);
  }

  openDetail(log: LoginLog): void { this.activeLog.set(log); this.detailVisible.set(true); }

  confirmDeleteSingle(log: LoginLog): void { this.itemToDelete.set(log); this.confirmDeleteVisible.set(true); }

  confirmBulkDelete(): void {
    if (this.selectedItems().length === 0) return;
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    const obs$ = single ? this.service.delete(single.id) : this.service.bulkDelete(this.selectedItems().map(l => l.id));
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (single) {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Login log entry removed.' });
        } else {
          const count = this.selectedItems().length;
          this.selectedItems.set([]);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${count} log entries removed.` });
        }
        this.confirmDeleteVisible.set(false);
        this.itemToDelete.set(null);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not delete log entry.' });
        this.confirmDeleteVisible.set(false);
      },
    });
  }

  exportData(selectedOnly = false): void {
    const rows = selectedOnly ? this.selectedItems() : this.filteredLogs();
    if (rows.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'No Data', detail: 'No records to export.' });
      return;
    }
    exportToCsv('login_logs', rows, [
      { field: 'userName', header: 'User' }, { field: 'email', header: 'Email' },
      { field: 'role', header: 'Role' }, { field: 'ipAddress', header: 'IP Address' },
      { field: 'device', header: 'Device' }, { field: 'browser', header: 'Browser' },
      { field: 'status', header: 'Status' }, { field: 'createdAt', header: 'Date & Time' },
    ]);
    this.messageService.add({ severity: 'success', summary: 'Exported', detail: `${rows.length} records exported.` });
  }
}

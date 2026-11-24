import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal, TemplateRef, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent, DataTableComponent, ButtonComponent,
  ViewModalComponent, FilterSidebarComponent, ConfirmDialogComponent,
  SelectFieldComponent, StatusBadgeComponent, TableActionComponent,
  TableColumn, BreadcrumbItem,
} from 'admin-core';
import { SmsLog, SmsLogsService } from './sms-logs.service';
import { exportToCsv } from 'admin-core';

@Component({
  selector: 'app-sms-logs',
  standalone: true,
  imports: [
    PageContainerComponent, DataTableComponent, ButtonComponent,
    ViewModalComponent, FilterSidebarComponent, ConfirmDialogComponent,
    SelectFieldComponent, StatusBadgeComponent, TableActionComponent,
  ],
  templateUrl: './sms-logs.html',
  styleUrl: './sms-logs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmsLogsComponent implements OnInit {
  private readonly service = inject(SmsLogsService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Logs', route: '/system/logs/sms' },
    { label: 'SMS Logs' },
  ];

  readonly logs = this.service.logs;
  readonly loading = this.service.loading;
  readonly searchQuery = signal('');
  readonly selectedItems = signal<SmsLog[]>([]);
  readonly filterVisible = signal(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly detailVisible = signal(false);
  readonly activeLog = signal<SmsLog | null>(null);
  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<SmsLog | null>(null);

  readonly statusOptions = [
    { label: 'Sent', value: 'Sent' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Pending', value: 'Pending' },
  ];

  readonly toTpl = viewChild<TemplateRef<unknown>>('toTpl');
  readonly messageTpl = viewChild<TemplateRef<unknown>>('messageTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'to', header: 'Phone', width: '13rem', sortable: true, bodyTemplate: this.toTpl() },
    { field: 'message', header: 'Message', width: '30rem', sortable: false, bodyTemplate: this.messageTpl() },
    { field: 'status', header: 'Status', width: '8.5rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'triggeredBy', header: 'Triggered By', width: '15rem', sortable: true },
    { field: 'sentAt', header: 'Sent At', width: '15rem', sortable: true },
    { field: 'actions', header: 'Action', width: '9.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => this.appliedStatusFilter() ? 1 : 0);

  readonly filteredLogs = computed(() => {
    let list = this.logs();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) list = list.filter(l => l.to.includes(q) || l.message.toLowerCase().includes(q) || l.triggeredBy.toLowerCase().includes(q));
    const sf = this.appliedStatusFilter();
    if (sf) list = list.filter(l => l.status === sf);
    return list;
  });

  ngOnInit(): void { this.service.load(); }

  onSearch(q: string): void { this.searchQuery.set(q); }

  onApplyFilters(): void { this.appliedStatusFilter.set(this.selectedStatusFilter()); this.filterVisible.set(false); }

  onResetFilters(): void { this.selectedStatusFilter.set(null); this.appliedStatusFilter.set(null); this.filterVisible.set(false); }

  openDetail(log: SmsLog): void { this.activeLog.set(log); this.detailVisible.set(true); }

  onResend(log: SmsLog): void {
    this.service.resend(log.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        if (this.activeLog()?.id === log.id) this.activeLog.set(updated);
        this.messageService.add({ severity: 'success', summary: 'Resent', detail: `SMS to ${log.to} has been resent successfully.`, life: 3000 });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Resend Failed', detail: 'Could not resend SMS.' }),
    });
  }

  confirmDeleteSingle(log: SmsLog): void { this.itemToDelete.set(log); this.confirmDeleteVisible.set(true); }

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
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'SMS log entry removed.' });
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

  exportSelected(): void {
    const rows = this.selectedItems();
    if (!rows.length) return;
    exportToCsv('sms_logs', rows, [
      { field: 'to', header: 'Phone' }, { field: 'message', header: 'Message' },
      { field: 'template', header: 'Template' }, { field: 'status', header: 'Status' },
      { field: 'triggeredBy', header: 'Triggered By' }, { field: 'sentAt', header: 'Sent At' },
      { field: 'errorMessage', header: 'Error' },
    ]);
    this.messageService.add({ severity: 'success', summary: 'Exported', detail: `${rows.length} records exported.` });
  }

  statusBadge(status: SmsLog['status']): string {
    if (status === 'Sent' || status === 'Delivered') return 'Active';
    if (status === 'Queued') return 'Pending';
    return 'Inactive';
  }
}

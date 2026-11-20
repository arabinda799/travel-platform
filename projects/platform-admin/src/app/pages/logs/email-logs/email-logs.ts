import { ChangeDetectionStrategy, Component, computed, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  DataTableComponent,
  ButtonComponent,
  ViewModalComponent,
  FilterSidebarComponent,
  ConfirmDialogComponent,
  SelectFieldComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  BreadcrumbItem,
} from 'admin-core';
import { EmailLog, EmailLogsService } from './email-logs.service';
import { exportToCsv } from '../../../shared/utils/export.util';

@Component({
  selector: 'app-email-logs',
  standalone: true,
  imports: [
    PageContainerComponent,
    DataTableComponent,
    ButtonComponent,
    ViewModalComponent,
    FilterSidebarComponent,
    ConfirmDialogComponent,
    SelectFieldComponent,
    StatusBadgeComponent,
    TableActionComponent,
  ],
  templateUrl: './email-logs.html',
  styleUrl: './email-logs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailLogsComponent {
  private readonly service = inject(EmailLogsService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Logs', route: '/system/logs/email' },
    { label: 'Email Logs' },
  ];

  readonly logs = this.service.logs;
  readonly searchQuery = signal('');
  readonly selectedItems = signal<EmailLog[]>([]);
  readonly loading = signal(false);

  readonly filterVisible = signal(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedTemplateFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedTemplateFilter = signal<string | null>(null);

  readonly detailVisible = signal(false);
  readonly activeLog = signal<EmailLog | null>(null);

  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<EmailLog | null>(null);

  readonly statusOptions = [
    { label: 'Sent', value: 'Sent' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Bounced', value: 'Bounced' },
    { label: 'Queued', value: 'Queued' },
  ];

  readonly templateOptions = computed(() => {
    const unique = [...new Set(this.logs().map(l => l.template))].sort();
    return unique.map(t => ({ label: t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: t }));
  });

  readonly toTpl = viewChild<TemplateRef<unknown>>('toTpl');
  readonly subjectTpl = viewChild<TemplateRef<unknown>>('subjectTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'to', header: 'Recipient', width: '22rem', sortable: true, bodyTemplate: this.toTpl() },
    { field: 'subject', header: 'Subject', width: '26rem', sortable: true, bodyTemplate: this.subjectTpl() },
    { field: 'status', header: 'Status', width: '8.5rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'triggeredBy', header: 'Triggered By', width: '15rem', sortable: true },
    { field: 'sentAt', header: 'Sent At', width: '15rem', sortable: true },
    { field: 'actions', header: 'Action', width: '9.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => {
    let c = 0;
    if (this.appliedStatusFilter()) c++;
    if (this.appliedTemplateFilter()) c++;
    return c;
  });

  readonly filteredLogs = computed(() => {
    let list = this.logs();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) list = list.filter(l => l.to.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q) || l.triggeredBy.toLowerCase().includes(q));
    const sf = this.appliedStatusFilter();
    if (sf) list = list.filter(l => l.status === sf);
    const tf = this.appliedTemplateFilter();
    if (tf) list = list.filter(l => l.template === tf);
    return list;
  });

  onSearch(q: string): void { this.searchQuery.set(q); }

  onApplyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedTemplateFilter.set(this.selectedTemplateFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedStatusFilter.set(null);
    this.selectedTemplateFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.appliedTemplateFilter.set(null);
    this.filterVisible.set(false);
  }

  openDetail(log: EmailLog): void {
    this.activeLog.set(log);
    this.detailVisible.set(true);
  }

  onResend(log: EmailLog): void {
    const updated = this.service.resend(log.id);
    if (this.activeLog()?.id === log.id && updated) {
      this.activeLog.set(updated);
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Resent',
      detail: `Email to ${log.to} has been resent successfully.`,
      life: 3000,
    });
  }

  confirmDeleteSingle(log: EmailLog): void {
    this.itemToDelete.set(log);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    if (this.selectedItems().length === 0) return;
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    if (single) {
      this.service.delete(single.id);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Email log entry removed.' });
    } else {
      const ids = this.selectedItems().map(l => l.id);
      this.service.bulkDelete(ids);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${ids.length} log entries removed.` });
      this.selectedItems.set([]);
    }
    this.confirmDeleteVisible.set(false);
    this.itemToDelete.set(null);
  }

  exportSelected(): void {
    const rows = this.selectedItems();
    if (!rows.length) return;
    exportToCsv('email_logs', rows, [
      { field: 'to', header: 'Recipient' },
      { field: 'subject', header: 'Subject' },
      { field: 'template', header: 'Template' },
      { field: 'status', header: 'Status' },
      { field: 'triggeredBy', header: 'Triggered By' },
      { field: 'sentAt', header: 'Sent At' },
      { field: 'errorMessage', header: 'Error' },
    ]);
    this.messageService.add({ severity: 'success', summary: 'Exported', detail: `${rows.length} records exported.` });
  }

  statusBadge(status: EmailLog['status']): string {
    if (status === 'Sent') return 'Active';
    if (status === 'Queued') return 'Pending';
    return 'Inactive';
  }
}

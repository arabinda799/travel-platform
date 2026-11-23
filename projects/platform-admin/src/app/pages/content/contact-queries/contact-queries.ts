import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal, TemplateRef, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  DataTableComponent,
  ButtonComponent,
  ModalComponent,
  SelectFieldComponent,
  DatePickerFieldComponent,
  FilterSidebarComponent,
  ConfirmDialogComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  BreadcrumbItem,
} from 'admin-core';
import { exportToCsv } from '../../../shared/utils/export.util';
import { ContactQuery, ContactQueriesService } from './contact-queries.service';

@Component({
  selector: 'app-contact-queries',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
    ButtonComponent,
    ModalComponent,
    SelectFieldComponent,
    DatePickerFieldComponent,
    FilterSidebarComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    TableActionComponent,
  ],
  templateUrl: './contact-queries.html',
  styleUrl: './contact-queries.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactQueriesComponent implements OnInit {
  private readonly queriesService = inject(ContactQueriesService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Content', route: '/content/sliders' },
    { label: 'Contact Queries' },
  ];

  readonly queries = this.queriesService.queries;
  readonly loading = this.queriesService.loading;
  readonly selectedQueries = signal<ContactQuery[]>([]);
  readonly searchQuery = signal('');

  readonly filterVisible = signal(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedTypeFilter = signal<string | null>(null);
  readonly selectedDateRangeFilter = signal<[Date, Date] | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedTypeFilter = signal<string | null>(null);
  readonly appliedDateRangeFilter = signal<[Date, Date] | null>(null);

  readonly viewModalVisible = signal(false);
  readonly activeQuery = signal<ContactQuery | null>(null);

  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<ContactQuery | null>(null);

  readonly nameTpl = viewChild<TemplateRef<unknown>>('nameTpl');
  readonly emailTpl = viewChild<TemplateRef<unknown>>('emailTpl');
  readonly queryTypeTpl = viewChild<TemplateRef<unknown>>('queryTypeTpl');
  readonly subjectTpl = viewChild<TemplateRef<unknown>>('subjectTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly statusOptions = [
    { label: 'New', value: 'New' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
  ];

  readonly queryTypeOptions = [
    { label: 'Agent', value: 'Agent' },
    { label: 'Customer', value: 'Customer' },
    { label: 'Partner', value: 'Partner' },
    { label: 'Supplier', value: 'Supplier' },
  ];

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'name', header: 'Name', width: '14rem', sortable: true, bodyTemplate: this.nameTpl() },
    { field: 'email', header: 'Email', width: '18rem', sortable: true, bodyTemplate: this.emailTpl() },
    { field: 'queryType', header: 'Query Type', width: '10rem', sortable: true, bodyTemplate: this.queryTypeTpl() },
    { field: 'subject', header: 'Subject', width: '24rem', sortable: true, bodyTemplate: this.subjectTpl() },
    { field: 'status', header: 'Status', width: '9rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'createdDate', header: 'Created Date', width: '14rem', sortable: true },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedStatusFilter()) count++;
    if (this.appliedTypeFilter()) count++;
    if (this.appliedDateRangeFilter()?.[0]) count++;
    return count;
  });

  readonly filteredQueries = computed(() => {
    let list = this.queries();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.queryType.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    }

    const sf = this.appliedStatusFilter();
    if (sf) list = list.filter(item => item.status === sf);

    const tf = this.appliedTypeFilter();
    if (tf) list = list.filter(item => item.queryType === tf);

    const dateRange = this.appliedDateRangeFilter();
    if (dateRange?.[0]) {
      const start = new Date(dateRange[0]).setHours(0, 0, 0, 0);
      const end = dateRange[1] ? new Date(dateRange[1]).setHours(23, 59, 59, 999) : new Date(dateRange[0]).setHours(23, 59, 59, 999);
      list = list.filter(item => {
        const dateStr = item.createdDate.split('/')[0].trim();
        const t = new Date(dateStr).getTime();
        return isNaN(t) || (t >= start && t <= end);
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.queriesService.load();
  }

  onSearch(query: string): void { this.searchQuery.set(query); }

  onApplyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedTypeFilter.set(this.selectedTypeFilter());
    this.appliedDateRangeFilter.set(this.selectedDateRangeFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedStatusFilter.set(null);
    this.selectedTypeFilter.set(null);
    this.selectedDateRangeFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.appliedTypeFilter.set(null);
    this.appliedDateRangeFilter.set(null);
    this.filterVisible.set(false);
  }

  openViewModal(query: ContactQuery): void {
    this.activeQuery.set(query);
    this.viewModalVisible.set(true);
  }

  updateQueryStatus(status: 'New' | 'In Progress' | 'Resolved'): void {
    const q = this.activeQuery();
    if (!q) return;
    this.queriesService.updateStatus(q.id, status)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (updated) => {
          this.activeQuery.set(updated);
          this.messageService.add({ severity: 'success', summary: 'Status Updated', detail: `Query status updated to ${status}.` });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: 'Could not update query status.' });
        },
      });
  }

  confirmDeleteSingle(query: ContactQuery): void {
    this.itemToDelete.set(query);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    if (this.selectedQueries().length === 0) return;
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    const obs$ = single
      ? this.queriesService.deleteQuery(single.id)
      : this.queriesService.bulkDelete(this.selectedQueries().map(q => q.id));

    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (single) {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `Query from "${single.name}" deleted.` });
        } else {
          const count = this.selectedQueries().length;
          this.selectedQueries.set([]);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${count} queries deleted.` });
        }
        this.confirmDeleteVisible.set(false);
        this.itemToDelete.set(null);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not delete query/queries.' });
        this.confirmDeleteVisible.set(false);
      },
    });
  }

  exportData(selectedOnly = false): void {
    const rows = selectedOnly ? this.selectedQueries() : this.filteredQueries();
    if (rows.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'No Data', detail: 'No query records to export.' });
      return;
    }
    exportToCsv('contact_us_queries', rows, [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'phone', header: 'Phone' },
      { field: 'queryType', header: 'Query Type' },
      { field: 'subject', header: 'Subject' },
      { field: 'message', header: 'Message' },
      { field: 'status', header: 'Status' },
      { field: 'createdDate', header: 'Created Date' },
    ]);
    this.messageService.add({ severity: 'success', summary: 'Export Successful', detail: `${rows.length} queries exported.` });
  }
}

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
import { CouponLog, CouponLogsService } from './coupon-logs.service';
import { exportToCsv } from 'admin-core';

@Component({
  selector: 'app-coupon-logs',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    ViewModalComponent, FilterSidebarComponent, ConfirmDialogComponent,
    SelectFieldComponent, StatusBadgeComponent, TableActionComponent,
  ],
  templateUrl: './coupon-logs.html',
  styleUrl: './coupon-logs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouponLogsComponent implements OnInit {
  private readonly service = inject(CouponLogsService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Logs', route: '/system/logs/coupon' },
    { label: 'Coupon Logs' },
  ];

  readonly logs = this.service.logs;
  readonly loading = this.service.loading;
  readonly searchQuery = signal('');
  readonly selectedItems = signal<CouponLog[]>([]);
  readonly filterVisible = signal(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedTypeFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedTypeFilter = signal<string | null>(null);
  readonly detailVisible = signal(false);
  readonly activeLog = signal<CouponLog | null>(null);
  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<CouponLog | null>(null);

  readonly couponTpl = viewChild<TemplateRef<unknown>>('couponTpl');
  readonly userTpl = viewChild<TemplateRef<unknown>>('userTpl');
  readonly amountTpl = viewChild<TemplateRef<unknown>>('amountTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly statusOptions = [
    { label: 'Applied', value: 'Applied' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Invalid', value: 'Invalid' },
    { label: 'Limit Reached', value: 'Limit Reached' },
  ];

  readonly typeOptions = [
    { label: 'Flat', value: 'Flat' },
    { label: 'Percentage', value: 'Percentage' },
  ];

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'couponCode', header: 'Coupon Code', width: '12rem', sortable: true, bodyTemplate: this.couponTpl() },
    { field: 'usedBy', header: 'Used By', width: '18rem', sortable: true, bodyTemplate: this.userTpl() },
    { field: 'bookingId', header: 'Booking ID', width: '13rem', sortable: true },
    { field: 'discountAmount', header: 'Discount', width: '10rem', align: 'right', sortable: true, bodyTemplate: this.amountTpl() },
    { field: 'status', header: 'Status', width: '11rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'usedAt', header: 'Used At', width: '16rem', sortable: true },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => {
    let c = 0;
    if (this.appliedStatusFilter()) c++;
    if (this.appliedTypeFilter()) c++;
    return c;
  });

  readonly filteredLogs = computed(() => {
    let list = this.logs();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) list = list.filter(l =>
      l.couponCode.toLowerCase().includes(q) ||
      l.usedBy.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.bookingId.toLowerCase().includes(q)
    );
    const sf = this.appliedStatusFilter();
    if (sf) list = list.filter(l => l.status === sf);
    const tf = this.appliedTypeFilter();
    if (tf) list = list.filter(l => l.discountType === tf);
    return list;
  });

  ngOnInit(): void { this.service.load(); }

  onSearch(q: string): void { this.searchQuery.set(q); }

  onApplyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedTypeFilter.set(this.selectedTypeFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedStatusFilter.set(null); this.selectedTypeFilter.set(null);
    this.appliedStatusFilter.set(null); this.appliedTypeFilter.set(null);
    this.filterVisible.set(false);
  }

  openDetail(log: CouponLog): void { this.activeLog.set(log); this.detailVisible.set(true); }

  formatDiscount(log: CouponLog): string {
    return log.discountType === 'Flat' ? `₹${log.discountAmount}` : `${log.discountAmount}%`;
  }

  confirmDeleteSingle(log: CouponLog): void { this.itemToDelete.set(log); this.confirmDeleteVisible.set(true); }

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
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Coupon log entry removed.' });
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
    exportToCsv('coupon_logs', rows, [
      { field: 'couponCode', header: 'Coupon Code' }, { field: 'usedBy', header: 'Used By' },
      { field: 'email', header: 'Email' }, { field: 'bookingId', header: 'Booking ID' },
      { field: 'discountAmount', header: 'Discount Amount' }, { field: 'discountType', header: 'Discount Type' },
      { field: 'status', header: 'Status' }, { field: 'usedAt', header: 'Used At' },
    ]);
    this.messageService.add({ severity: 'success', summary: 'Exported', detail: `${rows.length} records exported.` });
  }
}

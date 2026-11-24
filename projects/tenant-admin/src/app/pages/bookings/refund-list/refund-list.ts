import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  PageContainerComponent,
  DataTableComponent,
  FilterSidebarComponent,
  ButtonComponent,
  ConfirmDialogComponent,
  StatusModalComponent,
  ModalComponent,
  DateRangePickerComponent,
  SelectFieldComponent,
  DatePickerFieldComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  TableLazyEvent,
  BreadcrumbItem,
} from 'admin-core';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { RefundListService, RefundRecord } from './refund-list.service';

export type { RefundRecord };

@Component({
  selector: 'app-refund-list',
  standalone: true,
  imports: [
    DecimalPipe,
    PageContainerComponent,
    DataTableComponent,
    FilterSidebarComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    StatusModalComponent,
    ModalComponent,
    DateRangePickerComponent,
    SelectFieldComponent,
    DatePickerFieldComponent,
    StatusBadgeComponent,
    TableActionComponent,
    Menu,
  ],
  templateUrl: './refund-list.html',
  styleUrl: './refund-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundListComponent {
  private readonly router = inject(Router);

  readonly refundStatusTpl = viewChild<TemplateRef<any>>('refundStatusTpl');
  readonly amendmentStatusTpl = viewChild<TemplateRef<any>>('amendmentStatusTpl');
  readonly bookingStatusTpl = viewChild<TemplateRef<any>>('bookingStatusTpl');
  readonly amountTpl = viewChild<TemplateRef<any>>('amountTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Hotel Bookings', route: '/bookings/hotel' },
    { label: 'Refund List' },
  ];

  readonly isLoading = signal(true);
  readonly filterVisible = signal(false);
  readonly deleteConfirmVisible = signal(false);
  readonly statusModalVisible = signal(false);
  readonly exportDateRangeVisible = signal(false);
  exportDateRange: [Date, Date] | null = null;

  readonly statusModalOptions = [
    { label: 'Processed', value: 'Processed', description: 'Mark selected refunds as processed' },
    { label: 'Initiated', value: 'Initiated', description: 'Mark selected refunds as initiated' },
    { label: 'Pending', value: 'Pending', description: 'Mark selected refunds as pending' },
    { label: 'Failed', value: 'Failed', description: 'Mark selected refunds as failed' },
  ];

  readonly exportMenuItems: MenuItem[] = [
    { label: 'Export as CSV', icon: 'pi pi-file', command: () => this.onExport('csv') },
    { label: 'Export as Excel', icon: 'pi pi-file-excel', command: () => this.onExport('excel') },
    { label: 'Export as PDF', icon: 'pi pi-file-pdf', command: () => this.onExport('pdf') },
  ];

  selectedRefunds: RefundRecord[] = [];

  readonly selectedType = signal<string | null>(null);
  readonly selectedRefundStatus = signal<string | null>(null);
  readonly selectedAmendmentStatus = signal<string | null>(null);
  readonly selectedBookingStatus = signal<string | null>(null);
  readonly selectedRefundDateRange = signal<Date[] | null>(null);
  readonly selectedBookingDateRange = signal<Date[] | null>(null);
  searchQuery = '';
  private readonly search$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  readonly refundStatusOptions = [
    { label: 'Processed', value: 'Processed' },
    { label: 'Initiated', value: 'Initiated' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Failed', value: 'Failed' },
  ];

  readonly amendmentStatusOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Pending', value: 'Pending' },
    { label: 'In Review', value: 'In Review' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  readonly bookingStatusOptions = [
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Checked In', value: 'Checked In' },
    { label: 'Checked Out', value: 'Checked Out' },
  ];

  readonly typeOptions = [
    { label: 'Full Cancellation', value: 'Full Cancellation' },
    { label: 'Date Change', value: 'Date Change' },
    { label: 'Room Upgrade', value: 'Room Upgrade' },
    { label: 'Guest Name Change', value: 'Guest Name Change' },
    { label: 'Meal Plan Change', value: 'Meal Plan Change' },
    { label: 'Occupancy Change', value: 'Occupancy Change' },
  ];

  private readonly refundService = inject(RefundListService);
  readonly allData = this.refundService.refunds;
  readonly tableData = signal<RefundRecord[]>([]);
  readonly totalRecords = signal(0);
  readonly activeFilterCount = signal(0);

  private currentLazyEvent: TableLazyEvent = { first: 0, rows: 10, sortOrder: 1 };

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'refundId', header: 'Refund ID', sortable: true, width: '9rem' },
    { field: 'amendmentId', header: 'Amendment ID', sortable: true, width: '9.5rem' },
    { field: 'bookingId', header: 'Booking ID', sortable: true, width: '9rem' },
    { field: 'amendmentType', header: 'Amendment Type', sortable: true, width: '11rem' },
    { field: 'refundStatus', header: 'Refund Status', sortable: true, width: '9.5rem', align: 'center', bodyTemplate: this.refundStatusTpl() },
    { field: 'amendmentStatus', header: 'Amendment Status', sortable: true, width: '10.5rem', align: 'center', bodyTemplate: this.amendmentStatusTpl() },
    { field: 'bookingStatus', header: 'Booking Status', sortable: true, width: '9.5rem', align: 'center', bodyTemplate: this.bookingStatusTpl() },
    { field: 'bookingAmount', header: 'Booking Amt (₹)', sortable: true, width: '9.5rem', align: 'right', bodyTemplate: this.amountTpl() },
    { field: 'hotel', header: 'Hotel Name', sortable: true, width: '12rem' },
    { field: 'guest', header: 'Guest', sortable: true, width: '10rem' },
    { field: 'pax', header: 'Pax', sortable: true, width: '10rem' },
    { field: 'checkIn', header: 'Check In', sortable: true, width: '8.5rem' },
    { field: 'checkOut', header: 'Check Out', sortable: true, width: '8.5rem' },
    { field: 'city', header: 'City', sortable: true, width: '9rem' },
    { field: 'assignedStaff', header: 'Assigned Staff', sortable: true, width: '10rem' },
    { field: 'createdDate', header: 'Created Date', sortable: true, width: '9rem' },
    { field: 'actions', header: 'Action', align: 'center', width: '5rem', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  constructor() {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(query => {
      this.searchQuery = query;
      this.loadData({ ...this.currentLazyEvent, first: 0 });
    });

    this.loadData(this.currentLazyEvent);
  }

  onLazyLoad(event: TableLazyEvent): void {
    this.currentLazyEvent = event;
    this.loadData(event);
  }

  onSearch(query: string): void {
    this.search$.next(query);
  }

  onApplyFilters(): void {
    let count = 0;
    if (this.selectedType()) count++;
    if (this.selectedRefundStatus()) count++;
    if (this.selectedAmendmentStatus()) count++;
    if (this.selectedBookingStatus()) count++;
    const rfdRange = this.selectedRefundDateRange();
    if (rfdRange && rfdRange.length > 0 && rfdRange[0]) count++;
    const bkRange = this.selectedBookingDateRange();
    if (bkRange && bkRange.length > 0 && bkRange[0]) count++;
    this.activeFilterCount.set(count);
    this.filterVisible.set(false);
    this.loadData({ ...this.currentLazyEvent, first: 0 });
  }

  onResetFilters(): void {
    this.selectedType.set(null);
    this.selectedRefundStatus.set(null);
    this.selectedAmendmentStatus.set(null);
    this.selectedBookingStatus.set(null);
    this.selectedRefundDateRange.set(null);
    this.selectedBookingDateRange.set(null);
    this.activeFilterCount.set(0);
    this.filterVisible.set(false);
    this.loadData({ ...this.currentLazyEvent, first: 0 });
  }

  onBulkDelete(): void {
    this.deleteConfirmVisible.set(true);
  }

  confirmBulkDelete(): void {
    const selectedIds = this.selectedRefunds.map(r => r.id);
    this.deleteConfirmVisible.set(false);
    if (!selectedIds.length) return;
    this.refundService.deleteMultiple(selectedIds).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.selectedRefunds = [];
        this.loadData({ ...this.currentLazyEvent, first: 0 });
      },
    });
  }

  onStatusModalConfirm(newStatus: string): void {
    const selectedIds = this.selectedRefunds.map(r => r.id);
    this.statusModalVisible.set(false);
    if (!selectedIds.length) return;
    this.refundService.updateMultipleStatus(selectedIds, newStatus as RefundRecord['refundStatus']).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.selectedRefunds = [];
        this.loadData(this.currentLazyEvent);
      },
    });
  }

  onExport(_format: 'csv' | 'excel' | 'pdf'): void {
    this.exportDateRangeVisible.set(false);
  }

  viewRefund(refund: RefundRecord): void {
    this.router.navigate(['/bookings/hotel/amendments', refund.amendmentId]);
  }

  private loadData(event: TableLazyEvent): void {
    this.isLoading.set(true);
    setTimeout(() => {
      let filtered = [...this.allData()];

      if (this.selectedType()) {
        filtered = filtered.filter(r => r.amendmentType === this.selectedType());
      }
      if (this.selectedRefundStatus()) {
        filtered = filtered.filter(r => r.refundStatus === this.selectedRefundStatus());
      }
      if (this.selectedAmendmentStatus()) {
        filtered = filtered.filter(r => r.amendmentStatus === this.selectedAmendmentStatus());
      }
      if (this.selectedBookingStatus()) {
        filtered = filtered.filter(r => r.bookingStatus === this.selectedBookingStatus());
      }
      const rfdRange = this.selectedRefundDateRange();
      if (rfdRange && rfdRange.length > 0 && rfdRange[0]) {
        const start = new Date(rfdRange[0]).setHours(0, 0, 0, 0);
        const end = rfdRange[1] ? new Date(rfdRange[1]).setHours(23, 59, 59, 999) : new Date(rfdRange[0]).setHours(23, 59, 59, 999);
        filtered = filtered.filter(r => {
          const t = new Date(r.createdDate).getTime();
          return isNaN(t) || (t >= start && t <= end);
        });
      }
      const bkRange = this.selectedBookingDateRange();
      if (bkRange && bkRange.length > 0 && bkRange[0]) {
        const start = new Date(bkRange[0]).setHours(0, 0, 0, 0);
        const end = bkRange[1] ? new Date(bkRange[1]).setHours(23, 59, 59, 999) : new Date(bkRange[0]).setHours(23, 59, 59, 999);
        filtered = filtered.filter(r => {
          const t = new Date(r.bookingDate).getTime();
          return isNaN(t) || (t >= start && t <= end);
        });
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          r =>
            r.refundId.toLowerCase().includes(q) ||
            r.amendmentId.toLowerCase().includes(q) ||
            r.bookingId.toLowerCase().includes(q) ||
            r.guest.toLowerCase().includes(q) ||
            r.hotel.toLowerCase().includes(q) ||
            r.amendmentType.toLowerCase().includes(q) ||
            r.assignedStaff.toLowerCase().includes(q),
        );
      }

      if (event.sortField) {
        const field = event.sortField as keyof RefundRecord;
        const order = event.sortOrder ?? 1;
        filtered.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * order;
          }
          return String(valA).localeCompare(String(valB)) * order;
        });
      }

      this.totalRecords.set(filtered.length);
      const start = event.first;
      const end = start + event.rows;
      this.tableData.set(filtered.slice(start, end));
      this.isLoading.set(false);
    }, 200);
  }
}

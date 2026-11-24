import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
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
import { AmendmentListService, Amendment } from './amendment-list.service';

export type { Amendment };

@Component({
  selector: 'app-amendment-list',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
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
  templateUrl: './amendment-list.html',
  styleUrl: './amendment-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmendmentListComponent {
  private readonly router = inject(Router);

  readonly amendmentStatusTpl = viewChild<TemplateRef<any>>('amendmentStatusTpl');
  readonly bookingStatusTpl = viewChild<TemplateRef<any>>('bookingStatusTpl');
  readonly amountTpl = viewChild<TemplateRef<any>>('amountTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');
  readonly createdDateTpl = viewChild<TemplateRef<any>>('createdDateTpl');

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Hotel Bookings', route: '/bookings/hotel' },
    { label: 'Amendment List' },
  ];

  readonly isLoading = signal(true);
  readonly filterVisible = signal(false);
  readonly deleteConfirmVisible = signal(false);
  readonly statusModalVisible = signal(false);
  readonly exportDateRangeVisible = signal(false);
  exportDateRange: [Date, Date] | null = null;

  readonly statusModalOptions = [
    { label: 'Approved', value: 'Approved', description: 'Approve selected amendment requests' },
    { label: 'Pending', value: 'Pending', description: 'Mark selected requests as pending' },
    { label: 'Rejected', value: 'Rejected', description: 'Reject selected amendment requests' },
  ];

  readonly exportMenuItems: MenuItem[] = [
    { label: 'Export as CSV', icon: 'pi pi-file', command: () => this.onExport('csv') },
    { label: 'Export as Excel', icon: 'pi pi-file-excel', command: () => this.onExport('excel') },
    { label: 'Export as PDF', icon: 'pi pi-file-pdf', command: () => this.onExport('pdf') },
  ];

  selectedAmendments: Amendment[] = [];

  readonly selectedType = signal<string | null>(null);
  readonly selectedStatus = signal<string | null>(null);
  readonly selectedBookingStatus = signal<string | null>(null);
  readonly selectedAmendmentDateRange = signal<Date[] | null>(null);
  readonly selectedBookingDateRange = signal<Date[] | null>(null);
  searchQuery = '';
  private readonly search$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  readonly statusOptions = [
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
    { label: 'Date Change', value: 'Date Change' },
    { label: 'Room Upgrade', value: 'Room Upgrade' },
    { label: 'Guest Name Change', value: 'Guest Name Change' },
    { label: 'Meal Plan Change', value: 'Meal Plan Change' },
    { label: 'Occupancy Change', value: 'Occupancy Change' },
  ];

  private readonly amendmentService = inject(AmendmentListService);
  readonly allData = this.amendmentService.amendments;
  readonly tableData = signal<Amendment[]>([]);
  readonly totalRecords = signal(0);
  readonly activeFilterCount = signal(0);

  private currentLazyEvent: TableLazyEvent = { first: 0, rows: 10, sortOrder: 1 };

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'amendmentId', header: 'Amendment ID', sortable: true, width: '9.5rem' },
    { field: 'bookingId', header: 'Booking ID', sortable: true, width: '9rem' },
    { field: 'amendmentType', header: 'Amendment Type', sortable: true, width: '11rem' },
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
    { field: 'createdDate', header: 'Created At', sortable: true, width: '13rem', bodyTemplate: this.createdDateTpl() },
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
    if (this.selectedStatus()) count++;
    if (this.selectedBookingStatus()) count++;
    const amdRange = this.selectedAmendmentDateRange();
    if (amdRange && amdRange.length > 0 && amdRange[0]) count++;
    const bkRange = this.selectedBookingDateRange();
    if (bkRange && bkRange.length > 0 && bkRange[0]) count++;
    this.activeFilterCount.set(count);
    this.filterVisible.set(false);
    this.loadData({ ...this.currentLazyEvent, first: 0 });
  }

  onResetFilters(): void {
    this.selectedType.set(null);
    this.selectedStatus.set(null);
    this.selectedBookingStatus.set(null);
    this.selectedAmendmentDateRange.set(null);
    this.selectedBookingDateRange.set(null);
    this.activeFilterCount.set(0);
    this.filterVisible.set(false);
    this.loadData({ ...this.currentLazyEvent, first: 0 });
  }

  onBulkDelete(): void {
    this.deleteConfirmVisible.set(true);
  }

  confirmBulkDelete(): void {
    const selectedIds = this.selectedAmendments.map(a => a.id);
    if (selectedIds.length) {
      this.amendmentService.deleteMultiple(selectedIds);
    }
    this.selectedAmendments = [];
    this.deleteConfirmVisible.set(false);
    this.loadData({ ...this.currentLazyEvent, first: 0 });
  }

  onStatusModalConfirm(newStatus: string): void {
    const selectedIds = this.selectedAmendments.map(a => a.id);
    if (selectedIds.length) {
      this.amendmentService.updateMultipleStatus(selectedIds, newStatus as Amendment['amendmentStatus']);
    }
    this.selectedAmendments = [];
    this.statusModalVisible.set(false);
    this.loadData(this.currentLazyEvent);
  }

  onExport(_format: 'csv' | 'excel' | 'pdf'): void {
    this.exportDateRangeVisible.set(false);
  }

  viewAmendment(amendment: Amendment): void {
    this.router.navigate(['/bookings/hotel/amendments', amendment.amendmentId]);
  }

  private loadData(event: TableLazyEvent): void {
    this.isLoading.set(true);
    setTimeout(() => {
      let filtered = [...this.allData()];

      if (this.selectedType()) {
        filtered = filtered.filter(a => a.amendmentType === this.selectedType());
      }
      if (this.selectedStatus()) {
        filtered = filtered.filter(a => a.amendmentStatus === this.selectedStatus());
      }
      if (this.selectedBookingStatus()) {
        filtered = filtered.filter(a => a.bookingStatus === this.selectedBookingStatus());
      }
      const amdRange = this.selectedAmendmentDateRange();
      if (amdRange && amdRange.length > 0 && amdRange[0]) {
        const start = new Date(amdRange[0]).setHours(0, 0, 0, 0);
        const end = amdRange[1] ? new Date(amdRange[1]).setHours(23, 59, 59, 999) : new Date(amdRange[0]).setHours(23, 59, 59, 999);
        filtered = filtered.filter(a => {
          const t = new Date(a.createdDate).getTime();
          return isNaN(t) || (t >= start && t <= end);
        });
      }
      const bkRange = this.selectedBookingDateRange();
      if (bkRange && bkRange.length > 0 && bkRange[0]) {
        const start = new Date(bkRange[0]).setHours(0, 0, 0, 0);
        const end = bkRange[1] ? new Date(bkRange[1]).setHours(23, 59, 59, 999) : new Date(bkRange[0]).setHours(23, 59, 59, 999);
        filtered = filtered.filter(a => {
          const t = new Date(a.bookingDate).getTime();
          return isNaN(t) || (t >= start && t <= end);
        });
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          a =>
            a.amendmentId.toLowerCase().includes(q) ||
            a.bookingId.toLowerCase().includes(q) ||
            a.guest.toLowerCase().includes(q) ||
            a.hotel.toLowerCase().includes(q) ||
            a.amendmentType.toLowerCase().includes(q) ||
            a.assignedStaff.toLowerCase().includes(q),
        );
      }

      if (event.sortField) {
        const field = event.sortField as keyof Amendment;
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

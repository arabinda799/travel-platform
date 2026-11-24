import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  exportToCsv,
} from 'admin-core';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { HotelBookingsService } from './hotel-bookings.service';

interface Booking {
  id: number;
  bookingRef: string;
  guestName: string;
  hotel: string;
  city: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  assignedUser: string;
  supplier: string;
  bookingDate: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked In' | 'Checked Out';
}

const DUMMY_DATA: Booking[] = Array.from({ length: 87 }, (_, i) => {
  const statuses: Booking['status'][] = ['Confirmed', 'Pending', 'Cancelled', 'Checked In', 'Checked Out'];
  const hotels = ['Taj Palace Delhi', 'Oberoi Mumbai', 'Leela Bangalore', 'ITC Grand Kolkata', 'Marriott Goa', 'Hyatt Jaipur'];
  const cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Goa', 'Jaipur'];
  const names = ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Sneha Reddy', 'Vikram Joshi', 'Ananya Das', 'Karan Malhotra', 'Deepa Nair'];
  const paymentMethods = ['Credit Card (Visa)', 'UPI - GPay', 'Corporate NetBanking', 'Razorpay', 'Paytm Wallet'];
  const paymentStatuses: Booking['paymentStatus'][] = ['Paid', 'Pending', 'Failed', 'Refunded'];
  const assignedUsers = ['Aarav Mehta', 'Neha Kapoor', 'Rohan Verma', 'Priya Nair', 'Unassigned'];
  const suppliers = ['Hotelbeds', 'TBO Holidays', 'Expedia Partner', 'Direct Contract', 'RateHawk'];
  const amount = 4500 + (i * 350) % 25000;
  return {
    id: 1001 + i,
    bookingRef: `BK-${String(2024001 + i).slice(-6)}`,
    guestName: names[i % names.length],
    hotel: hotels[i % hotels.length],
    city: cities[i % cities.length],
    checkIn: `2026-${String(1 + (i % 12)).padStart(2, '0')}-${String(5 + (i % 20)).padStart(2, '0')}`,
    checkOut: `2026-${String(1 + (i % 12)).padStart(2, '0')}-${String(8 + (i % 20)).padStart(2, '0')}`,
    rooms: 1 + (i % 4),
    amount: amount,
    paymentMethod: paymentMethods[i % paymentMethods.length],
    paymentStatus: paymentStatuses[i % paymentStatuses.length],
    assignedUser: assignedUsers[i % assignedUsers.length],
    supplier: suppliers[i % suppliers.length],
    bookingDate: new Date(2026, 0, 1 + (i % 28), 9 + (i % 12), ((i * 7) % 60)).toISOString(),
    status: statuses[i % statuses.length],
  };
});

@Component({
  selector: 'app-demo-table',
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
  templateUrl: './demo-table.html',
  styleUrl: './demo-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoTableComponent {
  private readonly router = inject(Router);
  protected readonly bookingsService = inject(HotelBookingsService);

  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly paymentStatusTpl = viewChild<TemplateRef<any>>('paymentStatusTpl');
  readonly amountTpl = viewChild<TemplateRef<any>>('amountTpl');
  readonly taxTpl = viewChild<TemplateRef<any>>('taxTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');
  readonly bookingDateTpl = viewChild<TemplateRef<any>>('bookingDateTpl');

  viewBooking(row: Booking): void {
    this.router.navigate(['/hotel/bookings', row.bookingRef || row.id]);
  }

  editBooking(row: Booking): void {
    this.router.navigate(['/hotel/bookings', row.bookingRef || row.id, 'edit']);
  }

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hotel', route: '/' },
    { label: 'Bookings' },
  ];

  readonly isLoading = signal(true);
  readonly filterVisible = signal(false);
  readonly deleteConfirmVisible = signal(false);
  readonly statusModalVisible = signal(false);
  readonly exportDateRangeVisible = signal(false);
  exportDateRange: [Date, Date] | null = null;
  readonly selectedStatusOption = signal('Active');

  readonly statusModalOptions = [
    { label: 'Active', value: 'Active', description: 'Mark selected records as active and confirmed' },
    { label: 'Inactive', value: 'Inactive', description: 'Deactivate and cancel selected records' },
  ];

  readonly bookings = signal<Booking[]>([]);
  readonly totalRecords = signal(DUMMY_DATA.length);
  readonly selectedBookings = signal<Booking[]>([]);

  columns: TableColumn[] = [];

  // Filter options
  readonly statusOptions = [
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Checked In', value: 'Checked In' },
    { label: 'Checked Out', value: 'Checked Out' },
  ];

  readonly paymentStatusOptions = [
    { label: 'Paid', value: 'Paid' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Refunded', value: 'Refunded' },
  ];

  readonly supplierOptions = [
    { label: 'Hotelbeds', value: 'Hotelbeds' },
    { label: 'TBO Holidays', value: 'TBO Holidays' },
    { label: 'Expedia Partner', value: 'Expedia Partner' },
    { label: 'Direct Contract', value: 'Direct Contract' },
    { label: 'RateHawk', value: 'RateHawk' },
  ];

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedStatus()) count++;
    if (this.selectedPaymentStatus()) count++;
    if (this.checkInDate()) count++;
    const range = this.bookDateRange();
    if (range && range.length && range[0]) count++;
    if (this.selectedSupplier()) count++;
    return count;
  });

  readonly exportMenuItems = computed<MenuItem[]>(() => [
    {
      label: `Export Selected (${this.selectedBookings().length})`,
      icon: 'check_box',
      disabled: this.selectedBookings().length === 0,
      command: () => this.exportSelected(),
    },
    {
      label: 'Export by Date Range',
      icon: 'calendar_month',
      command: () => this.exportDateRangeVisible.set(true),
    },
    {
      label: `Export All (${this.totalRecords()})`,
      icon: 'database',
      command: () => this.exportAll(),
    },
  ]);

  readonly statusMenuItems: MenuItem[] = [
    { label: 'Confirmed', icon: 'check_circle', command: () => this.bulkUpdateStatus('Confirmed') },
    { label: 'Pending', icon: 'schedule', command: () => this.bulkUpdateStatus('Pending') },
    { label: 'Checked In', icon: 'login', command: () => this.bulkUpdateStatus('Checked In') },
    { label: 'Checked Out', icon: 'logout', command: () => this.bulkUpdateStatus('Checked Out') },
    { label: 'Cancelled', icon: 'cancel', command: () => this.bulkUpdateStatus('Cancelled') },
  ];

  // Filter state (Signals) - Nothing selected by default
  searchQuery: string = '';
  readonly selectedStatus = signal<string | null>(null);
  readonly selectedPaymentStatus = signal<string | null>(null);
  readonly checkInDate = signal<Date | null>(null);
  readonly bookDateRange = signal<[Date, Date] | null>(null);
  readonly selectedSupplier = signal<string | null>(null);

  private readonly searchSubject = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.bookingsService.load();
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query) => {
        this.searchQuery = query;
        this.simulateLoad({ first: 0, rows: 10 });
      });
  }

  onFilterSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  ngAfterViewInit(): void {
    this.columns = [
      { field: 'bookingRef', header: 'Booking Ref', sortable: true, width: '9rem' },
      { field: 'guestName', header: 'Guest Name', sortable: true, width: '10rem' },
      { field: 'hotel', header: 'Hotel', sortable: true, width: '12rem' },
      { field: 'city', header: 'City', sortable: true, width: '9rem' },
      { field: 'checkIn', header: 'Check In', sortable: true, width: '8.5rem' },
      { field: 'checkOut', header: 'Check Out', sortable: true, width: '8.5rem' },
      { field: 'rooms', header: 'Rooms', sortable: true, width: '6.5rem', align: 'center' },
      { field: 'amount', header: 'Amount (₹)', sortable: true, width: '8.5rem', align: 'right', bodyTemplate: this.amountTpl() },
      { field: 'paymentMethod', header: 'Payment Method', sortable: true, width: '11rem' },
      { field: 'status', header: 'Booking Status', sortable: true, width: '9.5rem', align: 'center', bodyTemplate: this.statusTpl() },
      { field: 'paymentStatus', header: 'Payment Status', sortable: true, width: '9.5rem', align: 'center', bodyTemplate: this.paymentStatusTpl() },
      { field: 'supplier', header: 'Supplier', sortable: true, width: '9.5rem' },
      { field: 'assignedUser', header: 'Assign User', sortable: true, width: '9.5rem' },
      { field: 'bookingDate', header: 'Book Date', sortable: true, width: '13rem', bodyTemplate: this.bookingDateTpl() },
      { field: 'actions', header: 'Action', width: '5.5rem', align: 'center', bodyTemplate: this.actionsTpl(), frozen: true, frozenAlign: 'right' },
    ];

    this.simulateLoad({ first: 0, rows: 10 });
  }

  simulateLoad(event: TableLazyEvent): void {
    this.isLoading.set(true);

    setTimeout(() => {
      const source = this.bookingsService.items();
      let data = source.length > 0 ? [...source] : [...DUMMY_DATA];

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        data = data.filter(
          (b) =>
            b.guestName.toLowerCase().includes(q) ||
            b.bookingRef.toLowerCase().includes(q) ||
            b.hotel.toLowerCase().includes(q) ||
            b.city.toLowerCase().includes(q)
        );
      }

      if (this.selectedStatus()) {
        data = data.filter((b) => b.status === this.selectedStatus());
      }

      if (this.selectedPaymentStatus()) {
        data = data.filter((b) => b.paymentStatus === this.selectedPaymentStatus());
      }

      if (this.checkInDate()) {
        const d = this.checkInDate()!;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        data = data.filter((b) => b.checkIn === dateStr);
      }

      const bRange = this.bookDateRange();
      if (bRange && bRange[0]) {
        const start = bRange[0].toISOString().split('T')[0];
        const end = bRange[1] ? bRange[1].toISOString().split('T')[0] : start;
        data = data.filter((b) => {
          const bDate = (b.bookingDate || '').split('T')[0];
          return bDate >= start && bDate <= end;
        });
      }

      if (this.selectedSupplier()) {
        data = data.filter((b) => b.supplier === this.selectedSupplier());
      }

      if (event.sortField) {
        data.sort((a: any, b: any) => {
          const valA = a[event.sortField!];
          const valB = b[event.sortField!];
          const result = valA < valB ? -1 : valA > valB ? 1 : 0;
          return (event.sortOrder ?? 1) * result;
        });
      }

      const page = data.slice(event.first, event.first + event.rows);
      this.bookings.set(page);
      this.totalRecords.set(data.length);
      this.isLoading.set(false);
    }, 800);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Cancelled': return 'badge-danger';
      case 'Checked In': return 'badge-info';
      case 'Checked Out': return 'badge-muted';
      default: return '';
    }
  }

  onApplyFilters(): void {
    this.simulateLoad({ first: 0, rows: 10 });
  }

  onResetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus.set(null);
    this.selectedPaymentStatus.set(null);
    this.checkInDate.set(null);
    this.bookDateRange.set(null);
    this.selectedSupplier.set(null);
    this.simulateLoad({ first: 0, rows: 10 });
  }

  onTableSearch(query: string): void {
    this.searchQuery = query;
    this.simulateLoad({ first: 0, rows: 10 });
  }

  bulkUpdateStatus(status: Booking['status']): void {
    const selectedIds = new Set(this.selectedBookings().map((b) => b.id));
    this.bookingsService.updateStatus(Array.from(selectedIds), status).subscribe({ error: () => {} });
    this.bookings.update((all) =>
      all.map((b) => (selectedIds.has(b.id) ? { ...b, status } : b))
    );
    this.selectedBookings.set([]);
  }

  bulkDelete(): void {
    const count = this.selectedBookings().length;
    if (!count) return;
    const selectedIds = new Set(this.selectedBookings().map((b) => b.id));
    this.bookingsService.deleteMultiple(Array.from(selectedIds)).subscribe({ error: () => {} });
    this.bookings.update((all) => all.filter((b) => !selectedIds.has(b.id)));
    this.totalRecords.update((t) => Math.max(0, t - count));
    this.selectedBookings.set([]);
  }

  private exportToCsv(data: Booking[], filename: string): void {
    exportToCsv(filename, data as unknown as Record<string, any>[], [
      { field: 'bookingRef', header: 'Booking Ref' },
      { field: 'guestName', header: 'Guest Name' },
      { field: 'hotel', header: 'Hotel' },
      { field: 'city', header: 'City' },
      { field: 'checkIn', header: 'Check In' },
      { field: 'checkOut', header: 'Check Out' },
      { field: 'rooms', header: 'Rooms' },
      { field: 'amount', header: 'Amount (INR)' },
      { field: 'paymentMethod', header: 'Payment Method' },
      { field: 'paymentStatus', header: 'Payment Status' },
      { field: 'assignedUser', header: 'Assigned User' },
      { field: 'supplier', header: 'Supplier' },
      { field: 'bookingDate', header: 'Booked On' },
      { field: 'status', header: 'Status' },
    ]);
  }

  exportSelected(): void {
    this.exportToCsv(this.selectedBookings(), `bookings_selected_${Date.now()}`);
  }

  onStatusModalConfirm(status: string): void {
    const targetStatus = status === 'Active' ? 'Confirmed' : 'Cancelled';
    this.bulkUpdateStatus(targetStatus as Booking['status']);
  }

  performDateRangeExport(): void {
    if (!this.exportDateRange || !this.exportDateRange[0]) return;
    const start = this.exportDateRange[0].toISOString().split('T')[0];
    const end = this.exportDateRange[1] ? this.exportDateRange[1].toISOString().split('T')[0] : start;
    const filtered = DUMMY_DATA.filter((b) => b.checkIn >= start && b.checkIn <= end);
    this.exportToCsv(filtered.length ? filtered : DUMMY_DATA, `bookings_date_range_${start}_${end}`);
    this.exportDateRangeVisible.set(false);
  }

  exportAll(): void {
    this.exportToCsv(DUMMY_DATA, `bookings_all_${Date.now()}`);
  }
}

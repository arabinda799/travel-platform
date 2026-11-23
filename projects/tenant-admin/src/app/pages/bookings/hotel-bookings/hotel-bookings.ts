import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
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
} from 'admin-core';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

export interface TenantHotelBooking {
  id: number;
  bookingRef: string;
  guestName: string;
  hotel: string;
  city: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  amount: number;
  commission: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  assignedUser: string;
  supplier: string;
  bookingDate: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked In' | 'Checked Out';
}

const DUMMY_HOTEL_BOOKINGS: TenantHotelBooking[] = Array.from({ length: 87 }, (_, i) => {
  const statuses: TenantHotelBooking['status'][] = ['Confirmed', 'Pending', 'Cancelled', 'Checked In', 'Checked Out'];
  const hotels = ['Taj Palace Delhi', 'Oberoi Mumbai', 'Leela Bangalore', 'ITC Grand Kolkata', 'Marriott Goa', 'Hyatt Jaipur'];
  const cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Goa', 'Jaipur'];
  const names = ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Sneha Reddy', 'Vikram Joshi', 'Ananya Das', 'Karan Malhotra', 'Deepa Nair'];
  const paymentMethods = ['Credit Card (Visa)', 'UPI - GPay', 'Corporate NetBanking', 'Razorpay', 'Paytm Wallet'];
  const paymentStatuses: TenantHotelBooking['paymentStatus'][] = ['Paid', 'Pending', 'Failed', 'Refunded'];
  const suppliers = ['Agoda B2B', 'Expedia Partner', 'TBO Holidays', 'Hotelbeds', 'Direct Contract'];
  const users = ['Amit K.', 'Sneha R.', 'Priya S.', 'Vikram M.'];

  const checkInDate = new Date(2026, 11, 1 + (i % 28));
  const nights = 1 + (i % 4);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + nights);

  const amount = 8500 + ((i * 3420) % 75000);
  const commission = Math.round(amount * 0.08);

  return {
    id: i + 1,
    bookingRef: `EF-HTL-${98000 + i}`,
    guestName: names[i % names.length],
    hotel: hotels[i % hotels.length],
    city: cities[i % cities.length],
    checkIn: checkInDate.toISOString().split('T')[0],
    checkOut: checkOutDate.toISOString().split('T')[0],
    rooms: 1 + (i % 3),
    amount,
    commission,
    paymentMethod: paymentMethods[i % paymentMethods.length],
    paymentStatus: paymentStatuses[i % paymentStatuses.length],
    assignedUser: users[i % users.length],
    supplier: suppliers[i % suppliers.length],
    bookingDate: new Date(2026, 10, 1 + (i % 28), 9 + (i % 12), ((i * 7) % 60)).toISOString(),
    status: statuses[i % statuses.length],
  };
});

@Component({
  selector: 'app-tenant-hotel-bookings',
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
  templateUrl: './hotel-bookings.html',
  styleUrl: './hotel-bookings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantHotelBookingsComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly paymentStatusTpl = viewChild<TemplateRef<any>>('paymentStatusTpl');
  readonly amountTpl = viewChild<TemplateRef<any>>('amountTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');
  readonly bookingDateTpl = viewChild<TemplateRef<any>>('bookingDateTpl');

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

  readonly bookings = signal<TenantHotelBooking[]>([]);
  readonly totalRecords = signal(DUMMY_HOTEL_BOOKINGS.length);
  readonly selectedBookings = signal<TenantHotelBooking[]>([]);

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
    { label: 'Agoda B2B', value: 'Agoda B2B' },
    { label: 'Expedia Partner', value: 'Expedia Partner' },
    { label: 'TBO Holidays', value: 'TBO Holidays' },
    { label: 'Hotelbeds', value: 'Hotelbeds' },
    { label: 'Direct Contract', value: 'Direct Contract' },
  ];

  // Filter states
  readonly selectedStatus = signal<string | null>(null);
  readonly selectedPaymentStatus = signal<string | null>(null);
  readonly checkInDate = signal<Date | null>(null);
  readonly bookDateRange = signal<[Date, Date] | null>(null);
  readonly selectedSupplier = signal<string | null>(null);
  readonly searchQuery = signal<string>('');

  private readonly searchSubject = new Subject<string>();

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedStatus()) count++;
    if (this.selectedPaymentStatus()) count++;
    if (this.checkInDate()) count++;
    if (this.bookDateRange()) count++;
    if (this.selectedSupplier()) count++;
    return count;
  });

  readonly exportMenuItems = signal<MenuItem[]>([
    {
      label: 'Quick Export',
      items: [
        {
          label: 'Export to Excel (.xlsx)',
          icon: 'table_view',
          command: () => this.exportToExcel(),
        },
        {
          label: 'Export to CSV',
          icon: 'description',
          command: () => this.exportToCSV(),
        },
      ],
    },
    {
      label: 'Filtered Export',
      items: [
        {
          label: 'Custom Date Range...',
          icon: 'date_range',
          command: () => {
            this.exportDateRange = null;
            this.exportDateRangeVisible.set(true);
          },
        },
      ],
    },
  ]);

  constructor() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(query => {
        this.searchQuery.set(query);
        this.simulateLoad({ first: 0, rows: 10 });
      });
  }

  ngAfterViewInit(): void {
    this.columns = [
      { field: 'bookingRef', header: 'Booking Ref', sortable: true, width: '10rem' },
      { field: 'guestName', header: 'Guest Name', sortable: true, width: '12rem' },
      { field: 'hotel', header: 'Hotel', sortable: true, width: '14rem' },
      { field: 'city', header: 'City', sortable: true, width: '9rem' },
      { field: 'checkIn', header: 'Check In', sortable: true, width: '8.5rem' },
      { field: 'checkOut', header: 'Check Out', sortable: true, width: '8.5rem' },
      { field: 'rooms', header: 'Rooms', sortable: true, width: '5.5rem', align: 'center' },
      {
        field: 'amount',
        header: 'Amount',
        sortable: true,
        width: '9.5rem',
        align: 'right',
        bodyTemplate: this.amountTpl() ?? undefined,
      },
      {
        field: 'status',
        header: 'Booking Status',
        sortable: true,
        width: '10.5rem',
        align: 'center',
        bodyTemplate: this.statusTpl() ?? undefined,
      },
      {
        field: 'paymentStatus',
        header: 'Payment',
        sortable: true,
        width: '9.5rem',
        align: 'center',
        bodyTemplate: this.paymentStatusTpl() ?? undefined,
      },
      {
        field: 'bookingDate',
        header: 'Booked On',
        sortable: true,
        width: '14rem',
        bodyTemplate: this.bookingDateTpl() ?? undefined,
      },
      {
        field: 'actions',
        header: 'Action',
        width: '7.5rem',
        align: 'center',
        frozen: true,
        frozenAlign: 'right',
        bodyTemplate: this.actionsTpl() ?? undefined,
      },
    ];

    this.simulateLoad({ first: 0, rows: 10 });
  }

  onTableSearch(query: string): void {
    this.searchSubject.next(query);
  }

  onApplyFilters(): void {
    this.filterVisible.set(false);
    this.simulateLoad({ first: 0, rows: 10 });
  }

  onResetFilters(): void {
    this.selectedStatus.set(null);
    this.selectedPaymentStatus.set(null);
    this.checkInDate.set(null);
    this.bookDateRange.set(null);
    this.selectedSupplier.set(null);
    this.searchQuery.set('');
    this.filterVisible.set(false);
    this.simulateLoad({ first: 0, rows: 10 });
  }

  simulateLoad(event: TableLazyEvent): void {
    this.isLoading.set(true);
    setTimeout(() => {
      let filtered = [...DUMMY_DATA_FILTER(this.searchQuery(), {
        status: this.selectedStatus(),
        paymentStatus: this.selectedPaymentStatus(),
        checkIn: this.checkInDate(),
        bookRange: this.bookDateRange(),
        supplier: this.selectedSupplier(),
      })];

      if (event.sortField) {
        const field = event.sortField as keyof TenantHotelBooking;
        const order = event.sortOrder ?? 1;
        filtered.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          return valA > valB ? order : valA < valB ? -order : 0;
        });
      }

      this.totalRecords.set(filtered.length);
      const start = event.first ?? 0;
      const end = start + (event.rows ?? 10);
      this.bookings.set(filtered.slice(start, end));
      this.isLoading.set(false);
    }, 250);
  }

  viewBooking(row: TenantHotelBooking): void {
    this.router.navigate(['/bookings/hotel', row.bookingRef]);
  }

  editBooking(row: TenantHotelBooking): void {
    this.router.navigate(['/bookings/hotel', row.bookingRef, 'edit']);
  }

  onConfirmDelete(): void {
    this.deleteConfirmVisible.set(false);
    this.selectedBookings.set([]);
  }

  onConfirmStatusChange(newStatus: string): void {
    this.statusModalVisible.set(false);
    this.selectedBookings.set([]);
  }

  exportToExcel(): void {}
  exportToCSV(): void {}

  confirmCustomDateExport(): void {
    if (this.exportDateRange && this.exportDateRange[0] && this.exportDateRange[1]) {
      this.exportDateRangeVisible.set(false);
    }
  }
}

function DUMMY_DATA_FILTER(
  search: string,
  filters: {
    status?: string | null;
    paymentStatus?: string | null;
    checkIn?: Date | null;
    bookRange?: [Date, Date] | null;
    supplier?: string | null;
  },
): TenantHotelBooking[] {
  return DUMMY_HOTEL_BOOKINGS.filter(b => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        b.bookingRef.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.hotel.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.status && b.status !== filters.status) return false;
    if (filters.paymentStatus && b.paymentStatus !== filters.paymentStatus) return false;
    if (filters.supplier && b.supplier !== filters.supplier) return false;
    if (filters.checkIn) {
      const d = new Date(b.checkIn);
      if (d.toDateString() !== filters.checkIn.toDateString()) return false;
    }
    if (filters.bookRange && filters.bookRange[0] && filters.bookRange[1]) {
      const bDate = new Date(b.bookingDate);
      if (bDate < filters.bookRange[0] || bDate > filters.bookRange[1]) return false;
    }
    return true;
  });
}

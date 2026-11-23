import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, TemplateRef, viewChild } from '@angular/core';
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
  ViewModalComponent,
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

export interface HotelQuery {
  id: number;
  queryId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  queryType: 'Price Inquiry' | 'Availability Check' | 'Room Upgrade Request' | 'Special Request' | 'Complaint' | 'Feedback' | 'Cancellation Request';
  queryStatus: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Pending';
  hotel: string;
  city: string;
  checkIn: string;
  checkOut: string;
  pax: string;
  message: string;
  response: string;
  assignedStaff: string;
  source: 'Website' | 'Email' | 'Phone' | 'WhatsApp' | 'App';
  createdDate: string;
  updatedDate: string;
}

const MESSAGES = [
  'We are planning a family vacation and would like to inquire about room availability and rates for the given dates. Please share the best available options.',
  'Looking for a suite with sea view for our anniversary trip. Would appreciate any special packages or offers available.',
  'Requesting information on early check-in facility and airport transfer services. Please advise on the costs.',
  'Would like to know about conference room facilities and catering options for a corporate event of 50 people.',
  'The room assigned to us does not match the booking description. We booked a superior room but were given a standard room.',
  'Very satisfied with the service. The staff was exceptional and the room was immaculate. Would highly recommend.',
  'We need to cancel our reservation due to an emergency. Please let us know the cancellation charges and refund timeline.',
  'Requesting a cot and extra blankets for our room. Also, is there a kids pool available at the property?',
];

const RESPONSES = [
  'Thank you for reaching out. We have noted your request and our team will get back to you within 24 hours with available options.',
  'We appreciate your interest. Our concierge has been informed and will contact you shortly with the requested details.',
  'We sincerely apologize for the inconvenience. This has been escalated to the property manager for immediate resolution.',
  'Your feedback has been recorded and shared with the management team. We look forward to hosting you again.',
  'The cancellation has been processed as per policy. Refund will be credited within 5–7 business days.',
  '',
  '',
];

const DUMMY_QUERIES: HotelQuery[] = Array.from({ length: 48 }, (_, i) => {
  const statuses: HotelQuery['queryStatus'][] = ['Open', 'In Progress', 'Resolved', 'Closed', 'Pending'];
  const types: HotelQuery['queryType'][] = [
    'Price Inquiry', 'Availability Check', 'Room Upgrade Request',
    'Special Request', 'Complaint', 'Feedback', 'Cancellation Request',
  ];
  const hotels = ['Taj Palace Delhi', 'Oberoi Mumbai', 'Leela Bangalore', 'ITC Grand Kolkata', 'Marriott Goa', 'Hyatt Jaipur'];
  const cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Goa', 'Jaipur'];
  const names = ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Sneha Reddy', 'Vikram Joshi', 'Ananya Das', 'Karan Malhotra', 'Deepa Nair'];
  const staff = ['Aarav Mehta', 'Neha Kapoor', 'Rohan Verma', 'Priya Nair', 'Siddharth Rao'];
  const paxList = ['2 Adults', '2 Adults, 1 Child', '1 Adult', '3 Adults', '2 Adults, 2 Children', '4 Adults'];
  const sources: HotelQuery['source'][] = ['Website', 'Email', 'Phone', 'WhatsApp', 'App'];
  const emails = ['rahul.s@example.com', 'priya.p@example.com', 'amit.singh@example.com', 'sneha.r@example.com',
    'vikram.j@example.com', 'ananya.d@example.com', 'karan.m@example.com', 'deepa.n@example.com'];
  const phones = ['9876543210', '9823456781', '9712345678', '9654321098', '9543219876', '9432198765', '9321987654', '9219876543'];

  return {
    id: 3001 + i,
    queryId: `QRY-${String(2026001 + i).slice(-6)}`,
    guestName: names[i % names.length],
    guestEmail: emails[i % emails.length],
    guestPhone: phones[i % phones.length],
    queryType: types[i % types.length],
    queryStatus: statuses[i % statuses.length],
    hotel: hotels[i % hotels.length],
    city: cities[i % cities.length],
    checkIn: `2026-${String(1 + (i % 12)).padStart(2, '0')}-${String(5 + (i % 20)).padStart(2, '0')}`,
    checkOut: `2026-${String(1 + (i % 12)).padStart(2, '0')}-${String(8 + (i % 20)).padStart(2, '0')}`,
    pax: paxList[i % paxList.length],
    message: MESSAGES[i % MESSAGES.length],
    response: RESPONSES[i % RESPONSES.length],
    assignedStaff: staff[i % staff.length],
    source: sources[i % sources.length],
    createdDate: `2026-01-${String(1 + (i % 28)).padStart(2, '0')}`,
    updatedDate: `2026-01-${String(2 + (i % 27)).padStart(2, '0')}`,
  };
});

@Component({
  selector: 'app-hotel-query-list',
  standalone: true,
  imports: [
    PageContainerComponent,
    DataTableComponent,
    FilterSidebarComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    StatusModalComponent,
    ModalComponent,
    ViewModalComponent,
    DateRangePickerComponent,
    SelectFieldComponent,
    DatePickerFieldComponent,
    StatusBadgeComponent,
    TableActionComponent,
    Menu,
  ],
  templateUrl: './hotel-query-list.html',
  styleUrl: './hotel-query-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelQueryListComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly queryStatusTpl = viewChild<TemplateRef<unknown>>('queryStatusTpl');
  readonly messageTpl = viewChild<TemplateRef<unknown>>('messageTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Hotel Bookings', route: '/bookings/hotel' },
    { label: 'Query List' },
  ];

  readonly isLoading = signal(true);
  readonly filterVisible = signal(false);
  readonly deleteConfirmVisible = signal(false);
  readonly statusModalVisible = signal(false);
  readonly exportDateRangeVisible = signal(false);
  readonly detailVisible = signal(false);
  readonly activeQuery = signal<HotelQuery | null>(null);
  exportDateRange: [Date, Date] | null = null;

  readonly statusModalOptions = [
    { label: 'Open', value: 'Open', description: 'Re-open selected queries' },
    { label: 'In Progress', value: 'In Progress', description: 'Mark selected queries as in progress' },
    { label: 'Resolved', value: 'Resolved', description: 'Mark selected queries as resolved' },
    { label: 'Closed', value: 'Closed', description: 'Close selected queries' },
  ];

  readonly exportMenuItems: MenuItem[] = [
    { label: 'Export as CSV', icon: 'pi pi-file', command: () => this.onExport('csv') },
    { label: 'Export as Excel', icon: 'pi pi-file-excel', command: () => this.onExport('excel') },
    { label: 'Export as PDF', icon: 'pi pi-file-pdf', command: () => this.onExport('pdf') },
  ];

  selectedQueries: HotelQuery[] = [];

  readonly selectedType = signal<string | null>(null);
  readonly selectedStatus = signal<string | null>(null);
  readonly selectedSource = signal<string | null>(null);
  readonly selectedDateRange = signal<Date[] | null>(null);
  searchQuery = '';
  private readonly search$ = new Subject<string>();

  readonly typeOptions = [
    { label: 'Price Inquiry', value: 'Price Inquiry' },
    { label: 'Availability Check', value: 'Availability Check' },
    { label: 'Room Upgrade Request', value: 'Room Upgrade Request' },
    { label: 'Special Request', value: 'Special Request' },
    { label: 'Complaint', value: 'Complaint' },
    { label: 'Feedback', value: 'Feedback' },
    { label: 'Cancellation Request', value: 'Cancellation Request' },
  ];

  readonly statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Pending', value: 'Pending' },
  ];

  readonly sourceOptions = [
    { label: 'Website', value: 'Website' },
    { label: 'Email', value: 'Email' },
    { label: 'Phone', value: 'Phone' },
    { label: 'WhatsApp', value: 'WhatsApp' },
    { label: 'App', value: 'App' },
  ];

  readonly allData = signal<HotelQuery[]>(DUMMY_QUERIES);
  readonly tableData = signal<HotelQuery[]>([]);
  readonly totalRecords = signal(DUMMY_QUERIES.length);
  readonly activeFilterCount = signal(0);

  private currentLazyEvent: TableLazyEvent = { first: 0, rows: 10, sortOrder: 1 };

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'queryId', header: 'Query ID', sortable: true, width: '9rem' },
    { field: 'queryType', header: 'Query Type', sortable: true, width: '12rem' },
    { field: 'queryStatus', header: 'Status', sortable: true, width: '8rem', align: 'center', bodyTemplate: this.queryStatusTpl() },
    { field: 'guestName', header: 'Guest Name', sortable: true, width: '10rem' },
    { field: 'guestEmail', header: 'Email', sortable: true, width: '12rem' },
    { field: 'guestPhone', header: 'Phone', sortable: false, width: '9.5rem' },
    { field: 'hotel', header: 'Hotel', sortable: true, width: '12rem' },
    { field: 'city', header: 'City', sortable: true, width: '8.5rem' },
    { field: 'checkIn', header: 'Check In', sortable: true, width: '8.5rem' },
    { field: 'checkOut', header: 'Check Out', sortable: true, width: '8.5rem' },
    { field: 'pax', header: 'Pax', sortable: false, width: '10rem' },
    { field: 'message', header: 'Message', sortable: false, width: '16rem', bodyTemplate: this.messageTpl() },
    { field: 'source', header: 'Source', sortable: true, width: '8rem' },
    { field: 'assignedStaff', header: 'Assigned To', sortable: true, width: '10rem' },
    { field: 'createdDate', header: 'Created At', sortable: true, width: '9rem' },
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
    if (this.selectedSource()) count++;
    const range = this.selectedDateRange();
    if (range && range.length > 0 && range[0]) count++;
    this.activeFilterCount.set(count);
    this.filterVisible.set(false);
    this.loadData({ ...this.currentLazyEvent, first: 0 });
  }

  onResetFilters(): void {
    this.selectedType.set(null);
    this.selectedStatus.set(null);
    this.selectedSource.set(null);
    this.selectedDateRange.set(null);
    this.activeFilterCount.set(0);
    this.filterVisible.set(false);
    this.loadData({ ...this.currentLazyEvent, first: 0 });
  }

  viewQuery(query: HotelQuery): void {
    this.activeQuery.set(query);
    this.detailVisible.set(true);
  }

  onBulkDelete(): void {
    this.deleteConfirmVisible.set(true);
  }

  confirmBulkDelete(): void {
    const selectedIds = new Set(this.selectedQueries.map(q => q.id));
    this.allData.update(list => list.filter(q => !selectedIds.has(q.id)));
    this.selectedQueries = [];
    this.deleteConfirmVisible.set(false);
    this.loadData({ ...this.currentLazyEvent, first: 0 });
  }

  onStatusModalConfirm(newStatus: string): void {
    const selectedIds = new Set(this.selectedQueries.map(q => q.id));
    this.allData.update(list =>
      list.map(q => (selectedIds.has(q.id) ? { ...q, queryStatus: newStatus as HotelQuery['queryStatus'] } : q)),
    );
    this.selectedQueries = [];
    this.statusModalVisible.set(false);
    this.loadData(this.currentLazyEvent);
  }

  onExport(_format: 'csv' | 'excel' | 'pdf'): void {
    this.exportDateRangeVisible.set(false);
  }

  private loadData(event: TableLazyEvent): void {
    this.isLoading.set(true);
    setTimeout(() => {
      let filtered = [...this.allData()];

      if (this.selectedType()) {
        filtered = filtered.filter(q => q.queryType === this.selectedType());
      }
      if (this.selectedStatus()) {
        filtered = filtered.filter(q => q.queryStatus === this.selectedStatus());
      }
      if (this.selectedSource()) {
        filtered = filtered.filter(q => q.source === this.selectedSource());
      }
      const range = this.selectedDateRange();
      if (range && range.length > 0 && range[0]) {
        const start = new Date(range[0]).setHours(0, 0, 0, 0);
        const end = range[1] ? new Date(range[1]).setHours(23, 59, 59, 999) : new Date(range[0]).setHours(23, 59, 59, 999);
        filtered = filtered.filter(q => {
          const t = new Date(q.createdDate).getTime();
          return isNaN(t) || (t >= start && t <= end);
        });
      }

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(q =>
          q.queryId.toLowerCase().includes(query) ||
          q.guestName.toLowerCase().includes(query) ||
          q.guestEmail.toLowerCase().includes(query) ||
          q.hotel.toLowerCase().includes(query) ||
          q.queryType.toLowerCase().includes(query) ||
          q.message.toLowerCase().includes(query),
        );
      }

      if (event.sortField) {
        const field = event.sortField as keyof HotelQuery;
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

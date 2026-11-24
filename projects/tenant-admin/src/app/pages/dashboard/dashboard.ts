import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Paginator } from 'primeng/paginator';
import {
  PageContainerComponent,
  BreadcrumbItem,
  DateRangePickerComponent,
  DateRangeSelection,
  StatusBadgeComponent,
  TableActionComponent,
  calculatePresetRange,
} from 'admin-core';

interface StatCard {
  icon: string;
  label: string;
  value: string;
  change: string;
  changeDir: 'up' | 'down';
  colorVar: string;
}

export interface TenantDashboardBooking {
  id: string;
  bookingRef: string;
  service: 'hotel' | 'flight';
  guest: string;
  paxCount: number;
  // Hotel specific
  roomCount?: number;
  hotel?: string;
  checkIn?: string;
  nights?: number;
  // Flight specific
  airline?: string;
  flightNo?: string;
  route?: string;
  travelDate?: string;
  cabinClass?: string;
  // Common
  amount: string;
  commission: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked In' | 'Checked Out' | 'Ticketed';
}

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    Select,
    Paginator,
    PageContainerComponent,
    DateRangePickerComponent,
    StatusBadgeComponent,
    TableActionComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantDashboardComponent {
  private readonly router = inject(Router);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Dashboard' },
  ];

  // Independent Date Range Pickers (as seen in platform-admin)
  readonly dashboardDateRange = signal<[Date, Date] | null>(calculatePresetRange('today'));
  readonly bookingTrendDateRange = signal<[Date, Date] | null>(calculatePresetRange('today'));
  readonly revenueDateRange = signal<[Date, Date] | null>(calculatePresetRange('today'));
  readonly recentBookingsDateRange = signal<[Date, Date] | null>(calculatePresetRange('today'));

  // 8 Agency Stat Cards matching agency focus
  readonly stats: StatCard[] = [
    { icon: 'calendar_month', label: 'Total Bookings', value: '1,420', change: '14.2% vs last period', changeDir: 'up', colorVar: 'accent' },
    { icon: 'payments', label: 'Revenue', value: '₹84.5L', change: '11.8%', changeDir: 'up', colorVar: 'success' },
    { icon: 'hotel', label: 'Hotel Bookings', value: '864', change: '8.4%', changeDir: 'up', colorVar: 'info' },
    { icon: 'flight', label: 'Flight Bookings', value: '556', change: '19.1%', changeDir: 'up', colorVar: 'warning' },
    { icon: 'undo', label: 'Pending Refunds', value: '7', change: '2 less', changeDir: 'down', colorVar: 'danger' },
    { icon: 'account_balance_wallet', label: 'Wallet Balance', value: '₹14.8L', change: '8.5%', changeDir: 'up', colorVar: 'success' },
    { icon: 'groups', label: 'Customers', value: '28,490', change: '15.1%', changeDir: 'up', colorVar: 'info' },
    { icon: 'price_check', label: 'Avg. Booking Value', value: '₹5,950', change: '4.1%', changeDir: 'up', colorVar: 'accent' },
  ];

  // Service Filter for Recent Bookings
  readonly serviceOptions = [
    { label: 'All Services', value: 'all' },
    { label: 'Hotel', value: 'hotel' },
    { label: 'Flight', value: 'flight' },
  ];
  readonly selectedService = signal<'all' | 'hotel' | 'flight'>('all');

  // Pagination state
  readonly first = signal<number>(0);
  readonly rows = signal<number>(5);
  readonly rowsPerPageOptions = [5, 10, 20];

  readonly allRecentBookings: TenantDashboardBooking[] = [
    {
      id: 'EF-HTL-90412',
      bookingRef: 'EF-HTL-90412',
      service: 'hotel',
      guest: 'Rahul Sharma',
      paxCount: 2,
      roomCount: 1,
      hotel: 'Taj Palace, Mumbai',
      checkIn: 'Dec 15, 2026',
      nights: 3,
      amount: '₹1,03,200',
      commission: '₹8,256',
      status: 'Confirmed',
    },
    {
      id: 'EF-FLT-80211',
      bookingRef: 'EF-FLT-80211',
      service: 'flight',
      guest: 'Arun K. Verma',
      paxCount: 1,
      airline: 'IndiGo',
      flightNo: '6E-204',
      route: 'DEL → BOM',
      travelDate: 'Nov 28, 2026',
      cabinClass: 'Economy',
      amount: '₹6,450',
      commission: '₹387',
      status: 'Ticketed',
    },
    {
      id: 'EF-HTL-89102',
      bookingRef: 'EF-HTL-89102',
      service: 'hotel',
      guest: 'Ananya Deshmukh',
      paxCount: 3,
      roomCount: 2,
      hotel: 'The Leela Goa, Cavelossim',
      checkIn: 'Dec 22, 2026',
      nights: 4,
      amount: '₹1,84,000',
      commission: '₹14,720',
      status: 'Confirmed',
    },
    {
      id: 'EF-FLT-79940',
      bookingRef: 'EF-FLT-79940',
      service: 'flight',
      guest: 'Deepak & Sneha Patel',
      paxCount: 2,
      airline: 'Air India',
      flightNo: 'AI-806',
      route: 'BOM → BLR',
      travelDate: 'Dec 02, 2026',
      cabinClass: 'Business',
      amount: '₹28,900',
      commission: '₹1,734',
      status: 'Confirmed',
    },
    {
      id: 'EF-HTL-77419',
      bookingRef: 'EF-HTL-77419',
      service: 'hotel',
      guest: 'Suresh Menon',
      paxCount: 1,
      roomCount: 1,
      hotel: 'Marriott Resort, Jaipur',
      checkIn: 'Nov 25, 2026',
      nights: 2,
      amount: '₹32,000',
      commission: '₹2,560',
      status: 'Checked Out',
    },
    {
      id: 'EF-FLT-75210',
      bookingRef: 'EF-FLT-75210',
      service: 'flight',
      guest: 'Vikram Joshi',
      paxCount: 1,
      airline: 'Vistara',
      flightNo: 'UK-945',
      route: 'DEL → SIN',
      travelDate: 'Dec 10, 2026',
      cabinClass: 'Premium Economy',
      amount: '₹42,300',
      commission: '₹2,538',
      status: 'Pending',
    },
  ];

  readonly filteredBookings = computed(() => {
    const s = this.selectedService();
    if (s === 'all') return this.allRecentBookings;
    return this.allRecentBookings.filter(b => b.service === s);
  });

  readonly pagedBookings = computed(() => {
    const start = this.first();
    const end = start + this.rows();
    return this.filteredBookings().slice(start, end);
  });

  onDashboardDateRangeChange(_range: DateRangeSelection): void {}
  onBookingTrendDateChange(_range: DateRangeSelection): void {}
  onRevenueDateChange(_range: DateRangeSelection): void {}
  onRecentBookingsDateChange(_range: DateRangeSelection): void {}

  onServiceChange(service: 'all' | 'hotel' | 'flight'): void {
    this.selectedService.set(service);
    this.first.set(0);
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    if (event.first !== undefined) this.first.set(event.first);
    if (event.rows !== undefined) this.rows.set(event.rows);
  }

  viewAllRoute(): string {
    const s = this.selectedService();
    if (s === 'flight') return '/bookings/hotel';
    return '/bookings/hotel';
  }

  viewBooking(booking: TenantDashboardBooking): void {
    if (booking.service === 'hotel') {
      this.router.navigate(['/bookings/hotel', booking.id]);
    } else {
      // Flight module routes to booking list
      this.router.navigate(['/bookings/hotel']);
    }
  }
}

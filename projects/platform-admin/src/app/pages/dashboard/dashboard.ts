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

export interface DashboardBooking {
  id: string;
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
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked In' | 'Checked Out' | 'Ticketed';
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, FormsModule, Select, Paginator, PageContainerComponent, DateRangePickerComponent, StatusBadgeComponent, TableActionComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly router = inject(Router);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Dashboard' },
  ];

  // Date Range Pickers (All defaulting to 'today')
  readonly dashboardDateRange = signal<[Date, Date] | null>(calculatePresetRange('today'));
  readonly bookingTrendDateRange = signal<[Date, Date] | null>(calculatePresetRange('today'));
  readonly revenueDateRange = signal<[Date, Date] | null>(calculatePresetRange('today'));
  readonly recentBookingsDateRange = signal<[Date, Date] | null>(calculatePresetRange('today'));

  // Service Filter for Recent Bookings
  readonly serviceOptions = [
    { label: 'All Services', value: 'all' },
    { label: 'Hotel', value: 'hotel' },
    { label: 'Flight', value: 'flight' },
  ];
  readonly selectedService = signal<'all' | 'hotel' | 'flight'>('all');

  // Pagination state for recent bookings table
  readonly first = signal<number>(0);
  readonly rows = signal<number>(5);
  readonly rowsPerPageOptions = [5, 10, 20];

  readonly stats: StatCard[] = [
    { icon: 'calendar_month', label: 'Total Bookings', value: '3,842', change: '12.5% vs last period', changeDir: 'up', colorVar: 'accent' },
    { icon: 'payments', label: 'Revenue', value: '₹2.4Cr', change: '8.2%', changeDir: 'up', colorVar: 'success' },
    { icon: 'apartment', label: 'Active Tenants', value: '156', change: '5 new', changeDir: 'up', colorVar: 'info' },
    { icon: 'group', label: 'Customers', value: '28,490', change: '15.1%', changeDir: 'up', colorVar: 'warning' },
    { icon: 'undo', label: 'Pending Refunds', value: '23', change: '3 less', changeDir: 'down', colorVar: 'danger' },
    { icon: 'account_balance_wallet', label: 'Platform Wallet', value: '₹1.08Cr', change: '22.3%', changeDir: 'up', colorVar: 'success' },
    { icon: 'percent', label: 'Avg. Markup Revenue', value: '₹28.5L', change: '6.7%', changeDir: 'up', colorVar: 'info' },
    { icon: 'credit_card', label: 'Convenience Fee', value: '₹9.6L', change: '9.1%', changeDir: 'up', colorVar: 'accent' },
  ];

  readonly allRecentBookings: DashboardBooking[] = [
    {
      id: 'BK-10042',
      service: 'hotel',
      guest: 'Rahul Sharma',
      paxCount: 2,
      roomCount: 1,
      hotel: 'Taj Palace, Mumbai',
      checkIn: 'Dec 15, 2026',
      nights: 3,
      amount: '₹1,03,200',
      status: 'Confirmed',
    },
    {
      id: 'FL-80211',
      service: 'flight',
      guest: 'Arun K. Verma',
      paxCount: 1,
      airline: 'IndiGo',
      flightNo: '6E-204',
      route: 'DEL → BOM',
      travelDate: 'Dec 16, 2026',
      cabinClass: 'Economy',
      amount: '₹8,450',
      status: 'Ticketed',
    },
    {
      id: 'BK-10041',
      service: 'hotel',
      guest: 'Priya Patel',
      paxCount: 3,
      roomCount: 2,
      hotel: 'Oberoi, Delhi',
      checkIn: 'Dec 18, 2026',
      nights: 2,
      amount: '₹78,500',
      status: 'Pending',
    },
    {
      id: 'FL-80210',
      service: 'flight',
      guest: 'Meera Nambiar',
      paxCount: 2,
      airline: 'Air India',
      flightNo: 'AI-802',
      route: 'BLR → DEL',
      travelDate: 'Dec 19, 2026',
      cabinClass: 'Business',
      amount: '₹34,200',
      status: 'Confirmed',
    },
    {
      id: 'BK-10040',
      service: 'hotel',
      guest: 'Amit Singh',
      paxCount: 4,
      roomCount: 2,
      hotel: 'Leela Palace, Bangalore',
      checkIn: 'Dec 20, 2026',
      nights: 4,
      amount: '₹1,45,000',
      status: 'Confirmed',
    },
    {
      id: 'FL-80209',
      service: 'flight',
      guest: 'Rohan Mehta',
      paxCount: 1,
      airline: 'Vistara',
      flightNo: 'UK-955',
      route: 'BOM → GOI',
      travelDate: 'Dec 21, 2026',
      cabinClass: 'Premium Economy',
      amount: '₹14,800',
      status: 'Confirmed',
    },
    {
      id: 'BK-10039',
      service: 'hotel',
      guest: 'Sneha Reddy',
      paxCount: 1,
      roomCount: 1,
      hotel: 'ITC Grand, Kolkata',
      checkIn: 'Dec 22, 2026',
      nights: 1,
      amount: '₹62,800',
      status: 'Cancelled',
    },
    {
      id: 'FL-80208',
      service: 'flight',
      guest: 'Kavita Das',
      paxCount: 3,
      airline: 'Akasa Air',
      flightNo: 'QP-1311',
      route: 'HYD → MAA',
      travelDate: 'Dec 23, 2026',
      cabinClass: 'Economy',
      amount: '₹18,900',
      status: 'Pending',
    },
    {
      id: 'BK-10038',
      service: 'hotel',
      guest: 'Vikram Joshi',
      paxCount: 2,
      roomCount: 1,
      hotel: 'Marriott, Goa',
      checkIn: 'Dec 24, 2026',
      nights: 5,
      amount: '₹91,300',
      status: 'Checked In',
    },
    {
      id: 'FL-80207',
      service: 'flight',
      guest: 'Deepak Chopra',
      paxCount: 2,
      airline: 'SpiceJet',
      flightNo: 'SG-412',
      route: 'DEL → CCU',
      travelDate: 'Dec 25, 2026',
      cabinClass: 'Economy',
      amount: '₹11,600',
      status: 'Confirmed',
    },
    {
      id: 'BK-10037',
      service: 'hotel',
      guest: 'Ananya Roy',
      paxCount: 2,
      roomCount: 1,
      hotel: 'Hyatt Regency, Pune',
      checkIn: 'Dec 26, 2026',
      nights: 2,
      amount: '₹42,000',
      status: 'Confirmed',
    },
    {
      id: 'FL-80206',
      service: 'flight',
      guest: 'Rajesh Khanna',
      paxCount: 1,
      airline: 'Air India',
      flightNo: 'AI-505',
      route: 'BOM → MAA',
      travelDate: 'Dec 27, 2026',
      cabinClass: 'Business',
      amount: '₹28,750',
      status: 'Ticketed',
    },
  ];

  readonly filteredBookings = computed(() => {
    const s = this.selectedService();
    if (s === 'all') {
      return this.allRecentBookings;
    }
    return this.allRecentBookings.filter((b) => b.service === s);
  });

  readonly totalRecords = computed(() => this.filteredBookings().length);

  readonly paginatedBookings = computed(() => {
    const start = this.first();
    const count = this.rows();
    return this.filteredBookings().slice(start, start + count);
  });

  readonly viewAllRoute = computed(() => {
    const s = this.selectedService();
    if (s === 'hotel') return '/hotel/bookings';
    if (s === 'flight') return '/hotel/bookings'; // or dedicated flight route
    return null;
  });

  onServiceChange(service: 'all' | 'hotel' | 'flight'): void {
    this.selectedService.set(service);
    this.first.set(0);
  }

  onPageChange(event: any): void {
    this.first.set(event.first);
    this.rows.set(event.rows);
  }

  onDashboardDateRangeChange(_selection: DateRangeSelection): void {}

  onBookingTrendDateChange(_selection: DateRangeSelection): void {}

  onRevenueDateChange(_selection: DateRangeSelection): void {}

  onRecentBookingsDateChange(_selection: DateRangeSelection): void {}

  viewBooking(booking: DashboardBooking): void {
    this.router.navigate(['/hotel/bookings', booking.id]);
  }

  editBooking(booking: DashboardBooking): void {
    this.router.navigate(['/hotel/bookings', booking.id, 'edit']);
  }
}

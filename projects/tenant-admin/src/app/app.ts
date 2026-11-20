import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminLayoutComponent, NavItem } from 'admin-core';

@Component({
  imports: [RouterOutlet, AdminLayoutComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly title = signal('EasyFlys Tenant Portal');

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/' },
    { label: 'Bookings & Orders', isSection: true },
    {
      label: 'Bookings',
      icon: 'calendar_month',
      expanded: false,
      children: [
        { label: 'Hotel Bookings', icon: 'hotel', route: '/bookings/hotel' },
        { label: 'Flight Bookings', icon: 'flight', route: '/bookings/flight' },
      ],
    },
    { label: 'Agent Management', isSection: true },
    { label: 'Sub-Agents', icon: 'group', route: '/agents' },
    { label: 'Credit Limit & Ledger', icon: 'account_balance_wallet', route: '/ledger' },
    { label: 'Account & Settings', isSection: true },
    { label: 'Company Profile', icon: 'business', route: '/profile' },
    { label: 'Users & Roles', icon: 'manage_accounts', route: '/users' },
  ];
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminLayoutComponent, NavItem } from 'admin-core';

@Component({
  imports: [RouterOutlet, AdminLayoutComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly title = signal('EasyFlys Tenant Portal');

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/' },

    // Hotel Management Section
    { label: 'Hotel Management', isSection: true },
    {
      label: 'Bookings',
      icon: 'calendar_month',
      expanded: false,
      children: [
        { label: 'Booking List', icon: 'format_list_bulleted', route: '/bookings/hotel' },
        { label: 'Amendment List', icon: 'edit_calendar', route: '/bookings/hotel/amendments' },
        { label: 'Refund List', icon: 'currency_exchange', route: '/bookings/hotel/refunds' },
        { label: 'Hotel Query List', icon: 'contact_support', route: '/bookings/hotel/queries' },
      ],
    },
    {
      label: 'Hotel Extranet Management',
      icon: 'hotel',
      expanded: false,
      children: [
        { label: 'Trending Destinations', icon: 'trending_up', route: '/hotel/trending-destinations' },
        { label: 'Popular Hotels', icon: 'star', route: '/hotel/popular-hotels' },
      ],
    },

    // Users & Access Section
    { label: 'Users & Access', isSection: true },
    { label: 'Staff Users', icon: 'badge', route: '/users/staff' },
    { label: 'Customers', icon: 'groups', route: '/users/customers' },
    { label: 'Roles & Permission', icon: 'shield_person', route: '/users/roles' },

    // Finance Section
    { label: 'Finance', isSection: true },
    {
      label: 'Markup',
      icon: 'percent',
      expanded: false,
      children: [
        { label: 'Hotel Markup', icon: 'add_circle', route: '/finance/markup/hotel' },
      ],
    },
    {
      label: 'Discount',
      icon: 'loyalty',
      expanded: false,
      children: [
        { label: 'Hotel Discount', icon: 'local_offer', route: '/finance/discount/hotel' },
      ],
    },
    {
      label: 'Coupon',
      icon: 'confirmation_number',
      expanded: false,
      children: [
        { label: 'Hotel Coupon', icon: 'sell', route: '/finance/coupon/hotel' },
      ],
    },
    { label: 'Wallet', icon: 'account_balance_wallet', route: '/finance/wallet' },
    { label: 'Transactions', icon: 'receipt_long', route: '/finance/transactions' },

    // Content Section
    { label: 'Content', isSection: true },
    {
      label: 'Pages',
      icon: 'auto_stories',
      expanded: false,
      children: [
        { label: 'Page List', icon: 'description', route: '/content/pages' },
        { label: 'Menu List', icon: 'menu_open', route: '/content/pages/menus' },
      ],
    },
    {
      label: 'Blogs',
      icon: 'rss_feed',
      expanded: false,
      children: [
        { label: 'Category', icon: 'category', route: '/content/blogs/categories' },
        { label: 'Blog List', icon: 'article', route: '/content/blogs' },
      ],
    },
    { label: 'Sliders', icon: 'view_carousel', route: '/content/sliders' },
    { label: 'Newsletter', icon: 'mail', route: '/content/newsletter' },
    { label: 'Query List', icon: 'contact_mail', route: '/content/queries' },

    // System Section
    { label: 'System', isSection: true },
    { label: 'Reports', icon: 'bar_chart', route: '/system/reports' },
    {
      label: 'Settings',
      icon: 'settings',
      expanded: false,
      children: [
        { label: 'Company Setting', icon: 'business', route: '/system/settings/company' },
        { label: 'Profile', icon: 'person', route: '/system/settings/profile' },
        { label: 'Vendor List', icon: 'storefront', route: '/system/settings/vendors' },
        { label: 'Payment Gateway List', icon: 'credit_card', route: '/system/settings/payment-gateways' },
        { label: 'Convenience Fee', icon: 'payments', route: '/system/settings/convenience-fee' },
      ],
    },
    {
      label: 'Logs',
      icon: 'history',
      expanded: false,
      children: [
        { label: 'Email', icon: 'email', route: '/system/logs/email' },
        { label: 'SMS', icon: 'sms', route: '/system/logs/sms' },
        { label: 'Login', icon: 'login', route: '/system/logs/login' },
        { label: 'Coupon', icon: 'confirmation_number', route: '/system/logs/coupon' },
      ],
    },
  ];
}

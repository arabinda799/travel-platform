import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { AdminLayoutComponent, NavItem, trimImagePadding } from 'admin-core';
import { CompanySettingsService } from './pages/settings/company-settings/company-settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AdminLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly settingsService = inject(CompanySettingsService);
  private readonly router = inject(Router);
  readonly title = signal('platform-admin');

  readonly isAuthRoute = signal(this.router.url.startsWith('/auth'));
  readonly isMaintenance = this.settingsService.maintenanceMode;
  readonly maintenanceMsg = this.settingsService.maintenanceMsg;

  retryLoad(): void {
    this.settingsService.load().subscribe();
  }

  readonly settings = this.settingsService.settings;

  readonly brandLogo = computed(() => {
    const s = this.settings();
    let logo = s.logos?.['dark'] || s.logos?.['light'] || '';
    if (logo && logo.startsWith('http://') && !logo.includes('localhost')) {
      logo = logo.replace('http://', 'https://');
    }
    return logo;
  });

  readonly brandFavicon = computed(() => {
    const s = this.settings();
    let fav = s.logos?.['favicon'] || '';
    if (fav && fav.startsWith('http://') && !fav.includes('localhost')) {
      fav = fav.replace('http://', 'https://');
    }
    return fav;
  });

  readonly trimmedBrandLogo = signal<string>('');
  readonly trimmedBrandFavicon = signal<string>('');

  readonly companyName = computed(() => {
    const s = this.settings();
    return s.companyName || 'EasyFlys';
  });

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(e => {
        this.isAuthRoute.set(e.urlAfterRedirects.startsWith('/auth'));
      });

    // Load platform settings on startup so brand name + logos are available app-wide
    this.settingsService.load().subscribe();

    effect(() => {
      const logo = this.brandLogo();
      if (!logo) {
        this.trimmedBrandLogo.set('');
      } else {
        trimImagePadding(logo).then(res => this.trimmedBrandLogo.set(res));
      }
    });

    effect(() => {
      const fav = this.brandFavicon();
      if (!fav) {
        this.trimmedBrandFavicon.set('');
      } else {
        trimImagePadding(fav).then(res => this.trimmedBrandFavicon.set(res));
        // Dynamically update browser tab favicon with proper MIME type
        const cleanFav = fav.startsWith('http://') && !fav.includes('localhost')
          ? fav.replace('http://', 'https://')
          : fav;
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        if (cleanFav.endsWith('.png')) {
          link.type = 'image/png';
        } else if (cleanFav.endsWith('.svg')) {
          link.type = 'image/svg+xml';
        } else {
          link.type = 'image/x-icon';
        }
        link.href = cleanFav;
        document.head.appendChild(link);
      }
    });

    effect(() => {
      const name = this.companyName();
      if (name) {
        document.title = `${name} | Platform Admin`;
      }
    });
  }

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/' },

    // Hotel Management Section
    { label: 'Hotel Management', isSection: true },
    {
      label: 'Bookings',
      icon: 'calendar_month',
      expanded: false,
      children: [
        { label: 'Booking List', icon: 'format_list_bulleted', route: '/hotel/bookings' },
        { label: 'Amendment List', icon: 'edit_calendar', route: '/hotel/amendments' },
        { label: 'Refund List', icon: 'currency_exchange', route: '/hotel/refunds' },
        { label: 'Hotel Query List', icon: 'contact_support', route: '/hotel/queries' },
      ],
    },
    { label: 'Trending Destinations', icon: 'explore', route: '/hotel/trending-destinations' },
    { label: 'Popular Hotels', icon: 'hotel', route: '/hotel/popular-hotels' },

    // Content Section
    { label: 'Content', isSection: true },
    {
      label: 'Blog',
      icon: 'article',
      expanded: false,
      children: [
        { label: 'Blog Posts', icon: 'edit_note', route: '/content/blogs' },
        { label: 'Blog Categories', icon: 'category', route: '/content/blog-categories' },
      ],
    },

    // Users & Access Section
    { label: 'Users & Access', isSection: true },
    { label: 'Platform Users', icon: 'badge', route: '/users/platform' },
    {
      label: 'Tenant Management',
      icon: 'corporate_fare',
      expanded: false,
      children: [
        { label: 'Company List', icon: 'domain', route: '/tenants/companies' },
        { label: 'User List', icon: 'people', route: '/tenants/users' },
      ],
    },
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

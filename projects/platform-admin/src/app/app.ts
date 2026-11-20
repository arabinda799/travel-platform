import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminLayoutComponent, NavItem } from 'admin-core';
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
  readonly title = signal('platform-admin');

  readonly settings = this.settingsService.settings;

  // Dark-mode sidebar prefers dark logo, then light logo
  readonly brandLogo = computed(() => {
    const s = this.settings();
    return s.logos?.['dark'] || s.logos?.['light'] || '';
  });

  readonly brandFavicon = computed(() => {
    const s = this.settings();
    return s.logos?.['favicon'] || '';
  });

  readonly trimmedBrandLogo = signal<string>('');
  readonly trimmedBrandFavicon = signal<string>('');

  readonly companyName = computed(() => {
    const s = this.settings();
    return s.companyName || 'EasyFlys';
  });

  constructor() {
    effect(() => {
      const logo = this.brandLogo();
      if (!logo) {
        this.trimmedBrandLogo.set('');
      } else {
        this.trimTransparentPadding(logo, res => this.trimmedBrandLogo.set(res));
      }
    });

    effect(() => {
      const fav = this.brandFavicon();
      if (!fav) {
        this.trimmedBrandFavicon.set('');
      } else {
        this.trimTransparentPadding(fav, res => this.trimmedBrandFavicon.set(res));
      }
    });
  }

  private trimTransparentPadding(src: string, callback: (trimmed: string) => void): void {
    if (typeof window === 'undefined' || src.startsWith('data:image/svg')) {
      callback(src);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) {
          callback(src);
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          callback(src);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);

        let top = h;
        let left = w;
        let right = 0;
        let bottom = 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const alpha = data[(y * w + x) * 4 + 3];
            if (alpha > 15) {
              if (x < left) left = x;
              if (x > right) right = x;
              if (y < top) top = y;
              if (y > bottom) bottom = y;
            }
          }
        }

        if (right < left || bottom < top) {
          callback(src);
          return;
        }

        const cropW = right - left + 1;
        const cropH = bottom - top + 1;
        const out = document.createElement('canvas');
        out.width = cropW;
        out.height = cropH;
        const outCtx = out.getContext('2d');
        if (!outCtx) {
          callback(src);
          return;
        }
        outCtx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);
        callback(out.toDataURL('image/png'));
      } catch {
        callback(src);
      }
    };
    img.onerror = () => callback(src);
    img.src = src;
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

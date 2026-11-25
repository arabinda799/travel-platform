import { Injectable, inject, signal, computed } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/** List of URL path prefixes that are fully dynamic (connected to live backend API) */
const DYNAMIC_ROUTE_PREFIXES = [
  // Users & Access (Staff, Customers, Roles, Permissions)
  '/users',
  // Tenants & Tenant Management
  '/tenants',
  // Settings (Company Settings, Profile, Payment Gateways, etc.)
  '/system/settings',
  '/settings',
  // Hotel Extranet Content
  '/hotel/trending-destinations',
  '/hotel/popular-hotels',
  // Blogs & Articles
  '/content/blogs',
  // Sliders
  '/content/sliders',
  // Finance (Coupons, Markups, Discounts)
  '/finance/coupon',
  '/finance/discount',
  '/finance/markup',
  // Logs with dynamic backend data
  '/system/logs/coupon',
  // Auth
  '/auth',
];

@Injectable({ providedIn: 'root' })
export class PageModeService {
  private readonly router = inject(Router);

  /** Current URL signal */
  private readonly currentUrlSignal = signal<string>(this.router.url || '');

  /** Manual override signal: null = auto-detect, true = static, false = dynamic */
  private readonly manualOverrideSignal = signal<boolean | null>(null);

  /** Computed flag: true if current page is static/mock, false if dynamic API connected */
  readonly isStatic = computed(() => {
    const override = this.manualOverrideSignal();
    if (override !== null) return override;

    const url = this.currentUrlSignal().split('?')[0].split('#')[0];
    if (!url || url === '/' || url === '/dashboard') {
      return true; // Dashboard is currently static mock data
    }

    // If matches any dynamic route, it is dynamic
    const isDynamic = DYNAMIC_ROUTE_PREFIXES.some(prefix => url.startsWith(prefix));
    return !isDynamic;
  });

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(event => {
        this.currentUrlSignal.set(event.urlAfterRedirects || event.url);
        // Reset manual override on navigation
        this.manualOverrideSignal.set(null);
      });
  }

  /** Manually override page mode if needed */
  setOverride(isStatic: boolean | null): void {
    this.manualOverrideSignal.set(isStatic);
  }
}

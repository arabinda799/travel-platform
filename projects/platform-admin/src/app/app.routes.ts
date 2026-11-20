import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
  },
  {
    path: 'hotel/bookings',
    loadComponent: () =>
      import('./pages/demo/demo-table').then(m => m.DemoTableComponent),
  },
  {
    path: 'hotel/bookings/:id',
    loadComponent: () =>
      import('./pages/hotel/booking-confirmation/booking-confirmation').then(
        m => m.BookingConfirmationComponent,
      ),
  },
  {
    path: 'hotel/bookings/:id/edit',
    loadComponent: () =>
      import('./pages/hotel/hotel-booking-edit/hotel-booking-edit').then(
        m => m.HotelBookingEditComponent,
      ),
  },
  {
    path: 'hotel/edit/:id',
    loadComponent: () =>
      import('./pages/hotel/hotel-booking-edit/hotel-booking-edit').then(
        m => m.HotelBookingEditComponent,
      ),
  },
  {
    path: 'hotel/amendments',
    loadComponent: () =>
      import('./pages/hotel/amendment-list/amendment-list').then(
        m => m.AmendmentListComponent,
      ),
  },
  {
    path: 'hotel/amendments/:id',
    loadComponent: () =>
      import('./pages/hotel/amendment-detail/amendment-detail').then(
        m => m.AmendmentDetailComponent,
      ),
  },
  {
    path: 'hotel/refunds',
    loadComponent: () =>
      import('./pages/hotel/refund-list/refund-list').then(
        m => m.RefundListComponent,
      ),
  },
  {
    path: 'hotel/queries',
    loadComponent: () =>
      import('./pages/hotel/hotel-query-list/hotel-query-list').then(
        m => m.HotelQueryListComponent,
      ),
  },
  {
    path: 'hotel/trending-destinations',
    loadComponent: () =>
      import('./pages/hotel/trending-destinations/trending-destinations').then(
        m => m.TrendingDestinationsComponent,
      ),
  },
  {
    path: 'hotel/popular-hotels',
    loadComponent: () =>
      import('./pages/hotel/popular-hotels/popular-hotels').then(
        m => m.PopularHotelsComponent,
      ),
  },
  {
    path: 'finance/markup/hotel',
    loadComponent: () =>
      import('./pages/finance/hotel-markup/hotel-markup').then(
        m => m.HotelMarkupComponent,
      ),
  },
  {
    path: 'finance/discount/hotel',
    loadComponent: () =>
      import('./pages/finance/hotel-discount/hotel-discount').then(
        m => m.HotelDiscountComponent,
      ),
  },
  {
    path: 'content/blogs/categories',
    loadComponent: () =>
      import('./pages/content/blog-categories/blog-categories').then(
        m => m.BlogCategoriesComponent,
      ),
  },
  {
    path: 'content/blogs',
    loadComponent: () =>
      import('./pages/content/blog-list/blog-list').then(
        m => m.BlogListComponent,
      ),
  },
  {
    path: 'content/sliders',
    loadComponent: () =>
      import('./pages/content/sliders/sliders').then(
        m => m.SlidersComponent,
      ),
  },
  {
    path: 'content/newsletter',
    loadComponent: () =>
      import('./pages/content/newsletter/newsletter').then(
        m => m.NewsletterComponent,
      ),
  },
  {
    path: 'content/queries',
    loadComponent: () =>
      import('./pages/content/contact-queries/contact-queries').then(
        m => m.ContactQueriesComponent,
      ),
  },
  {
    path: 'content/contact-us',
    redirectTo: 'content/queries',
    pathMatch: 'full',
  },
  {
    path: 'finance/coupon/hotel',
    loadComponent: () =>
      import('./pages/finance/hotel-coupon/hotel-coupon').then(
        m => m.HotelCouponComponent,
      ),
  },
  {
    path: 'system/settings/company',
    loadComponent: () =>
      import('./pages/settings/company-settings/company-settings').then(
        m => m.CompanySettingsComponent,
      ),
  },
  {
    path: 'system/settings/profile',
    loadComponent: () =>
      import('./pages/settings/profile/profile').then(m => m.ProfileComponent),
  },
  {
    path: 'system/settings/vendors',
    loadComponent: () =>
      import('./pages/settings/vendor-list/vendor-list').then(
        m => m.VendorListComponent,
      ),
  },
  {
    path: 'system/settings/payment-gateways',
    loadComponent: () =>
      import('./pages/settings/payment-gateways/payment-gateways').then(
        m => m.PaymentGatewaysComponent,
      ),
  },
  {
    path: 'system/settings/convenience-fee',
    loadComponent: () =>
      import('./pages/settings/convenience-fee/convenience-fee').then(
        m => m.ConvenienceFeeComponent,
      ),
  },
  {
    path: 'settings/payment-gateways',
    redirectTo: 'system/settings/payment-gateways',
    pathMatch: 'full',
  },
  {
    path: 'settings/convenience-fee',
    redirectTo: 'system/settings/convenience-fee',
    pathMatch: 'full',
  },
  {
    path: 'system/reports',
    loadComponent: () =>
      import('./pages/system/reports/reports').then(m => m.ReportsComponent),
  },
  {
    path: 'reports',
    redirectTo: 'system/reports',
    pathMatch: 'full',
  },
  {
    path: 'system/logs/email',
    loadComponent: () =>
      import('./pages/logs/email-logs/email-logs').then(m => m.EmailLogsComponent),
  },
  {
    path: 'system/logs/sms',
    loadComponent: () =>
      import('./pages/logs/sms-logs/sms-logs').then(m => m.SmsLogsComponent),
  },
  {
    path: 'system/logs/login',
    loadComponent: () =>
      import('./pages/logs/login-logs/login-logs').then(m => m.LoginLogsComponent),
  },
  {
    path: 'system/logs/coupon',
    loadComponent: () =>
      import('./pages/logs/coupon-logs/coupon-logs').then(m => m.CouponLogsComponent),
  },
  {
    path: 'content/pages',
    loadComponent: () =>
      import('./pages/content/page-list/page-list').then(m => m.PageListComponent),
  },
  {
    path: 'content/pages/menus',
    loadComponent: () =>
      import('./pages/content/menu-list/menu-list').then(m => m.MenuListComponent),
  },
  {
    path: 'tenants/companies',
    loadComponent: () =>
      import('./pages/tenants/company-list/company-list').then(
        m => m.CompanyListComponent,
      ),
  },
  {
    path: 'tenants/companies/:id/settings',
    loadComponent: () =>
      import('./pages/tenants/company-settings/company-settings').then(
        m => m.TenantCompanySettingsComponent,
      ),
  },
  {
    path: 'tenants/users',
    loadComponent: () =>
      import('./pages/tenants/tenant-user-list/tenant-user-list').then(
        m => m.TenantUserListComponent,
      ),
  },
  {
    path: 'tenants/users/:id/permissions',
    loadComponent: () =>
      import('./pages/tenants/tenant-user-permissions/tenant-user-permissions').then(
        m => m.TenantUserPermissionsComponent,
      ),
  },
  {
    path: 'users/customers',
    loadComponent: () =>
      import('./pages/users/customer-list/customer-list').then(
        m => m.CustomerListComponent,
      ),
  },
  {
    path: 'users/roles',
    loadComponent: () =>
      import('./pages/users/role-list/role-list').then(
        m => m.RoleListComponent,
      ),
  },
  {
    path: 'users/roles/:id/permissions',
    loadComponent: () =>
      import('./pages/users/role-permissions/role-permissions').then(
        m => m.RolePermissionsComponent,
      ),
  },
  {
    path: 'users/platform',
    loadComponent: () =>
      import('./pages/users/platform-user-list/platform-user-list').then(
        m => m.PlatformUserListComponent,
      ),
  },
  {
    path: 'users/platform/:id/permissions',
    loadComponent: () =>
      import('./pages/users/user-permissions/user-permissions').then(
        m => m.UserPermissionsComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then(m => m.NotFoundComponent),
  },
];

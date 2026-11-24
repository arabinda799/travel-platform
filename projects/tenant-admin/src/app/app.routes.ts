import { Routes } from '@angular/router';
import { authGuard } from 'admin-core';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(m => m.TenantDashboardComponent),
      },
      {
        path: 'dashboard',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'bookings/hotel',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./pages/bookings/hotel-bookings/hotel-bookings').then(
                m => m.TenantHotelBookingsComponent,
              ),
          },
          {
            path: 'amendments',
            children: [
              {
                path: '',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./pages/bookings/amendment-list/amendment-list').then(
                    m => m.AmendmentListComponent,
                  ),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./pages/bookings/amendment-detail/amendment-detail').then(
                    m => m.AmendmentDetailComponent,
                  ),
              },
            ],
          },
          {
            path: 'refunds',
            loadComponent: () =>
              import('./pages/bookings/refund-list/refund-list').then(
                m => m.RefundListComponent,
              ),
          },
          {
            path: 'queries',
            loadComponent: () =>
              import('./pages/bookings/hotel-query-list/hotel-query-list').then(
                m => m.HotelQueryListComponent,
              ),
          },
          {
            path: ':id',
            children: [
              {
                path: '',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./pages/bookings/booking-confirmation/booking-confirmation').then(
                    m => m.BookingConfirmationComponent,
                  ),
              },
              {
                path: 'edit',
                loadComponent: () =>
                  import('./pages/bookings/hotel-booking-edit/hotel-booking-edit').then(
                    m => m.HotelBookingEditComponent,
                  ),
              },
            ],
          },
        ],
      },
      {
        path: 'hotel',
        children: [
          {
            path: 'trending-destinations',
            loadComponent: () =>
              import('./pages/hotel/trending-destinations/trending-destinations').then(
                m => m.TrendingDestinationsComponent,
              ),
          },
          {
            path: 'popular-hotels',
            loadComponent: () =>
              import('./pages/hotel/popular-hotels/popular-hotels').then(
                m => m.PopularHotelsComponent,
              ),
          },
        ],
      },
      {
        path: 'users',
        children: [
          {
            path: 'staff',
            children: [
              {
                path: '',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./pages/users/staff-user-list/staff-user-list').then(
                    m => m.StaffUserListComponent,
                  ),
              },
              {
                path: ':id/permissions',
                loadComponent: () =>
                  import('./pages/users/user-permissions/user-permissions').then(
                    m => m.UserPermissionsComponent,
                  ),
              },
            ],
          },
          {
            path: 'customers',
            loadComponent: () =>
              import('./pages/users/customer-list/customer-list').then(
                m => m.CustomerListComponent,
              ),
          },
          {
            path: 'roles',
            children: [
              {
                path: '',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./pages/users/role-list/role-list').then(
                    m => m.RoleListComponent,
                  ),
              },
              {
                path: ':id/permissions',
                loadComponent: () =>
                  import('./pages/users/role-permissions/role-permissions').then(
                    m => m.RolePermissionsComponent,
                  ),
              },
            ],
          },
        ],
      },
      {
        path: 'finance',
        children: [
          {
            path: 'markup/hotel',
            loadComponent: () =>
              import('./pages/finance/hotel-markup/hotel-markup').then(
                m => m.HotelMarkupComponent,
              ),
          },
          {
            path: 'discount/hotel',
            loadComponent: () =>
              import('./pages/finance/hotel-discount/hotel-discount').then(
                m => m.HotelDiscountComponent,
              ),
          },
          {
            path: 'coupon/hotel',
            loadComponent: () =>
              import('./pages/finance/hotel-coupon/hotel-coupon').then(
                m => m.HotelCouponComponent,
              ),
          },
          {
            path: 'wallet',
            loadComponent: () =>
              import('./pages/finance/wallet/wallet').then(m => m.WalletComponent),
          },
          {
            path: 'transactions',
            loadComponent: () =>
              import('./pages/finance/transactions/transactions').then(
                m => m.TransactionsComponent,
              ),
          },
        ],
      },
      {
        path: 'content',
        children: [
          {
            path: 'pages',
            children: [
              {
                path: '',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./pages/content/page-list/page-list').then(
                    m => m.PageListComponent,
                  ),
              },
              {
                path: 'menus',
                loadComponent: () =>
                  import('./pages/content/menu-list/menu-list').then(
                    m => m.MenuListComponent,
                  ),
              },
            ],
          },
          {
            path: 'blogs',
            children: [
              {
                path: '',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./pages/content/blog-list/blog-list').then(
                    m => m.BlogListComponent,
                  ),
              },
              {
                path: 'categories',
                loadComponent: () =>
                  import('./pages/content/blog-categories/blog-categories').then(
                    m => m.BlogCategoriesComponent,
                  ),
              },
            ],
          },
          {
            path: 'sliders',
            loadComponent: () =>
              import('./pages/content/sliders/sliders').then(
                m => m.SlidersComponent,
              ),
          },
          {
            path: 'newsletter',
            loadComponent: () =>
              import('./pages/content/newsletter/newsletter').then(
                m => m.NewsletterComponent,
              ),
          },
          {
            path: 'queries',
            loadComponent: () =>
              import('./pages/content/contact-queries/contact-queries').then(
                m => m.ContactQueriesComponent,
              ),
          },
        ],
      },
      {
        path: 'system',
        children: [
          {
            path: 'reports',
            loadComponent: () =>
              import('./pages/system/reports/reports').then(
                m => m.ReportsComponent,
              ),
          },
          {
            path: 'settings',
            children: [
              {
                path: 'company',
                loadComponent: () =>
                  import('./pages/settings/company-settings/company-settings').then(
                    m => m.CompanySettingsComponent,
                  ),
              },
              {
                path: 'profile',
                loadComponent: () =>
                  import('./pages/settings/profile/profile').then(
                    m => m.ProfileComponent,
                  ),
              },
              {
                path: 'vendors',
                loadComponent: () =>
                  import('./pages/settings/vendor-list/vendor-list').then(
                    m => m.VendorListComponent,
                  ),
              },
              {
                path: 'payment-gateways',
                loadComponent: () =>
                  import('./pages/settings/payment-gateways/payment-gateways').then(
                    m => m.PaymentGatewaysComponent,
                  ),
              },
              {
                path: 'convenience-fee',
                loadComponent: () =>
                  import('./pages/settings/convenience-fee/convenience-fee').then(
                    m => m.ConvenienceFeeComponent,
                  ),
              },
            ],
          },
          {
            path: 'logs',
            children: [
              {
                path: 'email',
                loadComponent: () =>
                  import('./pages/system/logs/email-logs/email-logs').then(
                    m => m.EmailLogsComponent,
                  ),
              },
              {
                path: 'sms',
                loadComponent: () =>
                  import('./pages/system/logs/sms-logs/sms-logs').then(
                    m => m.SmsLogsComponent,
                  ),
              },
              {
                path: 'login',
                loadComponent: () =>
                  import('./pages/system/logs/login-logs/login-logs').then(
                    m => m.LoginLogsComponent,
                  ),
              },
              {
                path: 'coupon',
                loadComponent: () =>
                  import('./pages/system/logs/coupon-logs/coupon-logs').then(
                    m => m.CouponLogsComponent,
                  ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then(m => m.NotFoundComponent),
  },
];

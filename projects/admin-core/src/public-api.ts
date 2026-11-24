/*
 * Public API Surface of admin-core
 */

// Composite Shell
export * from './lib/components/admin-layout/admin-layout';

// Layout Primitives
export * from './lib/components/admin-layout/header/header';
export * from './lib/components/admin-layout/sidebar/sidebar';
export * from './lib/components/admin-layout/footer/footer';

// Layout & Navigation State Service
export * from './lib/components/admin-layout/sidebar/sidebar.service';

// Page Container
export * from './lib/components/page-container/page-container';

// Skeleton Loader
export * from './lib/components/skeleton-loader/skeleton-loader';

// Thumb Image (lazy + error handling)
export * from './lib/components/thumb-image/thumb-image';

// Data Table
export * from './lib/components/data-table/data-table';
export * from './lib/components/truncate-cell/truncate-cell';
export * from './lib/pipes/truncate.pipe';
export * from './lib/utils/string-truncate';

// Slug Utility
export * from './lib/utils/slug';
export * from './lib/utils/date-format';
export * from './lib/utils/export-csv';
export * from './lib/utils/image-trim';

// Filter Sidebar
export * from './lib/components/filter-sidebar/filter-sidebar';

// Button
export * from './lib/components/button/button';

// Status Badge / Pill
export * from './lib/components/status-badge/status-badge';

// Table Row Actions
export * from './lib/components/table-action/table-action';

// Date Range Picker & Presets
export * from './lib/components/date-range-picker/date-range-picker';
export * from './lib/components/date-range-picker/date-range-preset';

// Form Primitives & Controls
export * from './lib/components/form/index';

// Modals & Dialogs
export * from './lib/components/modal/modal';
export * from './lib/components/modal/modal-header/modal-header';
export * from './lib/components/modal/confirm-dialog';
export * from './lib/components/modal/status-modal';

// Config Factory
export * from './lib/config/admin-app.config';

// Services & Auth
export * from './lib/services/api.service';
export * from './lib/services/base-api-crud.service';
export * from './lib/services/error-handler.service';
export * from './lib/services/auth.service';

// HTTP Interceptors
export * from './lib/interceptors/auth.interceptor';

// Guards
export * from './lib/guards/auth.guard';
export * from './lib/guards/role.guard';

// Interfaces
export * from './lib/interfaces/nav-item';
export * from './lib/interfaces/breadcrumb-item';
export * from './lib/interfaces/table-column';

// Constants & Enums
export * from './lib/constants/index';

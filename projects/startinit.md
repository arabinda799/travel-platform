# Travel Platform — Angular Setup & Development Roadmap

## 1. Recommended technology stack

| Area | Choice |
|---|---|
| Angular | Angular 22, latest stable patch compatible with dependencies |
| Workspace | Angular CLI monorepo |
| CSS framework | Bootstrap 5 |
| Styling | SCSS |
| Icons | Bootstrap Icons |
| Font | Inter |
| UI state | Angular Signals |
| Async operations | RxJS |
| Forms | Angular Reactive Forms |
| Routing | Angular Router with lazy loading |
| API calls | Angular HttpClient |
| Rendering | CSR for admin/B2B/supplier; selective SSR/prerendering for B2C |
| Backend | NestJS |
| State library | None initially; consider NgRx only if complexity justifies it |

**Principle:** Keep the initial setup simple. Add libraries only when a real feature requires them.

---

## 2. Create the Angular workspace

Run these commands in PowerShell:

```powershell
node --version
npm --version
ng version

ng new travel-platform --no-create-application --style=scss --strict

cd travel-platform

ng generate application platform-admin --style=scss
ng generate application tenant-admin --style=scss
ng generate application supplier-portal --style=scss
ng generate application b2b-portal --style=scss
ng generate application b2c-web --style=scss
```

Choose routing when prompted.

Keep the admin, supplier and B2B apps as CSR. Add SSR only to the B2C app, using the Angular CLI method supported by your installed version.

You can create only `platform-admin` initially and generate the remaining apps later.

---

## 3. Target folder structure

```text
travel-platform/
├── projects/
│   ├── platform-admin/
│   │   └── src/
│   │       ├── app/
│   │       │   ├── core/
│   │       │   ├── layout/
│   │       │   └── features/
│   │       ├── assets/
│   │       └── styles.scss
│   ├── tenant-admin/
│   │   └── src/
│   │       ├── app/
│   │       └── styles.scss
│   ├── supplier-portal/
│   │   └── src/
│   │       ├── app/
│   │       └── styles.scss
│   ├── b2b-portal/
│   │   └── src/
│   │       ├── app/
│   │       └── styles.scss
│   └── b2c-web/
│       └── src/
│           ├── app/
│           └── styles.scss
├── angular.json
├── package.json
└── tsconfig.json
```

Later, when genuine reuse appears, add Angular libraries alongside the apps:

```text
projects/
├── shared-ui/
├── admin-styles/
├── shared-models/
└── shared-data-access/
```

Do not create every library on day one.

### Feature folders

Create folders when you start implementing the feature:

```text
features/
  dashboard/
  tenants/
  staff/
  roles-permissions/
  suppliers/
  customers/
  b2b-agents/
  hotels/
  bookings/
  markup-discount/
  reports/
```

---

## 4. Install the initial libraries

From the workspace root:

```powershell
npm install bootstrap bootstrap-icons
```

Angular already includes the essentials for routing, forms, HTTP requests, Signals and RxJS.

Avoid installing jQuery for Bootstrap 5. Avoid adding another full UI framework alongside Bootstrap.

### Load Bootstrap in each app

In the app's `src/styles.scss`:

```scss
@import "bootstrap/dist/css/bootstrap.min.css";
@import "bootstrap-icons/font/bootstrap-icons.css";

/* App-specific styles */
```

Verify that it works using `ng serve platform-admin`.

If you later need to customize Bootstrap Sass variables before compilation, switch to the Sass source approach rather than mixing CSS and Sass imports casually.

---

## 5. Font and typography

Use **Inter** as the starting font. It is clean and readable for admin dashboards, tables and forms. You can later introduce a distinctive heading font for B2C if needed.

Suggested starting sizes:

| Element | Size |
|---|---:|
| Page title | 28–32 px |
| Section heading | 20–24 px |
| Card heading | 16–18 px |
| Body text | 14–16 px |
| Form label | 14 px |
| Table text | 13–14 px |
| Helper text | 12–13 px |
| Button text | 14–16 px |

### Shared typography tokens

```scss
:root {
  --font-family-base: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;

  --font-size-body: 0.9375rem;
  --font-size-small: 0.8125rem;
  --font-size-label: 0.875rem;
  --font-size-card-title: 1.0625rem;
  --font-size-section-title: 1.375rem;
  --font-size-page-title: 1.875rem;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-body);
  line-height: 1.5;
}
```

These are starting values, not rigid rules. Keep B2C body text comfortably readable on mobile.

---

## 6. Share admin styling without affecting B2C

Each app has its own global stylesheet:

- `platform-admin/src/styles.scss`
- `tenant-admin/src/styles.scss`
- `supplier-portal/src/styles.scss`
- `b2b-portal/src/styles.scss`
- `b2c-web/src/styles.scss`

When the three admin portals share the same design, create an `admin-styles` library or configure a shared SCSS entry point for those apps.

Later, generate libraries if useful:

```powershell
ng generate library admin-styles
ng generate library shared-ui
```

A generated Angular library does not automatically make every SCSS file globally consumable. Verify the supported library/build configuration before importing its styles across apps.

Use shared tokens and named classes such as `.admin-card`. Avoid globally overriding every Bootstrap `.card` selector.

B2C should not import the admin stylesheet.

---

## 7. Bootstrap and responsive design

Use Bootstrap's grid classes rather than hardcoded widths.

Example:

```html
<div class="container-fluid">
  <div class="row g-3">
    <div class="col-12 col-md-6 col-xl-3">
      <section class="admin-card p-3">
        <h2 class="h6">Total bookings</h2>
        <p class="mb-0">1,240</p>
      </section>
    </div>
  </div>
</div>
```

This produces:
- Mobile: one card per row.
- Medium screens: two cards per row.
- Extra-large screens: four cards per row.

Bootstrap handles much of the responsive layout, but complex tables, hotel cards and booking forms still need custom decisions.

Test at approximately:
- Mobile: 360–390 px
- Tablet: 768 px
- Desktop: 1280–1440 px

For tables, choose between horizontal scrolling, hiding lower-priority columns, or using a card layout on mobile.

---

## 8. What to build first

### Phase 1 — UI foundation

1. Create the workspace and first app.
2. Install Bootstrap and Bootstrap Icons.
3. Set up typography and a few design tokens.
4. Build a responsive admin shell:
   - Sidebar
   - Header
   - Main content area
   - Mobile sidebar behavior
5. Build a login UI.
6. Build a dashboard using mock data.

### Phase 2 — Reusable components

Build these as real screens need them:

1. Buttons
2. Form fields and validation messages
3. Cards
4. Status badges
5. Search and filter forms
6. Responsive tables
7. Pagination
8. Modals and confirmation dialogs
9. Loading, empty and error states

Once a component has proven useful in multiple places, consider moving it to `shared-ui`.

### Phase 3 — Complete one feature end to end

Start with **Tenant Management**:

1. List tenants using mock data.
2. Add search and filters.
3. Create a tenant form.
4. Add validation.
5. Build a tenant detail page.
6. Connect the NestJS API.
7. Handle loading, success, empty and error states.
8. Test responsiveness.

### Phase 4 — Expand

1. Reuse the admin shell in Tenant Admin and Supplier Portal.
2. Build B2B features.
3. Build B2C with its own storefront design.
4. Add SSR/prerendering to B2C routes that benefit from SEO.
5. Add authentication interceptors when API integration begins.

---

## 9. Signals vs RxJS

### Use Signals for UI state

Examples:
- Sidebar open or closed
- Selected tab
- Current filters
- Local form-related display state
- Calculated totals

```ts
import { computed, signal } from '@angular/core';

readonly quantity = signal(1);
readonly unitPrice = signal(2500);

readonly totalPrice = computed(
  () => this.quantity() * this.unitPrice()
);
```

### Use RxJS for asynchronous streams

Examples:
- HTTP request workflows
- Search autocomplete
- Debounced user input
- Cancelling outdated searches
- Combining requests
- WebSocket and SSE streams

Learn these operators gradually:

- `map`
- `switchMap`
- `debounceTime`
- `catchError`
- `combineLatest`

You do not need to master all RxJS operators before starting the UI.

---

## 10. Interceptors: add them later

You may eventually need:

| Interceptor | Purpose |
|---|---|
| Auth | Adds access tokens to protected requests |
| Error | Handles common HTTP errors |
| Loading | Tracks requests for a global loader |
| Tenant context | Adds a tenant header if required by the API |
| Request ID | Helps trace requests across services |

Start with none while building static UI. Add only the ones your API integration needs.

Authentication and tenant isolation must always be enforced by the NestJS backend, not only by Angular guards or interceptors.

---

## 11. Useful commands

```powershell
# Start an app
ng serve platform-admin

# Build apps separately
ng build platform-admin
ng build tenant-admin
ng build supplier-portal
ng build b2b-portal
ng build b2c-web

# Generate a component
ng generate component features/tenants/tenant-list --project=platform-admin

# Generate a library when reuse is established
ng generate library shared-ui
ng generate library admin-styles
```

Check `angular.json` and the CLI output for exact build output locations.

---

## 12. How to learn with AI

For each feature, ask AI to:

1. Explain the component structure before generating code.
2. Use standalone components and typed forms where appropriate.
3. Keep code compatible with your installed Angular version.
4. Explain unfamiliar Signals or RxJS operators.
5. Avoid adding packages without a concrete reason.
6. Include loading, empty, error and responsive states.
7. Tell you which files changed and how to test the feature.

Then read the code, change something yourself, and test it. If you cannot explain a piece of code, learn that concept before repeating the pattern throughout the project.

---

## UI Mockup References

- **Platform Admin Mockup:** https://claude.ai/artifact/4DcGEAeT4LRFivgRx3nEsb
- **Tenant Admin Mockup:** https://claude.ai/artifact/HVV9uizgDBWndMKUL8Xqfk

---

## Final recommendation

Start with **Angular CLI + Bootstrap 5 + SCSS + Bootstrap Icons**.

Build a responsive admin shell, then complete one feature end to end. Share admin styling where it is genuinely common and keep B2C styling independent. Add libraries when you have genuine reuse.

You do not need NgRx, a large UI kit, or interceptors before the UI is ready.

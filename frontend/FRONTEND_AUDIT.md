# Frontend Architecture Audit

**Scope:** `frontend/` only. This is a read-only audit; no source files were changed. The only file created for this task is this report.

## Working tree before this audit

At audit start, `git status --short` showed 38 modified tracked files and multiple untracked backend files. `git diff --stat` reported **38 files changed, 709 insertions, 592 deletions**; that stat does not include untracked files. The changes shown were concentrated in backend refactor work. The only modified tracked path under `frontend/` was `frontend/AGENTS.md`; no frontend source changes were shown. The working tree was already dirty before this audit.

The frontend guidance in `frontend/AGENTS.md` describes the existing shared-code locations and general project rules. It does not override this audit-only request. `.env.local` was not read.

## Current architecture at a glance

- This is a Next.js 15 / React 19 JavaScript application. The root entry at `/` dynamically loads a client-only `Storefront` component with `ssr: false`. That component owns the storefront's data, cart, wishlist, customer session, toast state, and an internal `page` router.
- The named shared primitives/icons exist under `src/components/pages/shared/`, not the `src/components/shared/` path mentioned in the repository guidance/request; there is no `src/components/shared/` directory in the current source inventory.
- `/admin` dynamically loads a large client-only `AdminPortal`, which owns admin session restoration, login, admin page selection, API orchestration, and most admin mutations. The admin page files are imported UI modules; their PascalCase names are not Next `page.jsx` route entrypoints.
- Storefront view modules, admin table/form modules, and route wrappers reuse shared files, but larger stateful workflows and several detailed overlays remain page-specific. The shared hooks directory currently contains one unused hook.
- `api-client.js` is already the sole direct `fetch` implementation found in `src`. `api.js` and `admin-api.js` both delegate transport and HTTP error parsing to it.

## 1. Component and hook inventory

The inventory covers React component modules and hooks under `src/components`, `src/hooks`, and `src/app`. Import counts below are static source-module references (including barrel files); Next route entrypoints are noted separately. A barrel import can mean several named exports are available to a caller, not that every export is used.

### Reusable component and hook modules

| File | Responsibility | Import places / usage |
|---|---|---|
| `src/components/admin/AdminPortal.jsx` | Admin client shell: session, login, selected page, notifications, loading, mutation callbacks, toast and dialogs. | 1: `src/app/admin/page.jsx`; 872 lines. |
| `src/components/admin/pages.js` | Barrel mapping admin page components to files under `src/app/admin/(dashboard)`. | 1: `AdminPortal.jsx`; exports 15 page components. |
| `src/components/admin/global/admin-utils.js` | Currency/date/slug/status helpers. | 10 modules import it directly. |
| `src/components/admin/global/index.jsx` | Admin global component and helper barrel. | 14 modules import the barrel. |
| `src/components/admin/global/AdminHeader.jsx` | Admin top bar, global search, notifications and logout. | 1 barrel; rendered by `AdminPortal`. |
| `src/components/admin/global/AdminSidebar.jsx` | Admin navigation/sidebar. | 1 barrel; rendered by `AdminPortal`. |
| `src/components/admin/global/AdminPageHeader.jsx` | Page title/description plus add-user action header. | 1 barrel export; no JSX use found in `src` (unused export). |
| `src/components/admin/global/Login.jsx` | Admin login form. | 1 barrel; rendered by `AdminPortal`. |
| `src/components/admin/global/PageStats.jsx` | Page-specific admin summary/stat views and dashboard-like panels. | 1 barrel plus direct `DashboardPage`, `LowStockPage`, and `ReturnsPage` usage; 871 lines. |
| `src/components/admin/global/StatCard.jsx` | Individual admin statistic card. | 2 modules: global barrel and `PageStats`. |
| `src/components/admin/global/SearchField.jsx` | Reusable labeled admin search input. | Exported by barrel; used across the product, order, brand, category, coupon, blog, review, customer, user, payment, returns and low-stock screens (11 screens). |
| `src/components/admin/global/Empty.jsx` | Small reusable empty-state wrapper. | 3 modules: barrel, `DataTable`, and `InventoryAlert`. |
| `src/components/admin/global/Modal.jsx` | Admin modal shell with title/body/footer and optional form. | 3 modules: barrel, `FormModal`, and `CategoryTable`; users page consumes it through the barrel. |
| `src/components/admin/global/FormModal.jsx` | Admin form/modal orchestration and entity field schemas; also reused for address forms in checkout/account. | 4 modules; 1,548 lines. This is shared widely but combines field schema, controls, entity forms, and modal rendering. |
| `src/components/admin/global/DeleteConfirmationModal.jsx` | Rich admin delete confirmation and blocked-delete detail dialog. | 2 modules: global barrel and `AdminTables`; 371 lines. |
| `src/components/admin/global/ProductModal.jsx` | Product-specific wrapper around `FormModal`. | 1 barrel; used by `ProductsPage`. |
| `src/components/admin/forms/AdminForms.jsx` | Specialized image upload, product, collection/category, coupon and blog form content. | 1 forms barrel; 616 lines. |
| `src/components/admin/forms/index.jsx` | Forms barrel. | 1 module: `FormModal`. |
| `src/components/admin/dashboard/index.js` | Dashboard component barrel. | 5 admin page modules. |
| `src/components/admin/dashboard/DashboardPanel.jsx` | Admin panel container. | Dashboard barrel and dashboard children; 3 module references. |
| `src/components/admin/dashboard/InventoryAlert.jsx` | Low-stock summary list. | Dashboard barrel; 1 module. |
| `src/components/admin/dashboard/SalesByCategory.jsx` | Sales-by-category visualization. | Dashboard barrel; 1 module. |
| `src/components/admin/dashboard/SalesPerformanceChart.jsx` | Sales chart. | Dashboard barrel; 1 module; imports admin formatting helpers. |
| `src/components/admin/profile/ProfileHero.jsx` | Profile avatar/name hero. | 1: `ProfilePage`. |
| `src/components/admin/profile/ProfileAccountInfo.jsx` | Profile account metadata. | 1: `ProfilePage`. |
| `src/components/admin/profile/ProfileDetailsForm.jsx` | Editable admin profile details. | 1: `ProfilePage`. |
| `src/components/admin/tables/index.jsx` | Admin tables barrel. | 16 modules import it. |
| `src/components/admin/tables/DataTable.jsx` | Generic sortable/paginated table with loading and empty states. | 4 modules; used directly in settings, payments, returns, low stock, content and customer invoice screens; 286 lines. |
| `src/components/admin/tables/AdminTables.jsx` | Entity-specific admin tables and order-detail/invoice helpers. | 3 module references plus its named exports are consumed from the tables barrel; 1,205 lines. |
| `src/components/admin/tables/BrandTable.jsx` | Brand listing built on `DataTable`. | Tables barrel; rendered by `BrandsPage`. |
| `src/components/admin/tables/CategoryTable.jsx` | Category listing/detail UI built on `DataTable`; includes a custom detail overlay. | Tables barrel; rendered by `CategoriesPage`; 253 lines. |
| `src/components/admin/tables/TablePagination.jsx` | Table pagination component and `useTablePagination` hook. | 3 modules: barrel, `DataTable`, `AdminTables`; pagination hook is used by both table modules. |
| `src/components/pages/shared/primitives.jsx` | Storefront `AppButton`, `Rating`, `SectionHeading`, `ProductCard`. | 8 page/section modules; common base for home, shop, product, wishlist, blog and content views. |
| `src/components/pages/shared/icons.jsx` | Inline Instagram/Facebook/Google/Apple SVG components. | 2 modules use Instagram/Facebook/Google. `AppleIcon` has no use found. |
| `src/components/pages/layout/index.jsx` | Storefront layout barrel. | 1: `Storefront`. |
| `src/components/pages/layout/Header.jsx` | Storefront navigation, search, menus, and account/cart actions. | Layout barrel; rendered by `Storefront`; 436 lines. |
| `src/components/pages/layout/Footer.jsx` | Storefront footer and social links. | Layout barrel; rendered by `Storefront`. |
| `src/components/pages/layout/AnnouncementMarquee.jsx` | Announcement ticker. | Header plus layout barrel; 2 module references. |
| `src/components/pages/modals/index.jsx` | Storefront modal barrel. | 4 callers: `Storefront`, account, checkout and order placed view. |
| `src/components/pages/modals/AuthModal.jsx` | Customer login/signup/OTP/Google authentication flow. | Modal barrel; rendered by `Storefront`; 760 lines. |
| `src/components/pages/modals/CartDrawer.jsx` | Cart drawer, shipping/address, discount, sharing and recommendations. | Modal barrel; rendered by `Storefront`; 1,161 lines. |
| `src/components/pages/modals/ConfirmModal.jsx` | Confirmation dialog. | 3 callers: admin portal, admin settings and storefront modal barrel; the barrel is used by account/checkout. |
| `src/components/pages/modals/ProductReviewModal.jsx` | Customer review submission dialog. | Modal barrel; account and order confirmation views. |
| `src/components/pages/modals/ReturnExchangeRequestModal.jsx` | Customer return/exchange request dialog. | Modal barrel; used by account flow. |
| `src/components/pages/sections/home/BrandSlider.jsx` | Brand carousel, including its own brand fetch/loading state. | 1: home view. |
| `src/components/pages/sections/home/NewLaunches.jsx` | New-launch product section. | 1: home view. |
| `src/components/pages/sections/home/WhySection.jsx` | Static store-benefit section. | 1: home view. |
| `src/hooks/index.js` | `useLocalStorage(key, initialValue)`. | **0 consumers found**; shared hook is currently unused. |

`useTablePagination` is not a member of `src/hooks/index.js`; it lives beside the table component and is used by two table implementations. There is no shared `useFetch`, `useDebouncedValue`, or generic `usePagination` in `src/hooks`.

### App and route component inventory

Each storefront page-view module below is imported by the client `Storefront` orchestrator (one direct importer). The admin page components are exported by `components/admin/pages.js` (one barrel importer); they are selected by the `AdminPortal` page state rather than being individual Next `page.jsx` entrypoints.

| File | Responsibility / use |
|---|---|
| `src/app/layout.jsx` | Root server layout, metadata, document shell and `globals.css`; Next entrypoint. |
| `src/app/page.jsx` | Home route wrapper; client-only dynamic `Storefront` with a logo loading screen; Next entrypoint. |
| `src/app/storefront.jsx` | Storefront application controller and internal page router; cart, session, catalog, wishlist, navigation and toast state; 697 lines. |
| `src/app/(auth)/forgot-password/page.jsx` | Thin forgot-password route adapter: calls API and routes back to admin login; Next entrypoint. |
| `src/app/(auth)/reset-password/page.jsx` | Thin reset-password route adapter: passes query token/email to shared reset form; Next entrypoint. |
| `src/app/(pages)/home/home-page.jsx` | Home hero, value propositions and product sections. |
| `src/app/(pages)/shop/shop-page.jsx` | Catalog/search/filter/sort/grid view. |
| `src/app/(pages)/products/product-page.jsx` | Product detail, gallery, reviews and related products. |
| `src/app/(pages)/wishlist/wishlist-page.jsx` | Wishlist presentation and product actions. |
| `src/app/(pages)/blog/blog-page.jsx` | Article list/detail, markdown rendering and comments/community interactions. |
| `src/app/(pages)/content/content-page.jsx` | Informational/contact content and policy views. |
| `src/app/(pages)/checkout/checkout-page.jsx` | Checkout form, coupon/shipping calculations, saved address loading and order submission; 1,107 lines. |
| `src/app/(pages)/account/account-page.jsx` | Customer account, order/address management and return/review overlays; 1,119 lines. |
| `src/app/(pages)/order-confirmation/order-placed-page.jsx` | Order confirmation/details, status stages, review and return actions; 930 lines. |
| `src/app/(pages)/order-confirmation/order-invoice-page.jsx` | Customer invoice view and order fetch fallback. |
| `src/app/account/orders/[orderId]/page.jsx` | Next route wrapper that dynamically mounts `Storefront`; it is not a separate order-detail implementation. |
| `src/app/account/orders/[orderId]/invoice/page.jsx` | Next route wrapper that dynamically mounts `Storefront`; it is not a separate invoice implementation. |
| `src/app/admin/layout.jsx` | Admin CSS shell only; no authentication guard. |
| `src/app/admin/page.jsx` | Client-only dynamic admin portal route; Next entrypoint. |
| `src/app/admin/(dashboard)/dashboard/DashboardPage.jsx` | Dashboard page view. |
| `src/app/admin/(dashboard)/products/ProductsPage.jsx` | Product list/search/modal page view. |
| `src/app/admin/(dashboard)/categories/CategoriesPage.jsx` | Category list/search/form page view. |
| `src/app/admin/(dashboard)/brands/BrandsPage.jsx` | Brand list/search/form page view. |
| `src/app/admin/(dashboard)/orders/OrdersPage.jsx` | Order list/search page view. |
| `src/app/admin/(dashboard)/payments/PaymentsPage.jsx` | Payment list and custom payment detail dialog; 181 lines. |
| `src/app/admin/(dashboard)/returns/ReturnsPage.jsx` | Return list, filtering, detail/review UI; 408 lines. |
| `src/app/admin/(dashboard)/returns/ReturnRequestFilterBar.jsx` | Return-specific type/status filter controls. |
| `src/app/admin/(dashboard)/coupons/CouponsPage.jsx` | Coupon list/search/form page view. |
| `src/app/admin/(dashboard)/reviews/ReviewsPage.jsx` | Review list/search page view. |
| `src/app/admin/(dashboard)/customers/CustomersPage.jsx` | Customer list/search page view. |
| `src/app/admin/(dashboard)/customers/CustomerDetailsModal.jsx` | Customer detail fetch and custom dialog; 199 lines. |
| `src/app/admin/(dashboard)/blogs/BlogsPage.jsx` | Blog list/search/form and comment dialog controller. |
| `src/app/admin/(dashboard)/blogs/BlogCommentsPanel.jsx` | Blog comment moderation panel, fetch and mutations. |
| `src/app/admin/(dashboard)/users/UsersPage.jsx` | Staff/user management table and custom form modal. |
| `src/app/admin/(dashboard)/settings/SettingsPage.jsx` | Store settings, announcements, featured categories, and custom sections; 339 lines. |
| `src/app/admin/(dashboard)/profile/ProfilePage.jsx` | Profile loading, update and upload controller. |
| `src/app/admin/(dashboard)/low-stock/LowStockPage.jsx` | Low-stock list, stock mutation, form/detail UI; 337 lines. |

## 2. Data layer duplication

### HTTP and API wrappers

- The only direct `fetch()` found in `src` is in `src/lib/api-client.js`; no `axios` call was found. It owns base URL composition, JSON/FormData handling, response parsing, normalized `ApiError`, and HTTP method helpers.
- `src/lib/api.js` is a storefront domain facade over that client. It maps customer/store endpoints and response shapes to functions. `src/lib/admin-api.js` is an admin facade over the same client, adding `/admin` prefixing, no-store behavior, bearer headers, multipart upload construction, and 401 session invalidation. No identical endpoint wrapper was found across both facades; they have distinct domain endpoints.
- Error handling overlaps in that both facades pass through `ApiError` and rethrow, but only the admin facade reacts to 401 by clearing admin storage and dispatching an event. Storefront `api.js` separately degrades selected catalog/cart/order HTTP errors to empty/default values. Preserve these distinct policies if consolidating.
- Admin route strings are still placed at call sites in `AdminPortal.jsx`, `AdminTables.jsx`, `BlogCommentsPanel.jsx`, `CustomersPage.jsx`, `PaymentsPage.jsx`, `LowStockPage.jsx`, `ProfilePage.jsx`, `ReturnsPage.jsx`, and `SettingsPage.jsx`. Storefront endpoint strings are mainly in `api.js`, with password reset adapters calling `apiPost` directly. `NEXT_PUBLIC_API_URL` and `/api` fallback are centralized in `api-client.js`; no second API base URL was found.
- `src/lib/store-data.js` contains only the shared logo path and a comment; it does not act as a data store/service layer.

### Loading/error/data/refetch state

- The admin portal centrally fetches its main page data and passes callbacks/state to page modules, but exceptions exist: `SettingsPage`, `ReturnsPage`, `LowStockPage`, `ProfilePage`, `BlogCommentsPanel`, `CustomerDetailsModal`, and `PaymentsPage` make their own requests or own separate loading/error/mutation states.
- Similar effect-based load/error/finally patterns appear in `BlogCommentsPanel`, `CustomerDetailsModal`, `ProfilePage`, invoice loading, `BrandSlider`, and address loading in checkout/account/cart. Several use an `active` boolean cleanup; these are candidates for a shared resource hook only where lifecycle semantics and stale-data handling match.
- `DataTable` already has loading, empty, sorting, and pagination behavior. `useTablePagination` is already shared by `DataTable` and entity tables. Other client views perform their own filtering, sorting, or page-state work; assess whether they need the same semantics before generalizing.
- No debounced-value hook was found. Search inputs are used across roughly 11 admin list pages; the current audit does not establish whether their filtering is server-side or local in every case. A shared debounce hook is a candidate only for expensive search paths; adding it changes query timing and should be validated.

### Token, user, and storage behavior

- Customer token/user persistence is coordinated by `Storefront` (`hwh_session_token`, `hwh_user`), while request header creation is separately in `api.js` (`userAuthHeaders`). Session reading/writing/removal logic therefore crosses the app shell and API facade.
- Admin session persistence/cleanup spans `AdminPortal.jsx` and `admin-api.js`; `AdminTables.jsx` also reads `hwh-admin-session` directly for an order update. The 401 event is emitted in `admin-api.js` and consumed by the portal. Centralize storage/header access only after preserving the current event and logout behavior.
- Anonymous cart session storage is used in both `Storefront` and `CartDrawer` (`hwh_cart_session`). Cart state itself is primarily in `Storefront`, with drawer interactions writing to the parent through callbacks.
- Auth tokens are stored in `localStorage` (both customer and admin). This is an XSS exposure concern because script execution in the origin can read bearer tokens.

## 3. UI duplication

### Modals and overlays

| Implementation | Observed use / overlap |
|---|---|
| Admin `Modal` | Generic admin shell; used by the users page/category-related flow and inside `FormModal`. |
| `FormModal` | Large configurable admin form modal; also reused for storefront address forms, coupling storefront views to admin-global UI. |
| `DeleteConfirmationModal` | Admin-specific confirmation with rich deletion context; also appears in `AdminTables`. |
| Storefront `ConfirmModal` | Shared confirmation used by admin portal/settings and customer account/checkout. |
| `AuthModal`, `ProductModal`, `ProductReviewModal`, `ReturnExchangeRequestModal` | Specialized domain workflows; should keep their own body/content while sharing a presentation shell. `ProductModal` already wraps `FormModal`. |
| Custom overlays/dialogs | `account-page.jsx` address and return-request overlays; `checkout-page.jsx` address overlay; `CartDrawer.jsx` drawer and four subdialogs; `CustomerDetailsModal.jsx`; `BlogsPage.jsx` comment overlay; `ReturnsPage.jsx` return-review overlay; `PaymentsPage.jsx` payment-detail overlay; `CategoryTable.jsx` category-detail overlay; `PageStats.jsx` statistics dialog; `AdminTables.jsx` order-detail overlay/print invoice. |

The overlays repeat backdrop/close/header/dialog patterns but have different layout, content, and interaction requirements. A shared low-level dialog shell could own `role`, `aria-modal`, Escape/backdrop handling, scroll/focus lifecycle; specialized component APIs should retain their existing classes and bodies. Do not collapse all workflows into one modal component.

### Tables and CRUD structure

- `DataTable` is the reusable generic table and has a real loading/empty/sort/page API. `AdminTables.jsx` contains approximately eight entity-specific table exports (orders, products, coupons, reviews, customers, blogs, users, plus row actions/invoice helpers) built around it. `BrandTable` and `CategoryTable` are additional wrappers.
- Direct `DataTable` use appears in settings, low stock, payments, returns, content/FAQ-like data, and the customer invoice. The `AdminPortal` routes many other entity screens through `AdminTables` exports.
- CRUD pages share a list header/search/action/table/form/delete pattern: products, categories, brands, coupons, blogs, reviews, users, customers, payments, returns, low stock, and orders. Some shell/state is centralized in `AdminPortal`; page-specific modals, detail panels, and direct loads remain local. The pattern can share toolbar/empty/loading/pagination primitives, but a single giant CRUD component would likely add conditional complexity.
- Tables also exist as bespoke detail/presentation UI in `PaymentsPage`, `ReturnsPage`, and `AdminTables` order detail/invoice, plus `DataTable` usage in content and customer invoice. These differ from generic row tables and should remain content-specific while sharing table tokens/primitive components.

### Forms and controls

- `FormModal.jsx` and `AdminForms.jsx` cover reusable field schemas/entity forms, while page-specific forms remain in `SettingsPage`, `UsersPage`, `ProfilePage`, `checkout-page.jsx`, `account-page.jsx`, password forms, `AuthModal.jsx`, and return/review modals.
- Repeated patterns include label/control/help/error rendering, save/cancel footer, disabled/busy submit, image upload previews, and field-level validation. A small shared `FormField`/`FormActions` primitive would reduce markup without forcing form-state libraries or changing visual layout.
- `src/components/pages/shared/primitives.jsx` contains storefront `AppButton`, `Rating`, `SectionHeading`, and `ProductCard`. It is imported in 8 modules. Admin pages have specialized `SearchField`, `StatCard`, `Empty`, and table controls, but there is no general cross-app input/select/checkbox/status-chip primitive. Buttons and fields remain heavily inline.
- Badge/status implementations are split across `admin-utils.classStatus`, CSS-specific classes in payments/returns/blog comments, product badges in the shared card and product page, and per-page chips. They should share mapping data while allowing domain-specific classes and labels.

### Product cards/grids

- Shared `ProductCard` is used in home sections, home page, shop, wishlist, and product recommendations. Product detail, cart drawer, checkout summary, order confirmation, low-stock admin table, and admin product tables render their own image/title/price rows/cards; these are different contexts, but card variants share image fallback, title truncation, price formatting, and accessible action patterns.
- `NewLaunches` and `BrandSlider` are already extracted homepage sections. Other hero/promotional sections remain inline in `home-page.jsx`.

### Icons

- Most icon usage is from `lucide-react`; `components/pages/shared/icons.jsx` owns brand/social SVGs. Its Instagram/Facebook/Google icons are used; `AppleIcon` is unused. Some arbitrary SVG markup is embedded directly in JSX/CSS. No competing local library exists, but repeated custom SVGs should be compared before extraction; do not replace brand marks with generic Lucide icons.

## 4. Logic duplication and constants

- **Currency/date:** `admin-utils.js` centralizes `currency`, `dateLabel`, and `classStatus`, used broadly in admin tables and some storefront dialogs. Similar inline formats remain in `AdminTables.jsx`, `CustomerDetailsModal.jsx`, `PaymentsPage.jsx`, `ReturnsPage.jsx`, `ProfileAccountInfo.jsx`, blog/product/account/order pages, customer invoice, and `CartDrawer.jsx`. Locale/options and output differ (`₹` vs `Rs.`, date-only vs date-time, `en-IN` vs `en-US`); a refactor must preserve each existing output or explicitly approve the display change.
- **Status colors:** `classStatus` is reused for several order displays, but payment, return and blog-comment chips have page-specific status-to-class mappings in JSX/CSS. Centralize mapping data only after documenting all states and preserving class names.
- **Validation:** customer email/phone validation is inline in `AuthModal`, checkout and reset/forgot forms; admin schema/forms also validate separately. Some checks are browser constraints, some are API-facing rules. A shared pure helper is appropriate only when exact rules/messages are identical.
- **Cart/wishlist:** cart state, local persistence, stock clamping, session ID, and backend sync are split between `Storefront` and `CartDrawer`. `WishlistPage` is mostly presentational while `Storefront` coordinates server wishlist calls and local state. The duplicated `hwh_cart_session` initialization in shell and drawer is a concrete candidate to centralize.
- **Hardcoded lists/paths/statuses:** `AdminPortal.jsx` has its own `VALID_PAGES`; admin page exports are repeated in `components/admin/pages.js`, and navigation labels/page access metadata also exist in admin components. Endpoint strings remain at admin page call sites despite the shared API facade. Order/payment/blog statuses appear in the UI as literal values in filter options/forms; no general frontend `src/constants` module exists.
- **Phone/email formatting:** phone normalization/validation is implemented in multiple customer-facing flows rather than a shared frontend helper. Keep validation copy and accepted formats consistent if extracting.

## 5. CSS organization and duplication

| File | Approx. size | Loading/role |
|---|---:|---|
| `src/app/globals.css` | 8,437 lines / 239.8 KB | Imported by root layout and therefore loaded across routes; contains global tokens/reset plus large storefront and shared UI styles. |
| `src/app/admin/admin.css` | 5,064 lines / 170.3 KB | Imported by `app/admin/layout.jsx`; admin-specific styles, though root `globals.css` is also present on admin routes. |
| `src/components/admin/auth/forgot-password/theme.css` | 97 lines / 6.8 KB | Imported by both forgot and reset forms. |
| `src/styles/index.css` | 5 lines / 80 B | Defines `--font-primary` only; no import found, so it appears unused. |

There is no `storefront.css` file. Storefront CSS currently lives in the global stylesheet. `globals.css` and `admin.css` both import Google Fonts and repeat DM Sans; they select different display fonts (DM Serif Display vs Playfair Display), so font loading/visual ownership is split. `styles/index.css` is not imported by the root layout. Admin CSS is separately imported at the admin layout but global selectors and global styles still load from the root. Repeated button, form-field, card, badge, empty, modal, table and responsive class patterns are spread through both large stylesheets; many declarations are one-line/minified style blocks. CSS modules/theme scoping do not currently make the boundary explicit.

This section reports the current relationship only; it does not propose a CSS framework.

## 6. Next.js structure, client boundaries, and large modules

- `src/app/layout.jsx` and `src/app/admin/layout.jsx` are server components by default. The root layout handles metadata/document shell; the admin layout only wraps CSS and a shell element.
- `app/page.jsx`, `app/admin/page.jsx`, and both `/account/orders/[orderId]` route wrappers use dynamic imports with `ssr: false`. These avoid server rendering but make initial content depend on client JavaScript. The root page displays a logo-only fallback; nested order routes display a blank-colored fallback.
- The storefront and admin app entry components are both client-only orchestration points. `Storefront` imports all page-view modules and owns broad state; `AdminPortal` imports its admin page barrel and owns broad state/API mutations. Route-level splitting is limited because these controllers statically import large page trees.
- Client directives that appear unnecessary on their own source logic include pure/presentational modules such as `components/pages/shared/primitives.jsx`, `components/pages/shared/icons.jsx`, `components/pages/layout/AnnouncementMarquee.jsx`, and `app/(pages)/home/home-page.jsx` (no React state/effect or direct browser API found in these modules). They are currently imported from client boundaries, so removing their directives alone may not reduce shipped client code. `Footer.jsx` also appears presentational, but is imported through a client layout barrel. Verify boundaries before changing directives.
- Files over roughly 300 lines include: `global/FormModal.jsx` (1,548), `tables/AdminTables.jsx` (1,205), `CartDrawer.jsx` (1,161), `account-page.jsx` (1,119), `checkout-page.jsx` (1,107), `order-placed-page.jsx` (930), `global/PageStats.jsx` (871), `AdminPortal.jsx` (872), `AuthModal.jsx` (760), `content-page.jsx` (714), `storefront.jsx` (697), `AdminForms.jsx` (616), `blog-page.jsx` (553), `Header.jsx` (436), `shop-page.jsx` (435), `ReturnsPage.jsx` (408), `product-page.jsx` (400), `DeleteConfirmationModal.jsx` (371), `home-page.jsx` (365), `SettingsPage.jsx` (339), and `LowStockPage.jsx` (337). These combine state, data loading, business rules and markup to varying degrees; start with the controller/view boundaries and the largest complex workflows rather than splitting by line count alone.

## 7. Frontend dependency usage

`frontend/package.json` lists `mongoose` and `dotenv`. A search of `frontend/src` found no import or require of either package. This is a report only; neither dependency was changed.

## 8. Layout and route protection

- **Admin:** `app/admin/layout.jsx` has no guard. `/admin` loads `AdminPortal`, which restores an admin token from local storage and renders the portal/login based on a client-side session check. Protected admin data mutations are made with bearer tokens through `admin-api.js`; route visibility/page access is handled in the portal/page components. This is client UI gating, not a Next middleware/server layout guard.
- **Storefront/customer:** root storefront layout has no auth guard. `Storefront` opens auth for checkout and some account actions, but guards are in the client shell. The `/account/orders/[orderId]` and `/invoice` routes dynamically mount `Storefront`; they are not separate guarded server pages. Whether the underlying order APIs enforce authorization is outside this frontend-only audit.
- **Duplication:** auth/session decisions span `Storefront`, `AuthModal`, `api.js`, `AdminPortal`, `admin-api.js`, and some direct storage reads in table code. The reset routes use separate standalone forms. Admin portal session validation and route-level data API authorization are separate layers, which is expected, but client storage cleanup is duplicated.

## 9. Proposed target structure and shared component APIs

These are proposals only; no code was added. Keep existing filenames/naming conventions and reuse `api-client.js`, domain API facades, existing table components, and existing modal primitives instead of creating parallel versions.

| Proposed shared item | Props/API only | Intended boundary |
|---|---|---|
| `src/components/shared/ModalShell.jsx` | `open`, `onClose`, `title`, `ariaLabel`, `children`, `footer`, `className`, `backdropClassName`, `closeOnBackdrop`, `closeOnEscape`, `initialFocusRef`, `busy` | Reuse the existing modal implementations’ common dialog lifecycle; specialized modals keep their layouts and CSS classes. |
| `src/components/shared/FormField.jsx` | `id`, `label`, `hint`, `error`, `required`, `children`, `className` | Shared label/help/error association for admin and storefront forms. |
| `src/components/shared/StatusBadge.jsx` | `status`, `label`, `tone`, `className`, `statusMap` | Shared status presentation while retaining explicit mappings for order/payment/return/review states. |
| `src/components/admin/global/AdminListPage.jsx` | `title`, `description`, `actions`, `searchValue`, `onSearchChange`, `filters`, `loading`, `error`, `emptyState`, `children`, `pagination` | Repeated admin list header/toolbar/loading/empty/pagination shell; page-specific table and mutations remain children/callbacks. |
| `src/components/pages/forms/AddressForm.jsx` | `initialValue`, `busy`, `error`, `onSubmit`, `onCancel`, `submitLabel` | Shared checkout/account address fields without importing an admin modal implementation into storefront pages. |
| `src/components/pages/products/ProductGrid.jsx` | `products`, `cartIds`, `wishlistIds`, `onOpenProduct`, `onAddToCart`, `onToggleWishlist`, `columns`, `emptyState` | Reuse product-card grid wiring; preserve layout variants with explicit props. |
| `src/components/pages/orders/OrderInvoiceView.jsx` | `order`, `mode`, `onBack`, `onPrint`, `currencyFormatter`, `dateFormatter` | Share invoice data sections between customer invoice and admin print/detail view while allowing customer/admin mode differences. |
| `src/hooks/index.js` additions (existing hook barrel) | `useAsyncResource({ key, load, enabled, initialData })` returning `{ data, loading, error, refetch }`; `useDebouncedValue(value, delay)` returning the settled value | Reuse the existing hooks location; do not create a second local-storage hook. Adopt only for matching lifecycle/error semantics. |

### Refactor order and risk

| Order | Step | Risk | Visible UI change? |
|---:|---|---|---|
| 1 | Document route/data owners and add focused characterization/manual coverage for current response, loading, and interaction behavior. | Low | No. |
| 2 | Consolidate pure formatting/validation/page/status constants while preserving current locale, return values, classes, and messages. | Low–medium | No if exact output is kept; otherwise yes. |
| 3 | Centralize duplicate customer/admin token storage access and cart session ID initialization; preserve storage keys and auth invalidation events. | Medium | No intended change; login/logout/cart-sync timing can regress. |
| 4 | Adopt shared async resource/debounce hooks in isolated fetch/search panels with matching loading and stale-data behavior. | Medium | Search timing/loading transitions may be visible. |
| 5 | Add shared field and admin-list shell primitives, migrate one admin CRUD screen at a time. | Medium | No intended visual change; layout spacing and empty/loading states are visible regression risks. |
| 6 | Introduce a dialog shell and migrate one custom overlay at a time; verify focus, Escape/backdrop, scroll, and screen-reader behavior. | Medium–high | Interaction changes are user-visible; preserve backdrop, sizing, animations and existing labels. |
| 7 | Extract product grid and invoice presentation only after comparing each variant’s fields/actions. | Medium–high | Potentially visible across shop/home/wishlist/order screens. |
| 8 | Split `Storefront` and `AdminPortal` into route/data controller and page/view layers; then evaluate server components and route-level chunk loading. | High | Initial loading, URL/history, SEO and hydration behavior can change. |

## 10. Bugs, accessibility, and performance concerns noticed

### Bugs / robustness

- `useLocalStorage` in `src/hooks/index.js` ignores stored JSON values that are falsy because it only calls `setValue` when the raw stored string is truthy. It also has no `storage` event synchronization. The hook is currently unused.
- `CartDrawer` and `Storefront` both initialize the anonymous cart session key; races or divergent fallback behavior are possible when ownership changes.
- The root page's data is initially client-only and `Storefront` reads/writes local storage, URL and history. This makes deep-link, reload and initial empty-data behavior sensitive to multiple effects.
- API helpers sometimes turn HTTP errors into empty results (`getListOrEmpty`, cart/order fallback), while other endpoints surface the error. This may hide service failures as empty catalog/account states; it is intentional in some comments and should be documented per endpoint.
- Formatters have subtly different currencies/locales/date precision. Consolidating them without tests could silently change displayed prices or dates.

### Accessibility

- A text scan found explicit `alt` attributes on JSX `<img>` tags inspected; several product/order thumbnails intentionally use `alt=""`. Raw `<img>` use is widespread and can carry accessibility errors if future dynamic alt values become empty or redundant.
- Dialog accessibility is inconsistent. Some components have `role="dialog"`, `aria-modal`, and labels (`ConfirmModal`, `ProductReviewModal`, return modal, admin modal); `AuthModal` markup uses an overlay/card without the same dialog role/label in the inspected opening markup. Custom payment/customer/category/comment/return overlays should be reviewed for focus trap, initial focus, focus return, Escape behavior, and body scroll locking.
- Some icon-only buttons have labels, but custom controls should be checked for `aria-label`/visible labels, keyboard behavior, and focus visibility. A few button components rely on defaults; verify `type="button"` in forms to avoid accidental submit.
- One lightweight key scan produced only possible candidates and false positives; inspected `.map` examples used `key` props. No confirmed missing key was recorded in this pass.

### Performance

- `Storefront` and `AdminPortal` are large client entry trees; the storefront statically imports all view modules. The admin portal imports the full page barrel. This can ship code for inactive pages up front.
- Many large pages/components exceed 300 lines, including complex forms, cart, auth, tables, dashboard, account and checkout. Large files alone are not a performance defect, but together with client-only loading they increase review and bundle risk.
- Native `<img>` elements are common across product, blog, profile, and order views; Next image optimization and explicit sizing are not consistently used.
- `globals.css` and `admin.css` are large single stylesheets loaded at app/admin boundaries; the root stylesheet also applies to admin. Font imports are duplicated and route-specific CSS boundaries are hard to identify.
- The UI uses several timed effects for toast/modal flows and repeated local data loads. Ensure effects cancel timers/requests on unmount and avoid refetch loops; active flags are present in several, but behavior is inconsistent.

## Audit limits

This report is based on static source inspection and searches. No runtime UI checks, network calls, lint/build commands, or backend inspection were performed. Findings about actual authorization depend on the backend and are outside the requested scope.

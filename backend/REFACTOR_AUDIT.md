# Phase 1: Backend Audit Report (Read-Only)

> **Scope**: Backend (`/backend`) only. No files were modified during this audit. All findings are verified against the codebase.

---

## 1. Existing Utilities & Middleware

### `backend/src/utils/`
| File | Exports | Current Usage & Consistency |
| :--- | :--- | :--- |
| `blogMetrics.js` | `{ attachBlogMetrics }` | Used in `adminBlogRoutes.js` (1) and `storeRoutes.js` (2). Aggregates like and comment metrics for blog posts. Consistently used where blog listings are prepared. |
| `couponExpiry.js` | `{ isCouponExpired }` | Used in `orderRoutes.js` (1) and `storeRoutes.js` (3). Compares dates using store timezone. Consistently used for coupon checks, but directly reads `process.env.STORE_TIME_ZONE` rather than using `config.js`. |
| `escapeRegex.js` | `escapeRegex` | Used in `adminProductRoutes.js` (3) and `productRoutes.js` (1). Sanitizes strings for RegExp. **Inconsistently omitted** in `userRoutes.js` (lines 94, 98, 101, 109, 243) where phone numbers are interpolated into raw RegExp. |
| `syncRatings.js` | `{ syncProductRating, syncAllProductRatings }` | `syncProductRating` used in `adminReviewRoutes.js` (2). `syncAllProductRatings` called once on startup in `server.js`. Consistently updates product avg rating and review counts. |

### `backend/src/middleware/`
| File | Exports | Current Usage & Consistency |
| :--- | :--- | :--- |
| `asyncHandler.js` | `asyncHandler` | Used across almost all `admin*` routes and storefront `productRoutes.js` / `storeRoutes.js`. **Completely omitted** in `authRoutes.js` (5 routes), `userRoutes.js` (8 routes), `contactRoutes.js` (1 route), and `controllers/` (2 controllers). |
| `errorHandler.js` | `{ errorHandler }` | Mounted globally in `app.js`. Handles Mongoose `ValidationError`, `CastError`, and MongoDB duplicate key (`11000`). **Does not handle Zod errors** or session/JWT token errors. Inconsistently bypassed by routes using manual `try/catch` and returning `500` directly. |
| `adminAuth.js` | `{ createAdminToken, requireAdmin, safeEqual }` | Used in `adminAuthRoutes.js` to protect `/api/admin/*`. Uses custom HMAC SHA-256 tokens. Contains duplicate cryptographic signing logic also found in `userSession.js`. Directly reads `process.env.ADMIN_SESSION_SECRET`. |
| `adminPageAccess.js` | `{ requirePageAccess }` | Applied to `/api/admin/*` after `requireAdmin`. Performs a **redundant database query** (`User.findById`) on every request immediately after `adminAuth.js` already fetched the user document. |
| `userSession.js` | `{ createUserToken, requireUserSession }` | Used in `authRoutes.js` (to issue customer tokens) and `userRoutes.js` (protects `/wishlist` routes only). Duplicates the HMAC SHA-256 signing/verification logic from `adminAuth.js`. Hardcodes wishlist error message: `"Please sign in to access your wishlist."` regardless of the route accessed. Directly reads `process.env.ADMIN_SESSION_SECRET`. |

---

## 2. Duplication Report

### a) `try/catch` blocks in handlers not using `asyncHandler` (16 handlers)
These handlers wrap their bodies in manual `try/catch` and emit custom 500 responses instead of delegating to `asyncHandler` and `errorHandler`:
- `backend/src/routes/authRoutes.js` — `POST /login/request-otp` (lines 34-141)
- `backend/src/routes/authRoutes.js` — `POST /login/verify-otp` (lines 143-234)
- `backend/src/routes/authRoutes.js` — `POST /signup/request-otp` (lines 237-324)
- `backend/src/routes/authRoutes.js` — `POST /signup/verify-otp` (lines 326-441)
- `backend/src/routes/authRoutes.js` — `POST /social` (lines 443-501)
- `backend/src/routes/contactRoutes.js` — `POST /` (lines 41-97)
- `backend/src/routes/userRoutes.js` — `GET /wishlist` (lines 23-31)
- `backend/src/routes/userRoutes.js` — `POST /wishlist` (lines 33-49)
- `backend/src/routes/userRoutes.js` — `DELETE /wishlist/:productId` (lines 51-61)
- `backend/src/routes/userRoutes.js` — `GET /orders` (lines 73-155)
- `backend/src/routes/userRoutes.js` — `GET /addresses` (lines 161-206)
- `backend/src/routes/userRoutes.js` — `POST /addresses` (lines 212-278)
- `backend/src/routes/userRoutes.js` — `PUT /addresses/:id` (lines 282-341)
- `backend/src/routes/userRoutes.js` — `DELETE /addresses/:id` (lines 347-360)
- `backend/src/controllers/forgotPasswordController.js` — `forgotPasswordController` (lines 14-59)
- `backend/src/controllers/resetPasswordController.js` — `resetPasswordController` (lines 12-59)

### b) Response Formatting: Inconsistent Success/Error JSON Shapes
**Success Shapes**:
- `{ items: [...], total, page, limit, pages }` in `productRoutes.js:35-46`
- `{ items: [...], total }` in `adminProductRoutes.js:54`
- `{ items: [...] }` in `adminBlogRoutes.js:20`, `adminStaffRoutes.js:21`, `adminOrderRoutes.js:15`
- `{ item: ... }` in `adminProductRoutes.js:259`, `adminBlogRoutes.js:48`
- `{ success: true, count, orders: [...] }` and `{ success: true, count, addresses: [...] }` in `userRoutes.js:143-150`
- Bare arrays `res.json(coupons)`, `res.json(categories)` in `storeRoutes.js:170, 190`
- Distinct status structures: `{ liked: boolean, likes: number }` in `storeRoutes.js:524`, `{ valid: true, coupon }` in `storeRoutes.js:208`

**Error Shapes**:
- `{ error: string }` — Default format used by `errorHandler.js` and most route handlers.
- `{ error: string, details: object }` — Used when Zod fails in `adminSchemas.js:95-101` and `storeRoutes.js:690`.
- `{ notRegistered: true, error: string }` — Custom auth shape in `authRoutes.js:53, 76`.
- `{ success: true, message: string }` returning HTTP 200 on error in `forgotPasswordController.js:17, 56` (anti-enumeration pattern).

### c) Error Creation & `errorHandler` Deficiencies
- **No `AppError` or `HttpError` class**: Does not exist anywhere in `backend/src`. Errors thrown in services or route handlers are standard `new Error(message)` with an optional `.status` manually attached.
- **Inconsistent Status Codes**:
  - `400` vs `404` for invalid IDs: `if (!validId(id)) return res.status(400)` vs `if (!item) return res.status(404)`.
  - Missing account: `authRoutes.js` returns `404` for non-existent login identity, whereas `adminAuthRoutes.js` returns `401`.
- **`errorHandler` Gaps**:
  - **Zod Errors**: If any Zod error is thrown or passed via `next(err)`, `errorHandler` treats it as an unhandled 500 error (`"An unexpected server error occurred."`) instead of a 400 validation error with field details.
  - **Mongoose Validation**: Handled (`error.name === "ValidationError"` -> 400).
  - **Mongoose Duplicate Key**: Handled (`error.code === 11000` -> 409).
  - **CastError**: Handled (`error.name === "CastError"` -> 400).
  - **JWT / Session Errors**: Not handled. Malformed session payloads (e.g. `SyntaxError` from `JSON.parse` of tokens) are caught locally in `adminAuth.js` but unhandled in `errorHandler`.

### d) Validation Duplication (17 inline Zod calls, 30+ ObjectId checks)
**Inline Zod `safeParse` without validation middleware**:
1. `adminAuthRoutes.js:31` (`loginSchema`)
2. `adminBlogRoutes.js:26` (`blogSchema`)
3. `adminBlogRoutes.js:56` (`blogSchema`)
4. `adminCatalogRoutes.js:150` (`category/brand/couponSchema`)
5. `adminCatalogRoutes.js:192` (`category/brand/couponSchema`)
6. `adminOrderRoutes.js:25` (`orderStatusSchema`)
7. `adminProductRoutes.js:156` (`productSchema`)
8. `adminProductRoutes.js:201` (`productSchema`)
9. `adminProfileRoutes.js:20` (`profileSchema`)
10. `adminReviewRoutes.js:34` (`reviewStatusSchema`)
11. `adminStaffRoutes.js:33` (`staffUserSchema`)
12. `adminStaffRoutes.js:64` (`staffUserUpdateSchema`)
13. `contactRoutes.js:42` (`contactSchema`)
14. `orderRoutes.js:95` (`returnExchangeSchema`)
15. `orderRoutes.js:146` (`returnEmailSchema`)
16. `orderRoutes.js:230` (`createOrderSchema`)
17. `storeRoutes.js:689` (`reviewSchema`)

**Repeated ObjectId & Param Checks (30+ instances)**:
- `validId(req.params.id)` checked across 8 admin route modules (`adminBlogRoutes.js:54, 76, 96, 111, 128`, `adminCatalogRoutes.js:188, 237`, `adminCustomerRoutes.js:27`, `adminOrderRoutes.js:23`, `adminProductRoutes.js:22, 109, 140, 199, 254, 266, 283`, `adminReturnExchangeRoutes.js:33`, `adminReviewRoutes.js:27, 62`, `adminStaffRoutes.js:63, 97`).
- Direct `mongoose.isValidObjectId(...)` repeated in non-admin routes: `userRoutes.js:19, 81, 169, 254, 285, 327, 350`, `orderRoutes.js:353, 475, 531`, `productRoutes.js:55`, `storeRoutes.js:586, 647, 671`.

### e) Pagination, Search, Filter, Sort Logic
- **Pagination**: Implemented from scratch in `productRoutes.js:12-46` (`skip`, `limit`, `pages = Math.ceil(total / limit)`). Admin endpoints (`adminProductRoutes.js`, `adminOrderRoutes.js`, `adminStaffRoutes.js`) lack real pagination and instead hardcode `.limit(500)`.
- **Search Logic**:
  - `productRoutes.js:18-21`: `new RegExp(escapeRegex(...), "i")` across 4 fields.
  - `adminProductRoutes.js:56-65`: `new RegExp(escapeRegex(...), "i")` across `title` and `sku`.
  - `adminProductRoutes.js:86`: repeated for low-stock search.
- **Filter & Sort**: Ad-hoc query building in `productRoutes.js:23-29` (`sortOptions`), `adminDashboardRoutes.js:140-150`, and `userRoutes.js:79-122`.

### f) Repeated Mongoose Patterns
- **Find-by-ID + 404 Guard**: Repeated across 25+ endpoints:
  ```javascript
  const item = await Model.findById(id);
  if (!item) return res.status(404).json({ error: "<Entity> not found." });
  ```
- **Soft Delete vs Hard Delete Inconsistency**:
  - Products have a permanent hard delete (`Product.findByIdAndDelete` in `adminProductRoutes.js:256`) alongside a soft toggle (`PATCH /products/:id/toggle-active` using `active: boolean`).
  - Categories, Brands, and Coupons have `isActive` boolean flags, but admin catalog routes perform permanent hard deletes (`findByIdAndDelete`).
- **Slug Generation Inconsistency**:
  - `adminProductRoutes.js:183`: `${slugify(data.title)}-${legacyId + 1}`
  - `adminBlogRoutes.js:45`: `slugify(parsed.data.slug || parsed.data.title)`
  - `adminCatalogRoutes.js:153`: `if (data.name && !data.slug) data.slug = slugify(data.name)`
- **Unique Pre-checks**: Redundant manual `findOne({ email })` or `exists({ slug })` prior to `create()` repeated across `adminStaffRoutes.js:37`, `adminCatalogRoutes.js:155`, and `authRoutes.js:50, 66, 243`.

### g) Auth / Role / Permission Checks
- **Double DB Lookup in Admin Pipeline**:
  1. `adminAuth.js` lines 57-77 queries `User.findById(session.userId)` to verify the user is an active admin/employee.
  2. `adminPageAccess.js` lines 12-24 immediately runs the exact same query (`User.findById(req.admin.userId)`) on every admin request.
- **Inline Role Verification**:
  - `adminProfileRoutes.js:12, 24` re-queries `User.findOne({ email: req.admin.email.toLowerCase(), role: { $in: ["admin", "employee"] } })`.
  - `adminStaffRoutes.js:100-104` has inline checks for self-deletion and last-active-admin check.
  - `userRoutes.js:23-60` uses `requireUserSession` on wishlist routes, but `userRoutes.js:73-360` (orders & addresses) has zero auth middleware and relies on unauthenticated client query/body parameters (`userId`, `email`, `phone`).

### h) Cloudinary & Brevo Calls Outside Services
- **Cloudinary**:
  - Direct `process.env.CLOUDINARY_*` accesses in `adminSettingsRoutes.js:151, 223, 232, 233` and `orderRoutes.js:218`.
  - Manual `isCloudinaryConfigured()` guards duplicated before calling `uploadBufferToCloudinary`.
- **Brevo**:
  - Simulation fallback check `!config.brevoApiKey || config.brevoApiKey === "your_brevo_api_key_here"` duplicated in `authRoutes.js:121, 305`, `contactRoutes.js:51`, and `orderRoutes.js:148`, even though `brevoService.sendBrevoEmail` already has that simulation check internally.
  - Raw HTML email string assembly and escaping are written directly inside `orderRoutes.js:191`, `contactRoutes.js:69-76`, and `forgotPasswordController.js:41`.

### i) Direct `process.env` Access Outside `config.js` (14 occurrences across 7 files)
1. `backend/src/middleware/adminAuth.js:26` — `process.env.ADMIN_SESSION_SECRET`
2. `backend/src/middleware/errorHandler.js:26` — `process.env.NODE_ENV`
3. `backend/src/middleware/userSession.js:5` — `process.env.ADMIN_SESSION_SECRET`
4. `backend/src/routes/adminAuthRoutes.js:34` — `process.env.ADMIN_EMAIL`
5. `backend/src/routes/adminAuthRoutes.js:35` — `process.env.ADMIN_PASSWORD`
6. `backend/src/routes/adminAuthRoutes.js:36` — `process.env.ADMIN_SESSION_SECRET`
7. `backend/src/routes/adminSettingsRoutes.js:151` — `process.env.CLOUDINARY_FOLDER`
8. `backend/src/routes/adminSettingsRoutes.js:223` — `process.env.CLOUDINARY_CLOUD_NAME`
9. `backend/src/routes/adminSettingsRoutes.js:232` — `process.env.CLOUDINARY_CLOUD_NAME`
10. `backend/src/routes/adminSettingsRoutes.js:233` — `process.env.CLOUDINARY_FOLDER`
11. `backend/src/routes/orderRoutes.js:218` — `process.env.CLOUDINARY_FOLDER`
12. `backend/src/services/cloudinary.js:14, 15, 16, 73, 113` — `process.env.CLOUDINARY_*`
13. `backend/src/utils/couponExpiry.js:1` — `process.env.STORE_TIME_ZONE`

### j) Magic Strings Requiring Central Constants
- **User Roles**: `"admin"`, `"employee"`, `"customer"` (used in 8 files).
- **Order Statuses**: `"placed"`, `"processing"`, `"shipped"`, `"delivered"`, `"cancelled"` (used in 6 files).
- **Payment Statuses**: `"pending"`, `"paid"`, `"failed"`, `"refunded"` (used in 4 files).
- **Return / Exchange Types & Statuses**: Types: `"return"`, `"exchange"`; Statuses: `"requested"`, `"approved"`, `"rejected"`, `"completed"`, `"cancelled"`.
- **Blog Post / Comment Statuses**: Posts: `"draft"`, `"published"`; Comments: `"pending"`, `"approved"`, `"spam"`, `"rejected"`.
- **Discount Types**: `"percent"`, `"fixed"`, `"free_shipping"`.
- **Inventory Log Types**: `"purchase"`, `"manual_adjustment"`, `"order_fulfillment"`, `"cancel_return"`, `"return_restock"`.
- **Admin Portal Pages List**: 15 strings duplicated identically in `adminSchemas.js:3-6` and `adminPageAccess.js:5-8`.

### k) Repeated Helpers
- **Phone Normalization**: Identical function defined in both `authRoutes.js:11-15` and `userRoutes.js:63-67`.
- **HTML Escaping**: `escapeHtml` reimplemented in `forgotPasswordController.js:7`, `contactRoutes.js:38`, and `orderRoutes.js:54`.
- **Password Hashing (scrypt)**: Identical `crypto.scryptSync(password, salt, 64)` salt-and-hash pattern written in `adminStaffRoutes.js:3-7`, `resetPasswordController.js:5-9`, and `adminAuthRoutes.js:116`.
- **Stock Updates & Inventory Logging**: Identical fetch-compare-inc-log workflow duplicated across 5 handlers (`adminOrderRoutes.js:43-50, 75-82`, `adminProductRoutes.js:120-128, 230-238`, `orderRoutes.js:405-416`).
- **Order Number Generation**: `HWH-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}` hardcoded inside `orderRoutes.js:345`.
- **Discount Calculation**: Percent/fixed/free-shipping calculation duplicated between `orderRoutes.js:320-333` and `storeRoutes.js:188, 204, 309`.
- **OTP Generation & Email Masking**: `crypto.randomInt(100000, 1000000).toString()` and `maskEmail` defined locally in `authRoutes.js:17-28`.

---

## 3. Bugs and Security Concerns (Flagged for Review — NOT to be fixed in this refactor)

> [!WARNING]
> The following issues exist in the current backend. Per instructions, these are flagged for reporting only and must not be altered during the utility refactoring unless explicitly requested.

1. **Missing Authentication on User Order History (`userRoutes.js:73-155`)**:
   `GET /api/user/orders` has no session/auth check. Anyone can pass `?email=victim@example.com` or `?phone=9876543210` to retrieve the victim's full order history, delivery addresses, items purchased, and return requests.
2. **Missing Authentication and Authorization on User Address CRUD (`userRoutes.js:161-360`)**:
   - `GET /api/user/addresses` exposes all addresses for any email/phone with zero authentication.
   - `PUT /api/user/addresses/:id` and `DELETE /api/user/addresses/:id` allow updating or deleting any saved address by its MongoDB ID with no user session verification or ownership check.
3. **Missing Rate Limiting on Authentication Endpoints (`authRoutes.js`)**:
   - `POST /api/auth/login/request-otp` and `POST /api/auth/signup/request-otp` have no rate limiting. An attacker could spam OTPs, exhausting Brevo email quotas.
   - `POST /api/auth/login/verify-otp` and `POST /api/auth/signup/verify-otp` have no attempt limits. A 6-digit OTP (1,000,000 combinations) could be brute-forced within its 10-minute validity window.
   - `POST /api/newsletter` has no rate limiting.
4. **Internal Error Leaks to Client**:
   - In `routes/adminCustomerRoutes.js:44`, `routes/adminCatalogRoutes.js:180, 230, 281`, and `routes/adminProductRoutes.js:192, 247`, routes return `res.status(500).json({ error: error.message })`, exposing internal database exceptions directly to API callers.
5. **ReDoS / Unsanitized Regex from User Query**:
   In `userRoutes.js:94, 98, 101, 109, 243`, raw query inputs (`cleanPhone`, `cleanUserPhone`) are passed directly into `new RegExp(...)` without escaping via `escapeRegex`.
6. **Privilege Escalation Risk in Admin Staff Management (`adminStaffRoutes.js:94-108`)**:
   Any staff member granted the "Users" page access (even with `role === "employee"`) can create, update, or delete `admin` accounts because routes check only `pageAccess`, not `req.admin.role === "admin"`.
7. **Dual-Mounted Route Ambiguity in `app.js` (`app.js:48-49`)**:
   `app.use("/api/store", storeRoutes);` and `app.use("/api", storeRoutes);` mount `storeRoutes` twice, duplicating route endpoints (e.g. `/api/coupons` and `/api/store/coupons`).

---

## 4. Package.json Script Verification

- In `backend/package.json`:
  ```json
  "scripts": {
    "db:init": "node scripts/init-database.js",
    "seed": "node scripts/seed-products.js",
    "db:setup": "npm run db:init && npm run seed"
  }
  ```
- **Check Result**: `scripts/seed-products.js` **DOES NOT EXIST** on disk in `backend/scripts/`. Running `npm run seed` or `npm run db:setup` fails immediately with `MODULE_NOT_FOUND`.

---

## 5. Proposed Shared Architecture & Refactor Plan

### Target Structure

```
backend/src/
├── config.js               # Single source of truth for ALL process.env values (extended)
├── constants/
│   ├── roles.js            # User roles (admin, employee, customer)
│   ├── statuses.js         # Order, payment, return, blog, review statuses
│   ├── inventory.js        # Inventory log change types
│   ├── pages.js            # Admin portal page list & mappings
│   └── index.js            # Barrel export
├── utils/
│   ├── appError.js         # AppError class with statusCode & isOperational
│   ├── apiResponse.js      # Response helpers (maintaining exact existing JSON shapes)
│   ├── crypto.js           # Password hash (scrypt), HMAC token sign/verify, safeEqual, OTP
│   ├── string.js           # slugify, escapeRegex, escapeHtml, normalizePhone, maskEmail
│   ├── pagination.js       # parsePagination, buildPaginatedResponse
│   ├── blogMetrics.js      # (existing)
│   ├── couponExpiry.js     # (existing, updated to use config)
│   ├── syncRatings.js      # (existing)
│   └── index.js
├── middleware/
│   ├── asyncHandler.js     # (existing)
│   ├── errorHandler.js     # Enhanced to handle AppError, ZodError, and hide internal errors
│   ├── validate.js         # Generic validate(schema, source = 'body' | 'query' | 'params')
│   ├── validateId.js       # Param validation middleware: validateObjectId('id')
│   ├── adminAuth.js        # Refactored to use utils/crypto and config
│   ├── adminPageAccess.js  # Removes redundant DB lookup by reusing req.admin
│   ├── userSession.js      # Refactored to use utils/crypto and config
│   └── index.js
└── services/
    ├── brevoService.js     # Extended to hold HTML email templates (OTP, reset, contact, return)
    ├── cloudinary.js       # Refactored to use config.js instead of process.env
    ├── inventoryService.js # Extracted stock adjustment & InventoryLog creation
    └── pricingService.js   # Extracted discount & order calculation helpers
```

---

### Step-by-Step Refactor Order

Each step is planned to strictly preserve API routes, response shapes, and DB schemas per `AGENTS.md`.

| Step | Scope | Description | Risk Level |
| :---: | :--- | :--- | :---: |
| **Step 1** | `config.js` | Add missing env vars to `config.js` (`adminSessionSecret`, `adminEmail`, `adminPassword`, `storeTimeZone`) so no file reads `process.env` directly. | **Low** |
| **Step 2** | `constants/` | Extract status strings, user roles, inventory types, and admin page lists to `constants/`. Replace magic strings across models and schemas. | **Low** |
| **Step 3** | `utils/` (Pure Helpers) | Create `AppError`, `string.js` (`slugify`, `escapeHtml`, `normalizePhone`, `maskEmail`), `crypto.js` (`hashPassword`, `verifyPassword`, HMAC signing, `generateOtp`), `pagination.js`, and `apiResponse.js`. | **Low** |
| **Step 4** | `middleware/` (Validation & Errors) | Create `validate(schema)` and `validateObjectId(param)` middleware. Update `errorHandler.js` to format `AppError` and `ZodError` without changing existing response shapes. | **Low** |
| **Step 5** | Core Services Cleanup | Update `services/cloudinary.js` to read from `config.js`. Centralize HTML email templates into `services/brevoService.js`. | **Low** |
| **Step 6** | `middleware/` (Auth & Sessions) | Refactor `adminAuth.js`, `adminPageAccess.js`, and `userSession.js` to use `utils/crypto.js` and eliminate the duplicate DB query in `adminPageAccess.js`. | **Medium** |
| **Step 7** | Shared Business Services | Extract `services/inventoryService.js` (stock adjustment + logging) and `services/pricingService.js` (coupon discount calculation). | **Medium** |
| **Step 8** | Route Migration — Admin Routes | Refactor `admin*Routes.js` and `adminSchemas.js` to use `validate()`, `validateObjectId()`, `asyncHandler`, constants, and extracted services. Remove dependency-injection boilerplate in `adminRoutes.js`. | **Medium** |
| **Step 9** | Route Migration — Storefront & User Routes | Refactor `authRoutes.js`, `userRoutes.js`, `contactRoutes.js`, `orderRoutes.js`, `productRoutes.js`, and `storeRoutes.js` to use `asyncHandler`, `validate()`, constants, and shared utilities. | **Medium** |
| **Step 10** | Verification & Clean Up | Run `node --check` on all backend files, test boot with `npm run dev`, verify that responses match expected contract shapes. | **Low** |

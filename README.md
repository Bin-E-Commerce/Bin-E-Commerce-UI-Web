<div align="center">
  <img src="./public/images/logo/logo_background_white.png" alt="Bin E-Commerce" width="240" />

  # Bin E-Commerce Web

  **A complete shopping experience where customers discover, buy, track, and return products — while sellers and admins run the platform from the same frontend.**

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111111" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.7" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/React_Query-5-FF4154?logo=reactquery&logoColor=white" alt="TanStack Query" />
    <img src="https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white" alt="Redux Toolkit" />
    <img src="https://img.shields.io/badge/Keycloak-OIDC-4D4D4D?logo=keycloak&logoColor=white" alt="Keycloak OIDC" />
  </p>

  <a href="https://daongocanh.site">View portfolio</a>
</div>

---

## Table of contents

1. [Problem](#1-problem)
2. [What this application is](#2-what-this-application-is)
3. [Who uses it](#3-who-uses-it)
4. [Features](#4-features)
5. [Trust and data boundaries](#5-trust-and-data-boundaries)
6. [See it work](#6-see-it-work)
7. [Installation](#7-installation)
8. [Architecture](#8-architecture)
9. [Routing and access areas](#9-routing-and-access-areas)
10. [Data fetching and state](#10-data-fetching-and-state)
11. [Authentication flow](#11-authentication-flow)
12. [Commerce flows](#12-commerce-flows)
13. [Recommendation experience](#13-recommendation-experience)
14. [Seller and admin workspaces](#14-seller-and-admin-workspaces)
15. [Design system](#15-design-system)
16. [Project structure](#16-project-structure)
17. [Service clients](#17-service-clients)
18. [Configuration](#18-configuration)
19. [Local development](#19-local-development)
20. [Testing and quality](#20-testing-and-quality)
21. [Performance decisions](#21-performance-decisions)
22. [Security and privacy](#22-security-and-privacy)
23. [Deployment](#23-deployment)
24. [FAQ](#24-faq)
25. [Ownership](#25-ownership)

---

## 1. Problem

An e-commerce frontend has to make several very different experiences feel like one product:

- customers need fast browsing, search, cart, checkout, tracking, and returns;
- guests need to shop before they create an account;
- sellers need a protected workspace for products, orders, shop settings, shipping, and AI tools;
- admins need operational screens for seller review, access control, and recommendation policy;
- every browser request must reach the correct microservice without exposing the internal service topology.

If each page handles authentication, API calls, loading states, errors, and permissions differently, users see inconsistent behavior and developers duplicate fragile integration code.

Bin E-Commerce Web is the Next.js application layer for those experiences. It owns routing, rendering, interaction design, client state, typed service adapters, and user-facing error/loading states. The API Gateway remains the single backend entry point.

---

## 2. What this application is

This is the frontend for the Bin E-Commerce microservices platform.

It combines:

- a public storefront;
- authentication and account management;
- customer cart and checkout;
- order and shipment tracking;
- product reviews and returns;
- seller operations;
- admin operations;
- system showcase pages that explain how the platform works.

The app uses the Next.js App Router and route groups to organize access boundaries without changing the public URL shape.

### Core principle

The browser talks to API Gateway. It does not call Product Service, Order Service, Seller Service, Recommendation Service, or any other microservice directly.

~~~text
Browser
  -> Next.js Web
  -> API Gateway
  -> Auth / Catalog / Product / Cart / Order / Seller / Shipping / Recommendation
~~~

This keeps service discovery, authentication enforcement, rate limiting, request forwarding, and internal headers outside the browser.

---

## 3. Who uses it

### Customers and guests

- browse products and categories;
- search and filter the catalog;
- inspect product variants and reviews;
- manage a guest or authenticated cart;
- sign in and merge guest activity;
- complete COD checkout;
- track delivery;
- confirm delivery;
- submit reviews and evidence;
- request returns;
- manage profile, password, sessions, addresses, and avatar;
- follow public shops;
- receive notifications;
- explore personalized recommendations.

### Sellers

- register a seller application;
- save drafts and resubmit corrections;
- manage products and variants;
- update inventory and product status;
- manage shop profile;
- request sensitive tax or payout changes;
- configure pickup addresses and shipping settings;
- manage seller orders and shipments;
- use AI product-image optimization;
- inspect reviews and support workflows;
- view shop and product analytics.

### Administrators

- review seller applications;
- review shop profile change requests;
- manage access-control information;
- inspect recommendation analytics;
- adjust recommendation policy and AI ranking status;
- review policy history and rollback;
- operate platform-facing admin screens.

---

## 4. Features

### Storefront

- home page with product discovery and highlighted content;
- product listing with search, category, sort, and pagination;
- product detail with variants, images, pricing, stock, reviews, and shipping context;
- public shop pages and shop follow state;
- recommendation sections for home and product detail;
- responsive header, navigation, search, cart preview, and notification bell;
- empty, loading, error, and not-found states.

### Authentication and account

- Keycloak OIDC login and callback;
- registration and password recovery;
- access-token refresh;
- session listing and session revocation;
- profile editing;
- password change;
- address book;
- avatar upload;
- protected route redirects;
- role and permission-aware navigation.

### Cart and checkout

- guest cart and authenticated cart;
- add, update, and remove cart items;
- guest-cart merge after login;
- address selection and inline address creation;
- shipping quote display;
- COD checkout;
- order confirmation;
- recommendation attribution carried into cart and order actions.

### Orders, shipment, and returns

- customer order list and detail;
- seller order list and detail;
- cancellation actions where allowed;
- shipment tracking card and map;
- seller shipment creation, refresh, cancel, and label action;
- return request form;
- return evidence upload;
- delivery confirmation;
- shipment status updates and cache invalidation.

### Seller workspace

- seller onboarding wizard;
- seller application status and correction targets;
- seller product list and editor;
- product variants, options, images, videos, and attributes;
- product inventory;
- shop profile and public preview;
- shipping settings and pickup addresses;
- finance and reconciliation placeholders;
- support and review screens;
- AI image optimization dashboard.

### Admin workspace

- admin dashboard shell;
- seller application review;
- shop profile change review;
- access-control overview;
- recommendation analytics;
- recommendation policy configuration;
- AI ranking switch and read-only model/source status;
- policy history and rollback UI.

### Platform showcase

The public showcase explains the engineering behind the platform:

- recommendation architecture and ranking;
- AI image optimization;
- authorization and permission management;
- service flows and design decisions.

---

## 5. Trust and data boundaries

The frontend handles user interaction, not backend authority.

| Concern | Frontend responsibility | Backend authority |
| --- | --- | --- |
| Authentication | Start login, hold short-lived access state, trigger refresh | Auth Service and Keycloak |
| Authorization | Hide or redirect navigation, show access states | API Gateway and target service |
| Product price/stock | Render current response | Product Service |
| Cart ownership | Send mutations for current actor | Cart Service |
| Order totals | Render checkout summary | Order Service |
| Shipping status | Render tracking and events | Shipping Service |
| Seller ownership | Show seller workspace | Seller Service and Product Service |
| Recommendation ranking | Render items and send attribution | Recommendation Service |
| Media ownership | Upload through signed workflow | Media Service |
| Admin policy | Render form and send commands | Recommendation Service |

### What installation touches

- npm dependencies in node_modules;
- Next.js build output;
- local .env.local configuration;
- browser cookies and in-memory client state during development.

The app does not install shell hooks, change global machine configuration, or expose backend credentials. Public environment variables are embedded into client bundles, so only non-secret configuration may use the NEXT_PUBLIC_ prefix.

---

## 6. See it work

### Start the web app

~~~powershell
cd web
Copy-Item .env.example .env.local
npm install
npm run dev
~~~

Open:

~~~text
http://localhost:5173
~~~

### Open the main experiences

| Experience | URL |
| --- | --- |
| Storefront | / |
| Product listing | /products |
| Product detail | /products/{id} |
| Cart | /cart |
| Checkout | /checkout |
| Customer orders | /profile/orders |
| Account security | /profile/security |
| Seller workspace | /seller |
| Seller products | /seller/products |
| Seller shipping | /seller/shipping/settings |
| Admin recommendation | /admin/recommendation |
| Platform showcase | /showcase/recommendation |

### Verify the frontend boundary

Set NEXT_PUBLIC_API_URL to the API Gateway URL, then inspect the browser Network panel. Requests should target the gateway URL and versioned API paths, not individual service ports.

### Verify authentication

1. Open the login page.
2. Complete the Keycloak flow.
3. Return through the callback route.
4. Confirm the authenticated navigation appears.
5. Open a protected page.
6. Expire the access token or wait for a 401.
7. Confirm one refresh request replays queued requests.
8. Sign out and verify protected routes redirect.

---

## 7. Installation

### Prerequisites

- Node.js compatible with Next.js 16;
- npm;
- API Gateway running locally;
- Keycloak for authentication flows;
- backend services required by the page being tested;
- the monorepo shared packages and infrastructure when using the full stack.

### Install

From the web directory:

~~~bash
npm install
~~~

### Configure

~~~powershell
Copy-Item .env.example .env.local
~~~

Required local values:

~~~text
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=bin-ecommerce
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=web-client
NEXT_PUBLIC_APP_URL=http://localhost:5173
~~~

> [!IMPORTANT]
> The web app makes network requests to API Gateway and Keycloak. It can store browser cookies and short-lived client state. Never put private keys, client secrets, internal service tokens, or refresh tokens in NEXT_PUBLIC_ variables. Stop the development process to disable the app and remove .next, node_modules, or local browser data only when you intend to clear the local environment.

### Run

~~~bash
npm run dev
~~~

### Build and start

~~~bash
npm run build
npm run start
~~~

---

## 8. Architecture

### Application layers

~~~text
Next.js App Router
  -> route pages and layouts
  -> feature components
  -> hooks and query orchestration
  -> typed domain service adapters
  -> Axios boundary
  -> API Gateway
~~~

### Rendering boundary

- server components handle route-level composition and SEO-sensitive rendering where appropriate;
- client components handle forms, dialogs, maps, live interaction, and browser-only APIs;
- providers initialize Redux, TanStack Query, notifications, and other client context;
- middleware and access helpers protect route transitions;
- service adapters keep HTTP details out of UI components.

### Layout boundaries

- shared layout owns common application chrome;
- public layout provides storefront navigation;
- authenticated user layout provides profile and account navigation;
- seller layout provides seller topbar, sidebar, and workspace shell;
- admin layout provides admin navigation and protected dashboard framing.

---

## 9. Routing and access areas

Route groups organize code without appearing in URLs.

| Route group | Purpose | Example |
| --- | --- | --- |
| (public) | Public storefront and showcase | /, /products, /showcase/recommendation |
| (auth) | Login, registration, reset, callback | /login, /register, /callback |
| (user) | Authenticated customer area | /profile/orders, /checkout |
| (seller) | Seller workspace | /seller/products, /seller/shop |
| (admin) | Admin workspace | /admin/recommendation |

### Why route groups matter

A route group can provide a layout and access behavior without adding a path segment. For example, the code folder src/app/(seller)/seller maps to /seller, not /(seller)/seller.

The URL is determined by the folders inside the route group. This is why a code directory can be different from the visible route.

### Access behavior

- public pages can render for guests;
- authenticated pages require a valid session;
- seller pages require seller access;
- admin pages require admin permission;
- access-denied pages explain missing capability instead of failing silently;
- backend authorization remains the final decision.

---

## 10. Data fetching and state

### TanStack Query

TanStack Query owns server state:

- product and category queries;
- cart data;
- orders and returns;
- seller products and shop settings;
- shipment details;
- notifications;
- recommendation results;
- admin analytics and policy history.

Query keys are grouped by domain and invalidated after mutations. This keeps cached data consistent without refetching unrelated screens.

### Redux Toolkit

Redux owns app-wide client state that should survive component boundaries:

- authentication state;
- current user access information;
- token lifecycle coordination;
- application-level UI state where needed.

Redux is not used as a replacement for every server response. Domain data stays in TanStack Query so loading, stale, error, and invalidation behavior remains explicit.

### Axios boundaries

Two main HTTP paths are used:

- publicAxios for public requests;
- authorizedAxios for authenticated requests and token refresh.

The authorized client coordinates concurrent 401 responses:

~~~text
request A -> 401
request B -> 401
  -> one refresh request
  -> queue A and B
  -> replay both with the new access token
  -> redirect to login if refresh fails
~~~

### Forms and validation

- React Hook Form manages form interaction;
- Zod schemas validate client input;
- backend DTO validation remains authoritative;
- payload mappers keep UI form shape separate from API contracts;
- errors are normalized before reaching visible UI.

---

## 11. Authentication flow

~~~text
User
  -> Web login route
  -> Keycloak OIDC
  -> callback route
  -> API Gateway/Auth callback
  -> access state in memory
  -> refresh handled through secure cookie flow
  -> authorized API requests
~~~

### Token principles

- access tokens are short-lived client state;
- refresh behavior is coordinated by the authorized Axios client;
- the browser does not receive internal service tokens;
- sign-out clears local auth state and calls the backend logout boundary;
- protected layouts and middleware improve UX but do not replace backend authorization.

### Session behavior

The profile sessions page reads server-managed sessions and provides explicit revoke actions. It does not assume that removing a local token invalidates every server session.

---

## 12. Commerce flows

### Product discovery

~~~text
Home / search / category
  -> Product API through Gateway
  -> catalog filters and pagination
  -> product cards
  -> product detail
  -> recommendation impression/click attribution
~~~

Product cards are reusable UI units. Product data comes from typed service adapters rather than direct fetch calls scattered across components.

### Cart

~~~text
Guest or user
  -> cart query
  -> add/update/remove item
  -> backend validates product, variant, price, and stock
  -> query cache invalidates
  -> header/cart drawer reflects server response
~~~

The frontend does not decide authoritative availability. Optimistic UI can improve responsiveness, but the server response replaces the local assumption.

### Checkout

~~~text
Cart
  -> authenticated checkout
  -> address selection or creation
  -> shipping quote
  -> order review
  -> confirm COD order
  -> order result
~~~

The UI collects and displays checkout information. Order Service revalidates price, inventory, address, shipping, and idempotency on the server.

### Orders and returns

- order list uses server pagination and filters;
- order detail coordinates delivery, review, and return panels;
- shipment components display status, route, and provider location;
- evidence upload uses Media Service workflows;
- return actions are available only when the backend response allows them;
- mutations invalidate order, shipment, return, and related recommendation queries as needed.

---

## 13. Recommendation experience

The frontend integrates Recommendation Service through a dedicated domain adapter.

### Request context

The recommendation client can send:

- surface: home, product_detail, or recommendations_page;
- product anchor for detail pages;
- user identity through authorized requests;
- guest session ID stored in browser storage;
- page and page size.

### Guest session

The session utility:

- creates a UUID v4 guest session;
- stores it under the application namespace;
- emits a session-changed event;
- lets recommendation hooks react without duplicating storage logic;
- supports merge after login.

### Attribution

Recommendation cards can carry:

- request ID;
- recommendation item ID;
- source;
- rank;
- surface;
- policy version;
- ranking mode;
- signed tracking context.

Clicks and impressions are sent through the recommendation tracking adapter. An impression queue batches repeated viewport signals so remounts do not create uncontrolled duplicates.

### User journey

~~~text
Recommendation card
  -> click
  -> product detail
  -> add to cart
  -> checkout
  -> backend attribution
  -> recommendation analytics
~~~

The browser renders reason labels returned by the backend. It does not calculate ranking scores or decide which products are eligible.

---

## 14. Seller and admin workspaces

### Seller workspace

Seller pages use a shared shell with:

- seller topbar;
- navigation sidebar;
- route-aware active item;
- access-denied state;
- feature-specific query and mutation hooks;
- reusable form and table components.

Seller product editing is split into focused concerns:

- product identity and content;
- category and attribute references;
- variants and options;
- images and videos;
- inventory;
- AI media optimization;
- status and lifecycle actions.

The frontend submits a mapped payload. Product Service remains responsible for ownership, category validation, status transitions, and inventory consistency.

### Admin workspace

Admin pages are permission-aware and use dedicated service adapters for:

- seller applications;
- shop profile change requests;
- access-control information;
- recommendation analytics;
- recommendation policy;
- policy history and rollback.

The recommendation admin screen can display:

- Standard Ranking baseline;
- AI-enabled state;
- AI blend percentage;
- model readiness/fallback;
- candidate pipeline operational status;
- ranking weights;
- policy version;
- audit history.

The UI does not call AI Service directly and never receives internal model credentials.

---

## 15. Design system

### UI foundation

The app uses:

- Tailwind CSS;
- shadcn-compatible components;
- Radix primitives;
- Base UI components where appropriate;
- Lucide icons;
- Motion for selected interactions;
- Sonner for toasts;
- Inter font assets;
- shared theme and base styles.

### Component boundaries

| Folder | Responsibility |
| --- | --- |
| src/components/ui | Reusable primitives |
| src/components/layout | Shared, user, and seller shells |
| src/common | Cross-domain UI such as orders, shipping, reviews, notifications |
| src/app/.../components | Feature-specific components |
| src/app/.../hooks | Feature-specific stateful logic |
| src/app/.../utils | Feature-specific pure helpers |
| src/services | Typed API adapters and contracts |

### UI behavior standards

Every data-driven screen should define:

- loading state;
- empty state;
- error state;
- success feedback;
- disabled state during mutation;
- mobile layout behavior;
- accessible label and keyboard behavior;
- query invalidation after a successful mutation.

Visible user copy belongs near the markup unless the project has an established localization boundary.

---

## 16. Project structure

The web application uses a **route-first, feature-local structure**. A route owns the page composition and the UI behavior that only makes sense on that route. Cross-route infrastructure is kept under `src/components`, `src/services`, `src/hooks`, `src/store`, and `src/common`.

### 16.1 Top-level layout

~~~text
web/
├── public/                 # Static files served as-is by Next.js
│   ├── fonts/              # Local font assets
│   └── images/             # Logo, feature illustrations, AI and showcase assets
├── src/
│   ├── app/                # Next.js App Router: routes, layouts and route-local code
│   ├── common/             # Reusable cross-domain UI for notifications, orders, reviews and shipping
│   ├── components/         # Shared application shell and design-system components
│   ├── config/             # Browser-safe application configuration and runtime constants
│   ├── hooks/              # Cross-feature React hooks
│   ├── lib/                # Technical libraries and validation helpers
│   ├── services/           # Typed API adapters grouped by backend domain
│   ├── store/              # Redux store, slices and client-side global state
│   ├── styles/             # Global styles and Tailwind/theme entry points
│   ├── utils/              # Small pure utilities that are not owned by one feature
│   └── middleware.ts       # Request-time route/auth handling at the Next.js boundary
├── .env.example            # Safe configuration template; no secrets
├── next.config.ts          # Next.js build, image and runtime configuration
├── package.json            # Scripts and dependency contract
├── tsconfig.json           # TypeScript paths and compiler rules
└── README.md               # This frontend architecture guide
~~~

### 16.2 `src/app`: routes and feature boundaries

`src/app` is the entry point for the Next.js App Router. Each URL is assembled from a `page.tsx`; layouts provide the shell and providers shared by a route group. Route files should compose feature components and hooks, not contain API clients or large business algorithms.

~~~text
src/app/
├── (public)/
│   ├── page.tsx                         # Storefront home: /
│   ├── home/                            # Home sections and recommendation placement
│   ├── products/                         # Product listing and product route entry points
│   ├── product-detail/                   # Product detail composition: gallery, purchase, reviews
│   ├── shop/[slug]/                      # Public seller shop pages
│   ├── internal-shop/                    # Internal shop directory
│   ├── cart/                             # Cart page, cart hooks and cart-local types
│   ├── checkout/                         # Address, shipping quote and checkout flow
│   ├── goi-y-hom-nay/                    # Recommendation discovery page
│   └── showcase/                         # Architecture and system feature demonstrations
├── (auth)/
│   ├── login/                            # Login form, schema and login hook
│   ├── register/                         # Registration steps and validation schemas
│   ├── forgot-password/                  # Forgot-password request flow
│   ├── reset-password/                   # Token-based password reset flow
│   └── callback/, auth/callback/          # Authentication callback boundaries
├── (user)/
│   └── profile/                          # Customer account, orders, addresses and sessions
├── (seller)/
│   └── seller/                           # Seller dashboard, catalog, orders, shop and finance
└── (admin)/
    └── admin/                            # Admin dashboard, sellers, products and access control
~~~

The parenthesized folders are **Next.js route groups**. They organize layouts and access boundaries but do not become URL segments. For example, `src/app/(seller)/seller/orders/page.tsx` is served at `/seller/orders`, not `/(seller)/seller/orders`.

### 16.3 Route-local feature folders

Complex routes keep their supporting code beside the route that owns it. This makes a feature easier to understand, test and remove without searching the entire application.

~~~text
src/app/(public)/checkout/
├── page.tsx                         # Thin route entry point
├── components/                      # Checkout-only visual pieces
│   ├── address-form/                # Address form fields, GHN integration and field helpers
│   └── checkout-page/               # Summary, shipping notice and page state views
├── hooks/                           # Checkout queries, mutations and orchestration
├── schemas/                         # Zod/form validation rules
└── types/                           # Types used only by checkout

src/app/(seller)/seller/products/product-editor/
├── page.tsx                         # Product editor route composition
├── assistants/                      # Seller-facing AI content assistants
├── components/                      # Editor layout, sections and shared editor controls
├── constants/                       # Editor options and stable UI configuration
├── hooks/                           # Form state and editor mutations
├── schemas/                         # Product form validation
├── types/                           # Editor-specific contracts
└── utils/                           # Presentation and payload transformations

src/app/(admin)/admin/recommendation/
├── page.tsx                         # Admin recommendation route entry point
├── components/                      # Overview, activity, filters and policy panels
├── hooks/                           # Policy and recommendation admin queries/mutations
└── types/                           # Date-range and page-specific types
~~~

Use this rule when adding files:

- Only one route uses it: keep it inside that route folder.
- Several routes in the same domain use it: consider `src/common/<domain>`.
- It is a visual primitive or application shell element: use `src/components`.
- It talks to a backend endpoint: use the matching `src/services/<domain>` adapter.
- It is reusable stateful behavior: use a hook beside the feature or in `src/hooks` when truly cross-feature.

### 16.4 `src/components`: application shell and shared UI

~~~text
src/components/
├── layout/
│   ├── shared/                      # Public header, footer, navigation and common layout
│   │   ├── header/                  # Logo, search, cart, user menu and showcase link
│   │   └── footer/                  # Footer content and ownership information
│   ├── seller/                      # Seller sidebar, topbar and seller shell
│   ├── admin/                       # Admin shell, sidebar and topbar
│   └── user/                        # Customer profile sidebar
├── providers/                       # Query, Redux, auth, notification and app providers
└── ui/                              # Generic UI primitives built on the design system
~~~

Components in this directory must remain domain-agnostic where possible. A product-card variant that only belongs to one page should stay in that page's `components` folder; a button, dialog, layout shell or navigation primitive can belong here.

### 16.5 `src/services`: backend communication

Each folder represents a backend capability exposed through the API Gateway. The frontend does not call microservices directly from a page component.

~~~text
src/services/<domain>/
├── api/                             # Endpoint adapters and request/response mapping
├── types/                           # Domain API contracts where needed
├── hooks/                           # Query/mutation hooks when the service owns them
├── access/, endpoints/, query-keys/ # Auth-specific boundaries and cache identity
├── tracking/                        # Recommendation impression/event pipeline
└── services/                        # Multi-step domain orchestration
~~~

Typical flow:

~~~text
page.tsx
  └── feature component
       └── feature hook
            └── src/services/<domain>/api
                 └── authorizedAxios or publicAxios
                      └── API Gateway
~~~

Keep authentication headers, endpoint paths, query keys and response normalization inside service boundaries. This prevents every page from inventing a different API integration pattern.

### 16.6 Shared state, utilities and contracts

| Location | Owns | Should not own |
| --- | --- | --- |
| `src/hooks` | Reusable client-side behavior across multiple features | One-off markup or raw endpoint strings |
| `src/store` | Auth/session state and other truly global client state | Server cache that belongs in TanStack Query |
| `src/common` | Cross-domain UI such as order, review, shipping and notification pieces | A complete page or route-specific workflow |
| `src/config` | Public runtime configuration and stable technical settings | Secrets or admin-editable backend policy |
| `src/lib` | Framework/library wrappers and validation infrastructure | Business-specific page composition |
| `src/utils` | Pure formatting, parsing and transformation helpers | Network calls, React state or side effects |
| route `types/` | Types used by one route or feature | Shared API contracts used by multiple domains |
| service `types/` | API request/response and domain integration contracts | Presentation-only view state |

### 16.7 Where to make common changes

| Change | Primary location | Reason |
| --- | --- | --- |
| Add a public page | `src/app/(public)/<route>` | Keeps route, layout and page-specific UI together |
| Add a seller workflow | `src/app/(seller)/seller/<feature>` | Preserves seller access boundary and local state |
| Add an admin workflow | `src/app/(admin)/admin/<feature>` | Preserves admin layout and permission-aware navigation |
| Add an API operation | `src/services/<domain>/api` | Centralizes Gateway contract and error handling |
| Add a query or mutation | Feature `hooks/` or service hooks | Keeps cache keys and invalidation near the operation |
| Add a form | Feature `components/`, `hooks/`, `schemas/` and `types/` | Separates UI, state, validation and data shape |
| Add a shared header/footer item | `src/components/layout/shared` | Makes it available to the public shell consistently |
| Add a global provider | `src/components/providers` and the relevant root layout | Controls initialization and provider order |
| Add a pure formatter | Feature `utils/`, otherwise `src/utils` | Keeps business-specific formatting close to its owner |

The structure is intentionally not a global `components`, `hooks` and `utils` dumping ground. Start local, promote only when a second consumer proves that the code is genuinely shared.

---

## 17. Service clients

The frontend uses typed adapters instead of scattering endpoint strings through JSX.

| Client | Backend boundary |
| --- | --- |
| auth | Auth Service through Gateway |
| catalog | Catalog Service through Gateway |
| product | Product Service through Gateway |
| cart | Cart Service through Gateway |
| order | Order Service through Gateway |
| seller | Seller Service through Gateway |
| shipping | Shipping Service through Gateway |
| notifications | Notification Service through Gateway |
| recommendation | Recommendation Service through Gateway |
| media | Media Service through Gateway |
| ai | AI-assisted product workflows through Gateway |
| admin | Admin-facing service contracts through Gateway |

### Adapter rules

- import the shared API version from config;
- return typed data to hooks;
- normalize Axios errors in one utility;
- keep authorization behavior in the authorized client;
- avoid direct calls from UI components when a domain adapter exists;
- invalidate related TanStack Query keys after mutations;
- preserve backend response contracts and error semantics.

### API version

The API version is centralized in src/config/api.config.ts. A service path should be changed there or in the corresponding domain adapter, not copied into every component.

---

## 18. Configuration

Use [.env.example](./.env.example) as the local template.

| Variable | Required | Purpose |
| --- | --- | --- |
| NEXT_PUBLIC_API_URL | Yes | API Gateway base URL |
| NEXT_PUBLIC_KEYCLOAK_URL | Yes for OIDC | Keycloak base URL |
| NEXT_PUBLIC_KEYCLOAK_REALM | Yes for OIDC | Keycloak realm |
| NEXT_PUBLIC_KEYCLOAK_CLIENT_ID | Yes for OIDC | Public web client ID |
| NEXT_PUBLIC_APP_URL | Recommended | Absolute URL and metadata origin |

### Public environment rule

Every NEXT_PUBLIC_ variable can be exposed to the browser and bundled into client JavaScript.

Never put these values in NEXT_PUBLIC_ variables:

- private keys;
- client secrets;
- refresh tokens;
- internal service tokens;
- database credentials;
- AI provider credentials;
- S3 credentials.

### Environment examples

~~~text
Development:
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:5173

Production:
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://www.example.com
~~~

The browser should know the public gateway and public identity-provider settings only. Backend URLs and credentials remain in backend deployment configuration.

---

## 19. Local development

### Commands

~~~bash
npm run dev
npm run lint
npm run type-check
npm test
npm run build
npm run start
~~~

### Recommended workflow

1. Start the monorepo infrastructure.
2. Start API Gateway.
3. Start Auth and the backend service required by the page.
4. Copy .env.example to .env.local.
5. Start the web app on port 5173.
6. Open the home page and confirm the header loads.
7. Test public catalog and product detail.
8. Test login and callback.
9. Test cart merge after login.
10. Test checkout with a real or seeded address.
11. Test customer order and shipment tracking.
12. Test seller route access and access denied behavior.
13. Test admin permissions.
14. Test recommendation session and attribution.
15. Test notification badge and drawer.
16. Inspect browser console and Network panel for unexpected direct service calls.

### Troubleshooting

| Symptom | Check |
| --- | --- |
| Blank page | Next build output, browser console, route error boundary |
| API 404 | NEXT_PUBLIC_API_URL and API version |
| Login loops | Keycloak client, realm, callback URL, cookie policy |
| 401 after login | Access state, refresh endpoint, Gateway headers |
| Seller page denied | Current permission manifest and Gateway context |
| Empty recommendations | Recommendation catalog projection and session ID |
| Checkout fails | Cart validity, address, Product/Shipping readiness |
| Images missing | Media URL, CDN configuration, image allowlist |
| CORS error | API Gateway origin and credentials configuration |

---

## 20. Testing and quality

### Unit tests

Test:

- service adapters and response mapping;
- auth access helpers;
- token refresh queue;
- query key and invalidation behavior;
- form schemas and payload mappers;
- recommendation session utilities;
- impression queue deduplication;
- error normalization;
- status and date formatters;
- pure product, order, shipping, and review utilities.

### Component tests

Test:

- loading, empty, and error states;
- accessible form interaction;
- modal confirmation;
- seller/admin permission states;
- cart quantity updates;
- checkout validation;
- shipment status rendering;
- review and return forms;
- recommendation click/impression behavior;
- notification read actions.

### End-to-end tests

Use the full stack or controlled service doubles to verify:

- login and callback;
- public product browsing;
- guest cart;
- guest-to-user cart merge;
- checkout;
- order tracking;
- seller onboarding;
- product creation and editing;
- shipment operations;
- admin review;
- recommendation policy display;
- notification flow.

### Quality commands

~~~bash
npm run lint
npm run type-check
npm test -- --runInBand
npm run build
~~~

A production build is the final check for route imports, server/client boundaries, environment usage, and Next.js compilation.

---

## 21. Performance decisions

- use server rendering or static generation where public SEO benefits;
- keep authenticated and highly interactive pages client-driven;
- use TanStack Query caching and deduplication for server state;
- avoid duplicate API calls across nested components;
- keep client component boundaries as small as practical;
- dynamically load heavy browser-only features such as maps and image tools;
- batch recommendation impressions;
- paginate large order, product, admin, and notification lists;
- use optimized image rendering and explicit dimensions;
- avoid sending private or unnecessary data into client component props;
- invalidate only related query keys after mutations;
- keep browser storage small and versioned;
- defer non-critical analytics and third-party work;
- preserve skeleton and optimistic interaction patterns without replacing server truth.

### Rendering rule of thumb

~~~text
Public, SEO-sensitive content
  -> server-friendly rendering

User-specific or highly interactive content
  -> client component + TanStack Query

Global auth/session coordination
  -> provider + Redux/auth facade

Heavy browser-only feature
  -> isolated dynamic client boundary
~~~

---

## 22. Security and privacy

- route all backend traffic through API Gateway;
- never expose internal microservice URLs in client configuration;
- keep secrets out of NEXT_PUBLIC_ variables;
- use secure cookie settings in production;
- do not store refresh tokens in ordinary JavaScript-accessible storage;
- sanitize user-generated rich content before rendering;
- use safe external-image and media URL policies;
- never trust client-side role checks as authorization;
- do not place user IDs or ownership IDs in mutation payloads when the backend can derive them;
- avoid logging access tokens, cookies, personal addresses, bank details, or review evidence;
- clear auth state on logout and refresh failure;
- protect destructive actions with explicit confirmation;
- validate file type and size before upload while preserving backend validation;
- do not render raw HTML from untrusted content without sanitization;
- use HTTPS in production;
- keep dependencies updated and review security advisories;
- configure Content Security Policy and security headers at the deployment boundary.

---

## 23. Deployment

### Production build

~~~bash
npm run build
npm run start
~~~

The production server listens on port 5173 through the package scripts.

### Deployment checklist

1. Set production NEXT_PUBLIC_API_URL.
2. Set production public app URL.
3. Configure Keycloak realm, client, and callback origins.
4. Confirm API Gateway allows the web origin.
5. Confirm secure cookie and HTTPS behavior.
6. Build with the production environment.
7. Run type-check and lint.
8. Verify public home and product pages.
9. Verify login and logout.
10. Verify one authenticated customer flow.
11. Verify one seller-protected flow.
12. Verify admin permission boundaries.
13. Verify image/media loading.
14. Verify recommendation and notification requests target Gateway.
15. Monitor client errors, API latency, and failed refreshes.

### Vercel or Node deployment

The app can run as a Next.js production server or on a platform that supports Next.js. Keep environment variables aligned with the deployment target and ensure server-side runtime configuration is not confused with public browser configuration.

---

## 24. FAQ

### Why does the web app not call each microservice directly?

API Gateway centralizes routing, authentication, rate limits, CORS, and trusted identity forwarding. The browser only needs one public backend origin.

### Why are there folders in parentheses under app?

Next.js route groups use parentheses to organize layouts and access boundaries without adding the folder name to the URL.

### Where should a new API call be added?

Add a typed adapter under the matching src/services domain, then expose it through a hook or feature service. Avoid writing endpoint strings directly inside page components.

### Should all pages use client rendering?

No. Public product and catalog content can benefit from server-friendly rendering. User-specific forms, maps, dialogs, and live interactions need client components.

### Where is authentication state stored?

The app keeps short-lived access state in memory and coordinates refresh through the auth boundary. Do not put private credentials into public environment variables or ordinary local storage.

### Why does a guest have a recommendation session?

A guest can still generate useful browsing signals. The session can later be merged into the authenticated profile after login.

### Why does the UI show an access-denied page when the backend also checks permission?

Client checks improve navigation and user feedback. Backend checks remain authoritative because any browser check can be bypassed.

### Why can a page show stale data after a mutation?

The relevant query key may not have been invalidated or the mutation response may not have replaced the cache. Check the domain hook and query-key convention.

### Can the web app call AI Service directly?

No. AI calls stay behind backend service boundaries. The browser only calls API Gateway and receives the safe result needed by the UI.

### What should be changed for a new microservice?

Add the backend route behind API Gateway, create a typed adapter under src/services, add query/mutation hooks, define loading/error/empty states, and update the relevant access navigation only after the permission contract exists.

---

## 25. Ownership

### Engineering

**Đào Ngọc Anh**

**Software Engineer**

[View portfolio](https://daongocanh.site)

Software Engineer responsible for the frontend architecture, route organization, service integration, interaction design, and maintenance of the Bin E-Commerce web application.

### Architecture and product experience

**Đào Ngọc Anh**

Designed the Next.js application shell, public storefront, customer checkout experience, seller workspace, admin surfaces, typed API boundaries, authentication flow, recommendation experience, and shared UI system.

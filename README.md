<div align="center">

# Bin E-Commerce — Web Frontend

**The customer-facing storefront and admin dashboard for the Bin E-Commerce platform.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)

[Getting Started](#getting-started) · [Project Structure](#project-structure) · [Features](#features) · [Architecture](#architecture) · [Environment Variables](#environment-variables)

</div>

---

## Overview

This is the Next.js 16 frontend for Bin E-Commerce — a monorepo microservices platform. It serves three distinct audiences from a single codebase:

- **Shoppers** — product browsing, cart, checkout, order tracking, returns
- **Authenticated users** — account management, address book, wishlist, review history
- **Admins** — product catalog management, order operations, analytics dashboard

All data fetching goes through the **API Gateway** (`api-gateway:3000`) — this app never calls individual microservices directly.

This repo is included as a **git submodule** in the main monorepo at [`Bin-Ecommerce/web/`](https://github.com/Bin-E-Commerce/Bin-Ecommerce).

---

## Tech Stack

| Concern          | Choice                           | Why                                                                     |
| ---------------- | -------------------------------- | ----------------------------------------------------------------------- |
| Framework        | Next.js 16 App Router            | SSR/ISR for SEO-critical product and category pages                     |
| Language         | TypeScript (strict)              | End-to-end type safety with shared DTOs from `packages/common`          |
| Styling          | Tailwind CSS                     | Utility-first, no runtime overhead, consistent design tokens            |
| State management | Redux Toolkit                    | Predictable auth state, token refresh queue across concurrent requests  |
| HTTP client      | Axios (with interceptors)        | Silent token refresh on 401, request queue while refresh is in progress |
| Authentication   | Keycloak OIDC (httpOnly cookies) | Refresh token stored in httpOnly cookie — never accessible to JS        |
| Package manager  | npm workspaces (Turborepo root)  | Shared packages resolved without publish step                           |
| Deployment       | Vercel                           | Edge network, automatic preview deploys per PR                          |

---

## Getting Started

### Prerequisites

```
Node.js >= 20
npm >= 10
```

The API Gateway must be running at `http://localhost:3000` (or configure `NEXT_PUBLIC_API_URL`). See the [monorepo README](https://github.com/Bin-E-Commerce/Bin-Ecommerce#getting-started) for full infrastructure setup.

### Install

```bash
# From the monorepo root (recommended)
git clone --recurse-submodules https://github.com/Bin-E-Commerce/Bin-Ecommerce.git
cd Bin-Ecommerce
npm install

# Or standalone
git clone https://github.com/Bin-E-Commerce/Bin-E-Commerce-UI-Web.git
cd Bin-E-Commerce-UI-Web
npm install
```

> **What this installs:** npm packages only. No hooks, no config modifications, no telemetry. Uninstall: `rm -rf node_modules`.

### Configure

```bash
cp .env.example .env.local
```

Fill in the required variables — see [Environment Variables](#environment-variables).

### Run

```bash
npm run dev          # Development server at http://localhost:3001 (web)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint + tsc --noEmit
npm test             # Jest unit tests
```

---

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # Unauthenticated routes
│   │   ├── page.tsx            # Home — featured products, banners
│   │   ├── products/           # Product listing + search
│   │   ├── products/[slug]/    # Product detail (SSR + ISR)
│   │   └── categories/[slug]/  # Category pages (ISR)
│   │
│   ├── (auth)/                 # Login / register / OAuth callback
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/           # Keycloak OIDC redirect handler
│   │
│   ├── (user)/                 # Protected — requires valid session
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout flow (address → payment → confirm)
│   │   ├── orders/             # Order history + detail + tracking
│   │   ├── account/            # Profile, address book, password
│   │   ├── wishlist/           # Saved products
│   │   └── returns/            # Return request form + status
│   │
│   └── (admin)/                # Protected — requires ADMIN role
│       ├── dashboard/          # Revenue KPIs, order stats
│       ├── products/           # Catalog management (CRUD)
│       ├── orders/             # Order operations
│       └── analytics/          # Detailed reports
│
├── components/
│   ├── ui/                     # Primitives (Button, Input, Modal, Badge…)
│   ├── product/                # ProductCard, ProductGallery, VariantPicker…
│   ├── cart/                   # CartDrawer, CartItem, CartSummary
│   ├── checkout/               # AddressForm, PaymentForm, OrderReview
│   └── layout/                 # Header, Footer, Sidebar, Breadcrumb
│
├── services/                   # Typed API client — one file per domain
│   ├── auth.service.ts         # login, register, refresh, logout
│   ├── product.service.ts      # getProducts, getProduct, getCategories
│   ├── cart.service.ts         # getCart, addItem, removeItem, applyVoucher
│   ├── order.service.ts        # createOrder, getOrders, getOrderById
│   ├── promotion.service.ts    # validateVoucher
│   └── return.service.ts       # createReturn, getReturns
│
├── store/
│   ├── index.ts                # Redux store setup
│   └── slices/
│       └── authSlice.ts        # Auth state: user, isAuthenticated, tokens
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts              # Current user, login/logout helpers
│   ├── useCart.ts              # Cart state with optimistic updates
│   └── useDebounce.ts
│
├── utils/
│   ├── authorizedAxios.ts      # Axios instance for authenticated requests (auto-refresh)
│   ├── publicAxios.ts          # Axios instance for public endpoints
│   └── getErrorMessage.ts      # Normalize Axios/unknown errors to string
│
├── config/
│   └── api.config.ts           # API version, base URL constants
│
└── middleware.ts               # Next.js middleware — auth redirect, role guard
```

---

## Features

### Authentication

- Keycloak OIDC login with social providers (Google, Facebook)
- Access token stored in memory (Redux), refresh token in httpOnly cookie
- Automatic silent refresh: 401 responses queue pending requests, refresh once, replay all
- Role-based route protection via `middleware.ts` — shoppers vs admins

### Product Pages

- **ISR (Incremental Static Regeneration)** for product detail and category pages — fast loads, SEO-friendly, revalidated on data change
- **SSR** for search results — always fresh, supports query param indexing
- Variant matrix (size × color) with stock availability per variant

### Cart & Checkout

- Persistent cart via `cart-service` (MongoDB, TTL for guest carts)
- Guest cart automatically merged on login
- Voucher validation with real-time feedback from `promotion-service`
- Multi-step checkout: address selection → payment method → order review → confirm

### Order Management

- Real-time order status via polling (shipped, in-transit, delivered)
- Shipping tracking number linked to GHN/GHTK courier pages
- Return request form with evidence upload

### Admin Dashboard

- Revenue charts, order volume, conversion funnel
- Product catalog CRUD (create/edit/archive products and variants)
- Order operations (manual status override, shipment creation)

---

## Architecture

### Authentication Flow

```
Browser
  │
  ├─► GET /login → redirect to Keycloak login page
  │
  ◄─┤ Keycloak redirects back to /callback?code=...
  │
  ├─► POST /api/v1/auth/callback → auth-service exchanges code for tokens
  │       ├── access_token  → stored in Redux (in-memory)
  │       └── refresh_token → stored in httpOnly cookie
  │
  ├─► Subsequent requests: Authorization: Bearer <access_token>
  │
  └─► On 401: authorizedAxios intercepts, calls /api/v1/auth/refresh once,
              replays all queued requests with new access_token
```

### Data Fetching Strategy

| Page type        | Strategy | Reason                                       |
| ---------------- | -------- | -------------------------------------------- |
| Product detail   | ISR      | SEO critical, changes infrequently           |
| Category listing | ISR      | SEO critical, revalidated on catalog changes |
| Search results   | SSR      | Query-param dependent, must be fresh         |
| Cart / Orders    | CSR      | User-specific, no SEO value                  |
| Admin dashboard  | CSR      | Authenticated, real-time feel preferred      |

### API Gateway Connection

All requests go through the API Gateway (`NEXT_PUBLIC_API_URL`). The gateway handles:

- JWT validation (Keycloak public key)
- Rate limiting per IP
- Request routing to the correct microservice

```
Next.js → API Gateway :3000 → auth-service :3001
                             → product-service :3002
                             → cart-service :3003
                             → order-service :3004
                             → ...
```

---

## Environment Variables

```bash
# .env.local

# API Gateway URL (required)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Keycloak (required for OAuth callback)
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=bin-ecommerce
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=web-client

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3001      # Used for absolute URL generation
```

> **Security note:** `NEXT_PUBLIC_*` variables are inlined into client-side bundles. Never put secrets (private keys, client secrets) in `NEXT_PUBLIC_*` variables. The Keycloak client must be configured as a public client (no client secret).

---

## API Version

All service endpoints use the prefix `/api/v1/`. This is centralized in `src/config/api.config.ts`:

```ts
export const API_VERSION = "/api/v1";
```

---

## Related

| Repo / Doc                                                                                      | Description                                  |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [Bin-Ecommerce](https://github.com/Bin-E-Commerce/Bin-Ecommerce)                                | Main monorepo — services, infra, shared pkgs |
| [API Gateway](https://github.com/Bin-E-Commerce/Bin-Ecommerce/tree/main/services/api-gateway)   | Entry point for all frontend API calls       |
| [Auth Service](https://github.com/Bin-E-Commerce/Bin-Ecommerce/tree/main/services/auth-service) | Handles tokens, user profile, addresses      |
| [Domain Docs](https://github.com/Bin-E-Commerce/Bin-Ecommerce/tree/main/doc/domain)             | 12 detailed domain design documents          |

---

## License

MIT © [Bin-E-Commerce](https://github.com/Bin-E-Commerce)

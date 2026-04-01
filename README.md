# UPHAR Premium Fashion Storefront

A premium, mobile-first ecommerce storefront built with Next.js App Router, TypeScript, and Tailwind CSS.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Modular component architecture
- Local storage persistence for cart and order simulation

## Architecture

- `app/`: Routes and page composition
- `components/`: Shared UI, commerce modules, layout primitives, and client providers
- `data/`: Structured dummy catalog and testimonial content
- `lib/`: Pure helpers and storage/service logic
- `types/`: Shared domain models

## Features

- Responsive premium homepage with hero video support
- Men and women category pages
- Product detail pages with gallery and size selection
- Persistent cart with quantity updates and subtotaling
- Checkout form with simulated payment redirect
- Payment return flow that confirms order and payment state
- Account dashboard showing persisted order history

## Run locally

```bash
npm install
npm run dev
```

## Future-ready extension points

- Replace local storage order/cart services with Supabase-backed repositories
- Add real authentication to the account area
- Swap the payment simulation route for a real provider callback flow
- Add server actions or API routes for inventory, pricing, and order orchestration

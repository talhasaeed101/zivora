# Zivora Website (Customer Frontend)

Customer-facing React storefront for browsing jewelry, managing cart and wishlist, applying promo codes, checking out with COD, and leaving product reviews.

## Tech Stack

- **Framework:** React 19
- **Build tool:** Vite 8
- **Routing:** React Router
- **Styling:** Tailwind CSS 4 + custom CSS
- **UI:** Material UI (icons/components where used)

## Prerequisites

- Node.js 18+
- Zivora backend running at `http://localhost:3000`

## Environment Variables

Copy `.env.example` to `.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api/v1` |

## Install

```bash
cd zivora
npm install
```

## Run

**Development:**

```bash
npm run dev
```

Opens at **http://localhost:5173** (Vite default).

**Production build:**

```bash
npm run build
```

**Preview production build:**

```bash
npm run preview
```

## Main Customer Flows

### Auth

- **Register:** `/register` — create customer account
- **Login:** `/login` — JWT stored in `localStorage` (`zivora_customer_token`)
- **Profile:** `/profile` — account details and order history (protected)

### Product Browsing

- **Home:** `/` — featured categories, trending products from API
- **Search:** navbar search or `/?search=true&q=rings` — filters public product catalog
- **Product detail:** `/product/:slug` — gallery, pricing, add to cart/wishlist, reviews

### Wishlist

- Toggle wishlist from product cards or product detail (login required)
- **Wishlist page:** `/wishlist` (protected)
- Navbar shows wishlist badge when logged in

### Cart

- Add/update/remove items when logged in
- **Cart page:** `/?cart=true` or cart icon in navbar
- Quantity changes reset applied promo codes (must re-apply)

### Address

- Manage delivery addresses from cart checkout section
- Add/edit address via delivery address modal
- Select address before checkout

### Promo Code

- Enter code in cart summary and click **Apply**
- Validates against cart subtotal via `POST /promo-codes/validate`
- Discount shown in order summary; sent to backend on checkout (server re-validates)

### Checkout

- **Payment:** Cash on Delivery (COD) only
- Requires: logged in, cart items, selected address
- On success → `/order-success/:id` (protected)
- Cart cleared; promo reset after successful order

### Orders

- View order history under **Profile**
- Order success page shows confirmation after checkout

### Reviews

- Product detail page — read public reviews and summary
- Logged-in customers can submit/edit reviews via review modal
- Like/dislike on individual reviews

## Routing Notes

The app uses a mix of React Router paths (`/login`, `/product/:slug`, `/profile`) and legacy query-based routes (`/?cart=true`, `/?search=true`) for some pages. Both patterns are supported.

## Related Projects

- **Backend API:** `../zivorabackend`
- **Admin panel:** `../zivora-admin`
- **Demo guide:** `../DEMO_GUIDE.md`

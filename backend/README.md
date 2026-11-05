# Healthwithherbal API

Express 4 API using MongoDB through Mongoose. The server listens on port 4000 by default.

## Setup

```powershell
npm install
npm run db:setup
npm run dev
```

## Admin portal

The admin portal is available at `http://localhost:3000/admin`.

## Collections

The Mongoose models live in `src/models`, one file per ER entity: `users`, `addresses`, `brands`, `categories`, `products`, `product_images`, `product_categories`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `wishlists`, `product_reviews`, `coupons`, `coupon_redemptions`, `blog_posts`, `blog_comments`, `blog_likes`, `blog_views`, `shipping_zones`, `shipping_rates`, and `inventory_logs`.

## Routes

- `GET /api/health` — API health.
- `GET /api/products?q=tea&category=Pure%20Herbs&page=1&limit=24` — searchable, paginated active products.
- `GET /api/products/:id` — product by storefront ID or MongoDB ID.
- `POST /api/orders` — validated cash-on-delivery order creation

# Healthwithherbal API

Express 4 API using MongoDB through Mongoose. The server listens on port 4000 by default.

## Setup

```powershell
npm install
npm run db:setup
npm run dev
```

## Collections

The Mongoose models live in `src/models`, one file per ER entity: `users`, `addresses`, `brands`, `categories`, `products`, `product_images`, `product_categories`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `wishlists`, `product_reviews`, `coupons`, `coupon_redemptions`, `blog_posts`, `blog_comments`, `blog_likes`, `blog_views`, `shipping_zones`, `shipping_rates`, and `inventory_logs`.

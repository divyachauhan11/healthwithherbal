# Healthwithherbal API

Express 4 API using MongoDB through Mongoose. The server listens on port 4000 by default.

## Setup

```powershell
npm install
npm run db:setup
npm run dev
```

## Production email and Brevo IP security

Login and signup OTP emails are sent by the backend through Brevo. Brevo sees the
backend host's **outbound (egress) IP**, not the customer's browser or phone IP.
Never try to authorize every customer's IP; those addresses are variable and are
not used for the Brevo API request.

Before going live:

1. Deploy the backend to the production host and configure `BREVO_API_KEY`,
   `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, and the other required environment
   variables in that host's secret/environment settings. Keep the API key on the
   backend; do not expose it in frontend variables or browser code.
2. Determine the production backend's outbound IP address(es) from the hosting
   provider. If the provider uses changing egress IPs, use a static egress IP or
   NAT gateway, or choose a host that provides stable outbound IPs.
3. In Brevo, open **Settings → Security → Authorized IPs** and authorize those
   production egress IPs. If unknown-IP blocking is active, ensure every
   production egress IP is authorized before deploying or enabling the block.
4. Deploy and request a test OTP from a separate network/device. Confirm the
   email arrives and check backend logs for Brevo API errors.

Brevo also allows disabling API IP blocking under **Settings → Security →
Authorized IPs**. That permits API-key use from any IP and reduces protection for
the key. Use it only if the backend environment is controlled and its provider
cannot supply stable egress IPs. It still does not make customer IPs relevant to
login; the API key must remain secret and server-side.

The IP shown in a Brevo unauthorized-IP error is the server that called Brevo.
During local development it may be the developer machine's public IP; after
deployment it should be the production backend's egress IP. Do not whitelist a
production visitor's IP to resolve this error.

## Collections

The Mongoose models live in `src/models`, one file per ER entity: `users`, `addresses`, `brands`, `categories`, `products`, `product_images`, `product_categories`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `wishlists`, `product_reviews`, `coupons`, `coupon_redemptions`, `blog_posts`, `blog_comments`, `blog_likes`, `blog_views`, `shipping_zones`, `shipping_rates`, and `inventory_logs`.

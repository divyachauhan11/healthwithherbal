# Healthwithherbal

## Setup

```powershell
npm install
npm run db:setup
npm run dev
```

## PayU Hosted Checkout

The PayU India integration uses hosted checkout and keeps the merchant salt on
the API server. Configure these backend environment variables before enabling
PayU:

```text
PAYU_KEY=<PayU sandbox merchant key>
PAYU_SALT=<PayU sandbox merchant salt>
PAYU_ENVIRONMENT=test
PAYU_CALLBACK_URL=https://<public-site-domain>/api/orders/payu/callback
WEB_ORIGIN=https://<public-site-domain>
```

The callback URL must be publicly reachable over HTTPS, including in sandbox
testing. Configure PayU's payment webhook to
`https://<public-site-domain>/api/orders/payu/webhook` where webhook delivery is
available. Switch `PAYU_ENVIRONMENT` to `production` and replace the test key
and salt with live credentials only after successful sandbox verification.

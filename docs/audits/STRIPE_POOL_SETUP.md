# Stripe Managed Email Pool Setup — $49/month

## Step 1: Create the Product + Price

1. Go to https://dashboard.stripe.com/products
2. Click **+ Add product**
3. Fill in:
   - **Name**: Managed Email Pool
   - **Description**: 4 pre-warmed rotating email addresses with 800 emails/day capacity. Fully managed warmup and reputation monitoring.
4. Under **Pricing**:
   - **Model**: Standard pricing
   - **Price**: $49.00
   - **Billing period**: Monthly
   - **Currency**: USD
5. Click **Save product**
6. On the product page, find the **Price ID** (starts with `price_`)
7. Copy it — you need it for Railway env var `EMAIL_POOL_STRIPE_PRICE_ID`

## Step 2: Create the Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Fill in:
   - **Endpoint URL**: `https://aileadstrategies.com/api/user/email-pool/webhook`
   - **Description**: Email Pool Subscription Events
4. Under **Select events to listen to**, add these 4 events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. On the endpoint page, click **Reveal** under Signing secret
7. Copy the signing secret (starts with `whsec_`) — you need it for Railway env var `EMAIL_POOL_STRIPE_WEBHOOK_SECRET`

## Step 3: Update Railway Environment Variables

Replace the placeholder values in Railway:

```bash
railway variables set EMAIL_POOL_STRIPE_PRICE_ID=price_XXXXXXXXXXXXX
railway variables set EMAIL_POOL_STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXX
```

Or update them in the Railway dashboard: https://railway.app → Project → Backend Service → Variables

## Step 4: Test the Flow

1. Go to your app → Profile → Email Sending section
2. Click "Subscribe — $49/mo" on the Managed Email Pool card
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)
5. After payment, you should be redirected back to /profile?pool=success
6. After a few seconds, 4 pool email accounts should appear with WARMING status

## Stripe Test Mode

Make sure you're in **Test Mode** (toggle in top-right of Stripe Dashboard) while testing. Switch to Live Mode when ready for production.

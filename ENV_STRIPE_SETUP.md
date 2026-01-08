# Stripe Environment Variables Setup

## Required Environment Variables

Add these to your Railway project:

```bash
# Stripe Keys (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (Get from https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (Create products in Stripe dashboard)
STRIPE_PRICE_LEADSITE_AI=price_...
STRIPE_PRICE_LEADSITE_IO=price_...
STRIPE_PRICE_CLIENTCONTACT_IO=price_...
STRIPE_PRICE_TACKLE_IO=price_...

# Application URL
NEXT_PUBLIC_URL=https://leadsite.io
```

## Setup Steps

### 1. Create Stripe Account
1. Go to https://stripe.com
2. Sign up for account
3. Complete verification

### 2. Get API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Publishable key" (starts with pk_test_)
3. Reveal and copy "Secret key" (starts with sk_test_)

### 3. Create Products & Prices
1. Go to https://dashboard.stripe.com/products
2. Create 4 products:
   - LeadSite.AI - $49/month recurring
   - LeadSite.IO - $29/month recurring
   - ClientContact.IO - $149/month recurring
   - Tackle.IO - $499/month recurring
3. Copy each Price ID (starts with price_)

### 4. Set up Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://leadsite.io/api/stripe/webhook`
4. Events to send:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
5. Copy "Signing secret" (starts with whsec_)

### 5. Add to Railway
```bash
railway variables set STRIPE_SECRET_KEY=sk_test_...
railway variables set STRIPE_PUBLISHABLE_KEY=pk_test_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
railway variables set STRIPE_PRICE_LEADSITE_AI=price_...
railway variables set STRIPE_PRICE_LEADSITE_IO=price_...
railway variables set STRIPE_PRICE_CLIENTCONTACT_IO=price_...
railway variables set STRIPE_PRICE_TACKLE_IO=price_...
railway variables set NEXT_PUBLIC_URL=https://leadsite.io
```

## Testing

### Test Mode
Use test keys (pk_test_, sk_test_) for development.

### Test Cards
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Requires 3D Secure: 4000 0025 0000 3155

### Verify Setup
1. Go to /dashboard/billing
2. Click upgrade button
3. Should redirect to Stripe checkout
4. Use test card to complete payment
5. Verify webhook receives event
6. Check subscription updates in database

# Square Payment Setup Guide

This guide will walk you through setting up Square payments for The Busy Christian web app.

## Overview

We've integrated Square to handle $2.99/month recurring subscriptions for web users. The payment flow is:

1. User clicks "Subscribe" on the paywall
2. They're redirected to Square's checkout page
3. After payment, subscription data is stored in Firestore
4. Square webhooks notify us of subscription changes

---

## Step 1: Create/Access Your Square Account

### If you don't have a Square account:
1. Go to https://squareup.com/signup
2. Click **"Get Started"**
3. Enter your business information
4. Verify your email address
5. Complete business verification (may require ID, business documents)

### If you already have a Square account:
1. Log in to https://squareup.com/dashboard
2. You're ready to go!

---

## Step 2: Get Your API Credentials

### Access Token (Server-Side)

1. Log into Square Dashboard: https://squareup.com/dashboard
2. Click **"Developer"** in the left sidebar (or go to https://developer.squareup.com/apps)
3. Click **"Create App"** or select an existing app
4. Name it: **"The Busy Christian Web App"**
5. Click on your app name
6. Click the **"Credentials"** tab
7. You'll see two environments:
   - **Sandbox** (for testing)
   - **Production** (for real payments)

8. **For Sandbox Testing:**
   - Under "Sandbox", copy the **Sandbox Access Token**
   - This is your `SQUARE_ACCESS_TOKEN` (for testing)

9. **For Production:**
   - Under "Production", copy the **Production Access Token**
   - Use this when you're ready to go live

### Application ID (Client-Side)

1. On the same **"Credentials"** page
2. Copy the **Sandbox Application ID** (for testing)
3. This is your `NEXT_PUBLIC_SQUARE_APPLICATION_ID`

### Location ID

1. In Square Dashboard, go to **"Account & Settings"**
2. Click **"Business"** → **"Locations"**
3. You should see at least one location
4. Copy the **Location ID** (or get it via API)

**OR** use the Square API to get your Location ID:
```bash
curl https://connect.squareupsandbox.com/v2/locations \
  -H "Square-Version: 2024-11-20" \
  -H "Authorization: Bearer YOUR_SANDBOX_ACCESS_TOKEN"
```

Look for `"id"` in the response - that's your `SQUARE_LOCATION_ID`.

---

## Step 3: Create a Subscription Plan

Square subscriptions require a **Subscription Plan** (similar to Stripe's Price).

### Option A: Create via Dashboard

1. Go to Square Dashboard → **"Subscriptions"**
2. Click **"Create Subscription Plan"**
3. Fill in the details:
   - **Name**: "The Busy Christian - Monthly"
   - **Billing frequency**: Monthly
   - **Price**: $2.99
   - **Currency**: USD
4. Click **"Create"**
5. Copy the **Plan Variation ID** - this is your `SQUARE_SUBSCRIPTION_PLAN_ID`

### Option B: Create via API

Run this curl command (replace YOUR_ACCESS_TOKEN):

```bash
curl https://connect.squareupsandbox.com/v2/catalog/object \
  -X POST \
  -H "Square-Version: 2024-11-20" \
  -H "Authorization: Bearer YOUR_SANDBOX_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idempotency_key": "busy-christian-subscription-plan",
    "object": {
      "type": "SUBSCRIPTION_PLAN",
      "id": "#busy-christian-plan",
      "subscription_plan_data": {
        "name": "The Busy Christian - Monthly Subscription",
        "phases": [
          {
            "cadence": "MONTHLY",
            "recurring_price_money": {
              "amount": 299,
              "currency": "USD"
            }
          }
        ]
      }
    }
  }'
```

The response will contain an `id` - this is your `SQUARE_SUBSCRIPTION_PLAN_ID`.

---

## Step 4: Set Up Webhooks

Square needs to notify your app when subscriptions change (created, updated, canceled).

1. Go to Square Dashboard → **"Developer"** → **"Webhooks"**
2. Click **"Create Webhook"**
3. **Webhook URL**: `https://www.thebusychristianapp.com/api/webhooks/square`
4. **Events to subscribe to**:
   - `subscription.created`
   - `subscription.updated`
   - `payment.updated`
   - `invoice.payment_made`
5. Click **"Save"**

### For Local Testing

Use Square's webhook testing tool or ngrok:

```bash
# Install ngrok (if not installed)
brew install ngrok

# Start your local dev server
npm run dev

# In another terminal, expose it
ngrok http 3000

# Use the ngrok URL in Square webhook settings
https://your-ngrok-url.ngrok.io/api/webhooks/square
```

---

## Step 5: Update Environment Variables

Update your `.env.local` file with the values you collected:

```bash
# === SQUARE PAYMENT CONFIGURATION ===
# Access Token from Step 2
SQUARE_ACCESS_TOKEN=EAAAl...your-sandbox-token

# Application ID from Step 2
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-...

# Use "sandbox" for testing, "production" for live
SQUARE_ENVIRONMENT=sandbox

# Location ID from Step 2
SQUARE_LOCATION_ID=L...your-location-id

# Subscription Plan ID from Step 3
SQUARE_SUBSCRIPTION_PLAN_ID=...your-plan-id

# Your app URL
NEXT_PUBLIC_BASE_URL=https://www.thebusychristianapp.com
```

### Add to Vercel

Once your local `.env.local` is updated and tested:

1. Go to Vercel Dashboard → Your Project → **"Settings"** → **"Environment Variables"**
2. Add each `SQUARE_*` variable
3. Redeploy your app

---

## Step 6: Test the Payment Flow

### Local Testing

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Sign in as a non-whitelisted user** (not doug.cag@gmail.com or developer@ilovecornerstone.com)

3. **Navigate to a protected page** (e.g., `/devotional`, `/prayer`)

4. **You should see the paywall**

5. **Click "Subscribe - $2.99/month"**

6. **You'll be redirected to Square Checkout**

7. **Use Square's test cards:**
   - **Success**: `4111 1111 1111 1111`
   - **CVV**: Any 3 digits
   - **Zip**: Any 5 digits
   - **Expiration**: Any future date

8. **Complete the payment**

9. **Check Firestore:**
   - Go to Firebase Console → Firestore
   - Look in the `subscriptions` collection
   - You should see a document for your user with `status: "active"`

10. **Refresh the page** - you should now have access!

### Production Testing

When you're ready to go live:

1. **Switch to Production credentials:**
   - Update `SQUARE_ACCESS_TOKEN` with production token
   - Update `SQUARE_APPLICATION_ID` with production ID
   - Set `SQUARE_ENVIRONMENT=production`
   - Create a production subscription plan and update the ID

2. **Update webhook URL** to production endpoint

3. **Test with real card** (small amount to verify)

4. **Monitor Square Dashboard** for transactions

---

## Troubleshooting

### "Invalid credentials" error
- Double-check your `SQUARE_ACCESS_TOKEN`
- Make sure you're using Sandbox token for `SQUARE_ENVIRONMENT=sandbox`
- Verify the token hasn't expired

### "Location not found" error
- Verify your `SQUARE_LOCATION_ID` is correct
- Make sure the location is active in your Square account

### Subscription not created
- Check server logs for errors
- Verify `SQUARE_SUBSCRIPTION_PLAN_ID` exists
- Check Square Dashboard → Subscriptions for the subscription

### Webhook not received
- Verify webhook URL is publicly accessible
- Check Square Dashboard → Webhooks for delivery status
- For local testing, use ngrok

### User still sees paywall after payment
- Check Firestore for subscription document
- Verify webhook was received (check server logs)
- Clear browser cache and local storage
- Check that Firebase UID matches between subscription and user

---

## Resources

- **Square Developer Docs**: https://developer.squareup.com/
- **Square Subscriptions API**: https://developer.squareup.com/docs/subscriptions-api/overview
- **Square Webhooks**: https://developer.squareup.com/docs/webhooks/overview
- **Square Test Cards**: https://developer.squareup.com/docs/testing/test-values

---

## Next Steps

Once everything is working:

1. ✅ Test the complete flow with sandbox
2. ✅ Verify webhooks are working
3. ✅ Switch to production credentials
4. ✅ Create production subscription plan
5. ✅ Update Vercel environment variables
6. ✅ Deploy to production
7. ✅ Test with real payment (refund if needed)
8. ✅ Go live! 🚀

---

**Questions?** Check the Square Developer Discord or Stack Overflow.

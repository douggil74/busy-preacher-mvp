// Setup script to create Stripe product and price
// Run with: node scripts/setup-stripe.js

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

async function setupStripe() {
  try {
    console.log('🔧 Setting up Stripe product and pricing...\n');

    // Create product
    console.log('Creating product...');
    const product = await stripe.products.create({
      name: 'The Busy Christian - Web Subscription',
      description: 'Monthly subscription for full access to The Busy Christian web app',
      metadata: {
        type: 'web_subscription',
      },
    });
    console.log('✅ Product created:', product.id);
    console.log('   Name:', product.name);

    // Create recurring price ($2.99/month)
    console.log('\nCreating monthly price...');
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 299, // $2.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'Monthly Subscription',
    });
    console.log('✅ Price created:', price.id);
    console.log('   Amount: $2.99/month');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Stripe setup complete!');
    console.log('='.repeat(60));
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env.local file:');
    console.log(`   STRIPE_PRICE_ID=${price.id}`);
    console.log('\n2. Set up webhook in Stripe Dashboard:');
    console.log('   - Go to: https://dashboard.stripe.com/test/webhooks');
    console.log('   - Click "Add endpoint"');
    console.log('   - URL: https://www.thebusychristianapp.com/api/webhooks/stripe');
    console.log('   - Events to listen for:');
    console.log('     • checkout.session.completed');
    console.log('     • customer.subscription.updated');
    console.log('     • customer.subscription.deleted');
    console.log('     • invoice.payment_failed');
    console.log('   - Copy the "Signing secret" and update .env.local:');
    console.log('     STRIPE_WEBHOOK_SECRET=whsec_...');
    console.log('\n3. Add these environment variables to Vercel');
    console.log('4. Test the payment flow!');
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    process.exit(1);
  }
}

setupStripe();

// Script to create a $2.99/month subscription plan in Square
// Run with: node scripts/create-square-plan.js

require('dotenv').config({ path: '.env.local' });
const { Client, Environment } = require('square');
const crypto = require('crypto');

async function createSubscriptionPlan() {
  console.log('\n🔧 Creating Square Subscription Plan...\n');

  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? Environment.Production
      : Environment.Sandbox,
  });

  try {
    const idempotencyKey = crypto.randomUUID();

    const { result } = await client.catalogApi.upsertCatalogObject({
      idempotencyKey,
      object: {
        type: 'SUBSCRIPTION_PLAN',
        id: '#busy-christian-monthly',
        subscriptionPlanData: {
          name: 'The Busy Christian - Monthly Subscription',
          phases: [
            {
              cadence: 'MONTHLY',
              recurringPriceMoney: {
                amount: BigInt(299), // $2.99 in cents
                currency: 'USD',
              },
            },
          ],
        },
      },
    });

    console.log('✅ Subscription plan created successfully!\n');
    console.log('Plan Details:');
    console.log(`   Name: ${result.catalogObject.subscriptionPlanData.name}`);
    console.log(`   Price: $2.99/month`);
    console.log(`   ID: ${result.catalogObject.id}`);
    console.log(`   Version: ${result.catalogObject.version}\n`);

    console.log('=' .repeat(60));
    console.log('📝 Add this to your .env.local file:');
    console.log('='.repeat(60));
    console.log(`SQUARE_SUBSCRIPTION_PLAN_ID=${result.catalogObject.id}\n`);

    console.log('✅ Next steps:');
    console.log('1. Update .env.local with the Subscription Plan ID above');
    console.log('2. Set up webhooks in Square Dashboard');
    console.log('3. Test the payment flow!\n');

  } catch (error) {
    console.error('❌ Error creating subscription plan:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    console.log('\n💡 Make sure:');
    console.log('   1. Your SQUARE_ACCESS_TOKEN is valid');
    console.log('   2. Your Square account has subscription permissions');
    console.log('   3. You haven\'t already created this plan (check Square Dashboard)\n');
  }
}

createSubscriptionPlan();

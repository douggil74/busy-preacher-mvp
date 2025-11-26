// Test script to verify Square credentials and create subscription plan
// Run with: node scripts/test-square.js

require('dotenv').config({ path: '.env.local' });
const { Client, Environment } = require('square');

async function testSquareSetup() {
  console.log('\n🔧 Testing Square Integration...\n');

  // Check environment variables
  const requiredVars = [
    'SQUARE_ACCESS_TOKEN',
    'SQUARE_ENVIRONMENT',
  ];

  const missing = requiredVars.filter(v => !process.env[v] || process.env[v].includes('YOUR_'));

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.log('\n📖 Please follow SQUARE-SETUP-GUIDE.md to get your credentials\n');
    return;
  }

  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? Environment.Production
      : Environment.Sandbox,
  });

  try {
    // Test 1: Get locations
    console.log('1️⃣  Testing API connection & getting locations...');
    const { result: locationsResult } = await client.locationsApi.listLocations();

    if (!locationsResult.locations || locationsResult.locations.length === 0) {
      console.error('❌ No locations found. Create a location in Square Dashboard first.');
      return;
    }

    console.log('✅ API connection successful!');
    console.log(`   Found ${locationsResult.locations.length} location(s):`);

    locationsResult.locations.forEach((loc, i) => {
      console.log(`   ${i + 1}. ${loc.name} (ID: ${loc.id})`);
    });

    const locationId = locationsResult.locations[0].id;
    console.log(`\n   💡 Using location: ${locationsResult.locations[0].name}`);
    console.log(`   📝 Add to .env.local: SQUARE_LOCATION_ID=${locationId}\n`);

    // Test 2: Check for existing subscription plans
    console.log('2️⃣  Checking for subscription plans...');
    const { result: catalogResult } = await client.catalogApi.listCatalog(
      undefined, // cursor
      'SUBSCRIPTION_PLAN'
    );

    if (catalogResult.objects && catalogResult.objects.length > 0) {
      console.log(`✅ Found ${catalogResult.objects.length} subscription plan(s):`);
      catalogResult.objects.forEach((plan, i) => {
        const planData = plan.subscriptionPlanData;
        if (planData) {
          const phase = planData.phases?.[0];
          const price = phase?.recurringPriceMoney;
          const priceStr = price ? `$${(Number(price.amount) / 100).toFixed(2)}/${phase.cadence?.toLowerCase()}` : 'N/A';
          console.log(`   ${i + 1}. ${planData.name} - ${priceStr}`);
          console.log(`      ID: ${plan.id}`);

          // Check if it's a $2.99/month plan
          if (price?.amount === 299n && phase?.cadence === 'MONTHLY') {
            console.log(`   💡 This looks like your $2.99/month plan!`);
            console.log(`   📝 Add to .env.local: SQUARE_SUBSCRIPTION_PLAN_ID=${plan.id}\n`);
          }
        }
      });
    } else {
      console.log('⚠️  No subscription plans found.');
      console.log('   Would you like to create one? (See option below)\n');
    }

    // Test 3: Offer to create subscription plan
    console.log('3️⃣  Would you like to create a $2.99/month subscription plan?');
    console.log('   Run: node scripts/create-square-plan.js\n');

    console.log('=' .repeat(60));
    console.log('🎉 Square setup test complete!');
    console.log('='.repeat(60));
    console.log('\n📝 Next steps:');
    console.log('1. Copy the Location ID above to .env.local');
    console.log('2. Create or copy a Subscription Plan ID to .env.local');
    console.log('3. Set up webhooks in Square Dashboard');
    console.log('4. Test the payment flow!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('   Details:', JSON.stringify(error.errors, null, 2));
    }
    console.log('\n💡 Make sure you:');
    console.log('   1. Have the correct SQUARE_ACCESS_TOKEN');
    console.log('   2. Set SQUARE_ENVIRONMENT to "sandbox" or "production"');
    console.log('   3. Your Square account is fully activated\n');
  }
}

testSquareSetup();

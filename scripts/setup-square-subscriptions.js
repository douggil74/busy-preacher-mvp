#!/usr/bin/env node
/**
 * Setup Square Subscription Plans
 *
 * This script creates the subscription plans in Square's catalog.
 * Run this ONCE to set up your subscription products.
 *
 * Usage: node scripts/setup-square-subscriptions.js
 */

require('dotenv').config();
const { Client, Environment } = require('square');

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
});

async function setupSubscriptionPlans() {
  console.log('🔧 Setting up Square Subscription Plans...\n');
  console.log(`Environment: ${process.env.SQUARE_ENVIRONMENT || 'sandbox'}`);
  console.log(`Location ID: ${process.env.SQUARE_LOCATION_ID}\n`);

  try {
    // First, check if plans already exist
    const { result: catalogResult } = await client.catalogApi.searchCatalogObjects({
      objectTypes: ['SUBSCRIPTION_PLAN'],
    });

    if (catalogResult.objects?.length > 0) {
      console.log('📋 Existing subscription plans found:');
      for (const plan of catalogResult.objects) {
        console.log(`  - ${plan.subscriptionPlanData?.name} (ID: ${plan.id})`);
      }
      console.log('\n⚠️  Plans already exist. Delete them in Square Dashboard if you want to recreate.');
      console.log('\nAdd these to your .env file:');
      for (const plan of catalogResult.objects) {
        const name = plan.subscriptionPlanData?.name?.toLowerCase().includes('annual')
          ? 'ANNUAL' : 'MONTHLY';
        console.log(`SQUARE_PLAN_${name}_ID=${plan.id}`);
      }
      return;
    }

    // Create a unique idempotency key
    const idempotencyKey = `setup-plans-${Date.now()}`;

    // Create Monthly and Annual subscription plans
    const { result } = await client.catalogApi.batchUpsertCatalogObjects({
      idempotencyKey,
      batches: [{
        objects: [
          // Monthly Plan - $3.99/month
          {
            type: 'SUBSCRIPTION_PLAN',
            id: '#monthly-plan',
            subscriptionPlanData: {
              name: 'The Busy Christian - Monthly',
              phases: [{
                cadence: 'MONTHLY',
                periods: null, // Infinite (until cancelled)
                recurringPriceMoney: {
                  amount: BigInt(399), // $3.99
                  currency: 'USD',
                },
              }],
            },
          },
          // Annual Plan - $35.88/year ($2.99/mo equivalent)
          {
            type: 'SUBSCRIPTION_PLAN',
            id: '#annual-plan',
            subscriptionPlanData: {
              name: 'The Busy Christian - Annual (Save 25%)',
              phases: [{
                cadence: 'ANNUAL',
                periods: null, // Infinite (until cancelled)
                recurringPriceMoney: {
                  amount: BigInt(3588), // $35.88
                  currency: 'USD',
                },
              }],
            },
          },
        ],
      }],
    });

    console.log('✅ Subscription plans created successfully!\n');

    // Extract the created plan IDs
    const idMappings = result.idMappings || [];
    const objects = result.objects || [];

    console.log('📋 Created Plans:');
    for (const obj of objects) {
      if (obj.type === 'SUBSCRIPTION_PLAN') {
        console.log(`  - ${obj.subscriptionPlanData?.name}`);
        console.log(`    ID: ${obj.id}`);
      }
    }

    console.log('\n🔑 Add these to your .env file:\n');
    for (const obj of objects) {
      if (obj.type === 'SUBSCRIPTION_PLAN') {
        const name = obj.subscriptionPlanData?.name?.toLowerCase().includes('annual')
          ? 'ANNUAL' : 'MONTHLY';
        console.log(`SQUARE_PLAN_${name}_ID=${obj.id}`);
      }
    }

    console.log('\n✨ Setup complete!');

  } catch (error) {
    console.error('❌ Error setting up subscription plans:', error);
    if (error.result?.errors) {
      for (const err of error.result.errors) {
        console.error(`  - ${err.category}: ${err.detail}`);
      }
    }
    process.exit(1);
  }
}

setupSubscriptionPlans();

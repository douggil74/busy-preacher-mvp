/**
 * Script to create promo codes in Firestore
 * Usage: node -r dotenv/config scripts/create-promo-code.js
 *
 * Environment variables required:
 * - FIREBASE_ADMIN_PROJECT_ID
 * - FIREBASE_ADMIN_CLIENT_EMAIL
 * - FIREBASE_ADMIN_PRIVATE_KEY
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey?.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey,
    }),
  });
}

const db = admin.firestore();

// Promo code types:
// - free_forever: Permanent free access
// - free_trial_extension: Extends trial by X days
// - discount_percent: Percentage discount (0-100)
// - discount_fixed: Fixed dollar discount in cents

async function createPromoCode(options) {
  const {
    code,
    type,
    description,
    value, // For discounts: percentage or cents
    trialDays, // For trial extensions
    maxUses, // Optional: limit number of uses
    expiresAt, // Optional: expiration date
    createdBy = 'admin',
  } = options;

  const normalizedCode = code.toUpperCase().trim();

  const promoData = {
    code: normalizedCode,
    type,
    description: description || `${type} promo code`,
    currentUses: 0,
    isActive: true,
    createdAt: new Date(),
    createdBy,
  };

  if (value !== undefined) promoData.value = value;
  if (trialDays !== undefined) promoData.trialDays = trialDays;
  if (maxUses !== undefined) promoData.maxUses = maxUses;
  if (expiresAt !== undefined) promoData.expiresAt = expiresAt;

  await db.collection('promoCodes').doc(normalizedCode).set(promoData);

  console.log('Promo code created:', {
    code: normalizedCode,
    type,
    description: promoData.description,
  });

  return promoData;
}

// Example promo codes to create
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Creating default promo codes...');

    // Free forever code for special users
    await createPromoCode({
      code: 'FREEFOREVER',
      type: 'free_forever',
      description: 'Lifetime free access',
    });

    // Free forever code for friends/family
    await createPromoCode({
      code: 'BLESSED2024',
      type: 'free_forever',
      description: 'Friends & family free access',
    });

    // Extended trial (30 extra days)
    await createPromoCode({
      code: 'TRIAL30',
      type: 'free_trial_extension',
      trialDays: 30,
      description: '30-day extended trial',
    });

    // 50% off discount
    await createPromoCode({
      code: 'HALFOFF',
      type: 'discount_percent',
      value: 50,
      description: '50% off subscription',
    });

    console.log('\nDefault promo codes created successfully!');
  } else {
    // Custom promo code from command line
    const [code, type, ...rest] = args;

    const options = { code, type };

    if (type === 'free_trial_extension' && rest[0]) {
      options.trialDays = parseInt(rest[0]);
    } else if ((type === 'discount_percent' || type === 'discount_fixed') && rest[0]) {
      options.value = parseInt(rest[0]);
    }

    if (rest.includes('--description')) {
      const descIndex = rest.indexOf('--description');
      options.description = rest.slice(descIndex + 1).join(' ');
    }

    await createPromoCode(options);
  }

  process.exit(0);
}

main().catch(console.error);

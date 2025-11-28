const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

async function deleteTestUsers() {
  const emailsToDelete = [
    'doug.cag@gmail.com',
    // Add more test emails here if needed
  ];

  console.log('Deleting test users from Firebase Auth...\n');

  for (const email of emailsToDelete) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().deleteUser(user.uid);
      console.log(`✓ Deleted: ${email} (uid: ${user.uid})`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`- Not found: ${email}`);
      } else {
        console.error(`✗ Error deleting ${email}:`, error.message);
      }
    }
  }

  console.log('\nDone! You can now sign up with these emails again.');
}

deleteTestUsers().then(() => process.exit(0)).catch(console.error);

// Test script to verify prayer notification system
// Run with: node test-prayer-notification.js

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  increment
} = require('firebase/firestore');

// Initialize Firebase (using your production config)
const firebaseConfig = {
  apiKey: "AIzaSyCiOBWLg-2cxKCMZ2QQfWz0cKuUeBF4diQ",
  authDomain: "busypreacher.firebaseapp.com",
  projectId: "busypreacher",
  storageBucket: "busypreacher.firebasestorage.app",
  messagingSenderId: "1030253653653",
  appId: "1:1030253653653:web:e0d7d89acce88a72eb3f62"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testNotificationSystem() {
  console.log('🧪 Starting prayer notification system test...\n');

  try {
    // 1. Find an active prayer request
    console.log('📋 Step 1: Finding active prayer requests...');
    const prayersQuery = query(
      collection(db, 'prayer_requests'),
      where('status', '==', 'active'),
      limit(5)
    );

    const snapshot = await getDocs(prayersQuery);

    if (snapshot.empty) {
      console.log('❌ No active prayer requests found. Please create a prayer request first.');
      return;
    }

    console.log(`✅ Found ${snapshot.size} active prayer requests\n`);

    // Display available prayers
    const prayers = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      prayers.push({ id: doc.id, ...data });
      console.log(`Prayer ${prayers.length}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Request: ${data.request.substring(0, 60)}...`);
      console.log(`  User ID: ${data.userId}`);
      console.log(`  Hearts: ${data.heartCount || 0}`);
      console.log(`  Hearts array length: ${data.hearts?.length || 0}`);
      console.log('');
    });

    // 2. Select first prayer to test
    const testPrayer = prayers[0];
    console.log(`🎯 Testing with prayer: "${testPrayer.request.substring(0, 60)}..."\n`);

    // 3. Add a test heart
    console.log('💓 Step 2: Adding a test heart...');
    const testUserId = `test_user_${Date.now()}`;
    const prayerRef = doc(db, 'prayer_requests', testPrayer.id);

    await updateDoc(prayerRef, {
      hearts: arrayUnion({ userId: testUserId, timestamp: Date.now() }),
      heartCount: increment(1)
    });

    console.log('✅ Test heart added successfully!');
    console.log(`   Test User ID: ${testUserId}\n`);

    // 4. Verify the update
    console.log('🔍 Step 3: Verifying the update...');
    const updatedSnapshot = await getDocs(query(
      collection(db, 'prayer_requests'),
      where('__name__', '==', testPrayer.id)
    ));

    if (!updatedSnapshot.empty) {
      const updatedData = updatedSnapshot.docs[0].data();
      console.log('✅ Prayer updated:');
      console.log(`   New heart count: ${updatedData.heartCount}`);
      console.log(`   Hearts array length: ${updatedData.hearts?.length || 0}`);
      console.log(`   Last heart user: ${updatedData.hearts[updatedData.hearts.length - 1]?.userId}`);
      console.log('');
    }

    console.log('✅ Test completed successfully!');
    console.log('\n📱 If you have the prayer page open with this prayer as yours,');
    console.log('   you should see a notification popup and hear a sound!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  }

  process.exit(0);
}

// Run the test
testNotificationSystem();

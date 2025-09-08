#!/usr/bin/env node

/**
 * User Permission Checker for dekr-nextgen
 * 
 * This script helps identify permission issues for real users by:
 * 1. Checking if user document exists in Firestore
 * 2. Testing various Firestore operations
 * 3. Providing specific error messages and solutions
 */

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore, doc, getDoc, collection, getDocs, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsOes01Lnp2leFMN_qJbk-_X6nZIlHvBU",
  authDomain: "dekr-nextgen.firebaseapp.com",
  projectId: "dekr-nextgen",
  storageBucket: "dekr-nextgen.appspot.com",
  messagingSenderId: "152969284019",
  appId: "1:152969284019:web:8c2a1d6a7d6a48c52623c6",
  measurementId: "G-4TB90WRQ97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkUserDocument(userId) {
  console.log(`🔍 Checking user document for: ${userId}`);
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      console.log('✅ User document exists');
      const userData = userDoc.data();
      console.log('   User data:', {
        email: userData.email,
        displayName: userData.displayName,
        isAdmin: userData.isAdmin,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt
      });
      return userData;
    } else {
      console.log('❌ User document does not exist');
      console.log('💡 This is likely the cause of permission denied errors');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking user document:', error.code, error.message);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Permission denied - this suggests:');
      console.log('   1. User is not properly authenticated');
      console.log('   2. Firestore rules are too restrictive');
      console.log('   3. User document needs to be created');
    }
    
    return null;
  }
}

async function createUserDocument(userId, userEmail) {
  console.log(`📝 Creating user document for: ${userId}`);
  
  try {
    const userData = {
      email: userEmail,
      displayName: userEmail.split('@')[0],
      createdAt: new Date(),
      isAdmin: false,
      isPublic: false,
      preferences: {
        theme: 'light',
        notifications: true
      }
    };
    
    await setDoc(doc(db, 'users', userId), userData);
    console.log('✅ User document created successfully');
    return userData;
  } catch (error) {
    console.error('❌ Error creating user document:', error.code, error.message);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Permission denied - this suggests:');
      console.log('   1. User is not properly authenticated');
      console.log('   2. Firestore rules prevent user creation');
      console.log('   3. Need to run this with proper authentication');
    }
    
    return null;
  }
}

async function testFirestoreOperations(userId) {
  console.log(`🧪 Testing Firestore operations for user: ${userId}`);
  
  const tests = [
    {
      name: 'Read cards collection',
      operation: () => getDocs(collection(db, 'cards'))
    },
    {
      name: 'Read education content',
      operation: () => getDocs(collection(db, 'educationContent'))
    },
    {
      name: 'Read user decks',
      operation: () => getDocs(collection(db, 'users', userId, 'decks'))
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔄 Testing: ${test.name}`);
      const result = await test.operation();
      console.log(`✅ ${test.name}: Success (${result.size || 'N/A'} documents)`);
    } catch (error) {
      console.log(`❌ ${test.name}: Failed - ${error.code} - ${error.message}`);
      
      if (error.code === 'permission-denied') {
        console.log(`   💡 Permission denied for ${test.name}`);
      }
    }
  }
}

async function runUserPermissionCheck() {
  console.log('🚀 User Permission Checker for dekr-nextgen\n');
  
  // Check if user is authenticated
  if (!auth.currentUser) {
    console.log('❌ No user currently authenticated');
    console.log('💡 Please sign in through the app first, then run this script');
    console.log('   Or provide a user ID to check manually');
    
    // Allow manual user ID input
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Enter user ID to check (or press Enter to exit): ', async (userId) => {
      if (userId.trim()) {
        await checkUserPermissions(userId.trim());
      }
      rl.close();
    });
    
    return;
  }
  
  const user = auth.currentUser;
  console.log('✅ User authenticated:');
  console.log('   User ID:', user.uid);
  console.log('   Email:', user.email);
  console.log('   Email Verified:', user.emailVerified);
  
  await checkUserPermissions(user.uid);
}

async function checkUserPermissions(userId) {
  console.log(`\n🔍 Checking permissions for user: ${userId}\n`);
  
  // Check if user document exists
  const userData = await checkUserDocument(userId);
  
  // If user document doesn't exist, try to create it
  if (!userData) {
    console.log('\n📝 Attempting to create user document...');
    const email = auth.currentUser?.email || 'unknown@example.com';
    await createUserDocument(userId, email);
  }
  
  // Test various Firestore operations
  await testFirestoreOperations(userId);
  
  console.log('\n📋 Permission Check Summary:');
  console.log('============================');
  
  if (userData) {
    console.log('✅ User document: Exists');
  } else {
    console.log('❌ User document: Missing (likely cause of permission errors)');
  }
  
  console.log('\n🔧 Solutions for Permission Denied Errors:');
  console.log('1. Ensure user document exists in Firestore');
  console.log('2. Check Firestore security rules are deployed');
  console.log('3. Verify user is properly authenticated');
  console.log('4. Check if user has required permissions in rules');
  
  console.log('\n📚 Next Steps:');
  console.log('1. If user document is missing, create it manually in Firebase Console');
  console.log('2. Or run: firebase firestore:import to restore user data');
  console.log('3. Check Firebase Console for any error logs');
  console.log('4. Verify Firestore rules allow user operations');
  
  process.exit(0);
}

// Run the permission check
runUserPermissionCheck().catch(console.error);

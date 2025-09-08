#!/usr/bin/env node

/**
 * Test User Sign-up Script
 * 
 * This script tests the complete user sign-up flow including:
 * 1. Authentication
 * 2. User document creation
 * 3. Permission testing
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, setDoc, collection, getDocs } = require('firebase/firestore');

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

async function createUserProfile(userId, email, displayName = null) {
  console.log(`📝 Creating user profile for: ${userId}`);
  
  const userData = {
    email: email,
    displayName: displayName || email.split('@')[0],
    createdAt: new Date(),
    isAdmin: false,
    isPublic: false,
    preferences: {
      theme: 'light',
      notifications: true,
      audioEnabled: true,
      autoPlay: false
    },
    profile: {
      bio: '',
      avatar: null,
      location: null,
      website: null
    },
    stats: {
      totalLessonsCompleted: 0,
      totalDecksCreated: 0,
      totalCardsStudied: 0,
      streak: 0,
      lastActive: new Date()
    }
  };
  
  try {
    await setDoc(doc(db, 'users', userId), userData);
    console.log('✅ User profile created successfully');
    return userData;
  } catch (error) {
    console.error('❌ Error creating user profile:', error.code, error.message);
    throw error;
  }
}

async function testUserPermissions(userId) {
  console.log(`🧪 Testing permissions for user: ${userId}`);
  
  const tests = [
    {
      name: 'Read user document',
      test: async () => {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists();
      }
    },
    {
      name: 'Read cards collection',
      test: async () => {
        const snapshot = await getDocs(collection(db, 'cards'));
        return snapshot.size;
      }
    },
    {
      name: 'Read education content',
      test: async () => {
        const snapshot = await getDocs(collection(db, 'educationContent'));
        return snapshot.size;
      }
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`🔄 Testing: ${test.name}`);
      const result = await test.test();
      console.log(`✅ ${test.name}: Success (${result})`);
      results.push({ name: test.name, success: true, result });
    } catch (error) {
      console.log(`❌ ${test.name}: Failed - ${error.code} - ${error.message}`);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  return results;
}

async function testSignUpFlow() {
  console.log('🚀 Testing User Sign-up Flow for dekr-nextgen\n');
  
  // Get user details
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const email = await new Promise((resolve) => {
    rl.question('Enter email for new user: ', resolve);
  });
  
  const password = await new Promise((resolve) => {
    rl.question('Enter password: ', resolve);
  });
  
  const displayName = await new Promise((resolve) => {
    rl.question('Enter display name (optional): ', resolve);
  });
  
  rl.close();
  
  try {
    // Step 1: Create user account
    console.log('\n🔄 Step 1: Creating user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ User account created successfully!');
    console.log('   User ID:', user.uid);
    console.log('   Email:', user.email);
    
    // Step 2: Create user document
    console.log('\n🔄 Step 2: Creating user document...');
    await createUserProfile(user.uid, user.email, displayName || null);
    
    // Step 3: Test permissions
    console.log('\n🔄 Step 3: Testing permissions...');
    const results = await testUserPermissions(user.uid);
    
    // Summary
    console.log('\n📋 Sign-up Test Results:');
    console.log('========================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (successful === results.length) {
      console.log('\n🎉 User sign-up flow is working correctly!');
      console.log('   New users can now sign up and access the app.');
    } else {
      console.log('\n⚠️ Some permissions are still failing.');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Sign-up failed:', error.code, error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('💡 Email is already in use. Try signing in instead.');
    } else if (error.code === 'auth/weak-password') {
      console.log('💡 Password is too weak. Use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 Invalid email address.');
    }
  }
  
  process.exit(0);
}

// Run the test
testSignUpFlow().catch(console.error);

#!/usr/bin/env node

/**
 * Complete Permission Fix Script
 * 
 * This script fixes all permission issues by:
 * 1. Creating the user document in Firestore
 * 2. Testing all permissions
 * 3. Providing detailed feedback
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
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

async function createUserDocument(userId, email, displayName = null) {
  console.log(`📝 Creating user document for: ${userId}`);
  
  const userData = {
    uid: userId,
    email: email,
    displayName: displayName || email.split('@')[0],
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    currentStage: 1,
    xp: 0,
    stats: {
      weeklyGainPercent: 0,
      competitionsWon: 0,
      lessonsCompleted: 0
    },
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
    }
  };
  
  try {
    await setDoc(doc(db, 'users', userId), userData);
    console.log('✅ User document created successfully');
    return userData;
  } catch (error) {
    console.error('❌ Error creating user document:', error.code, error.message);
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
    },
    {
      name: 'Read user decks',
      test: async () => {
        const snapshot = await getDocs(collection(db, 'users', userId, 'decks'));
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

async function fixUserPermissions(userId, email) {
  try {
    console.log('🔧 Fixing permissions for user:', userId);
    
    // 1. Check if user document exists
    console.log('🔍 Checking if user document exists...');
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.log('📝 Creating user document...');
      
      // 2. Create user document
      await createUserDocument(userId, email, email.split('@')[0]);
      
      console.log('✅ User document created');
    } else {
      console.log('✅ User document already exists');
    }
    
    // 3. Test read access
    console.log('🔍 Testing user document read access...');
    const testDoc = await getDoc(doc(db, 'users', userId));
    console.log('✅ User document readable:', testDoc.exists());
    
    // 4. Test all permissions
    console.log('\n🧪 Testing all permissions...');
    const results = await testUserPermissions(userId);
    
    // Summary
    console.log('\n📋 Permission Test Results:');
    console.log('============================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (successful === results.length) {
      console.log('\n🎉 All permissions are working correctly!');
      console.log('   Your permission denied errors should be resolved.');
    } else {
      console.log('\n⚠️ Some permissions are still failing.');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing permissions:', error.code, error.message);
  }
}

async function main() {
  console.log('🚀 Complete Permission Fix Script for dekr-nextgen\n');
  
  // Get user credentials
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const email = await new Promise((resolve) => {
    rl.question('Enter your email: ', resolve);
  });
  
  const password = await new Promise((resolve) => {
    rl.question('Enter your password: ', resolve);
  });
  
  rl.close();
  
  try {
    // Sign in with user credentials
    console.log('🔄 Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Authentication successful!');
    console.log('   User ID:', user.uid);
    console.log('   Email:', user.email);
    
    // Fix permissions
    await fixUserPermissions(user.uid, user.email);
    
  } catch (error) {
    console.error('\n❌ Authentication failed:', error.code, error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 User not found. Please check your email address.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Wrong password. Please check your password.');
    } else if (error.code === 'auth/invalid-credential') {
      console.log('💡 Invalid credentials. Please check your email and password.');
    }
  }
  
  process.exit(0);
}

// Run the fix
main().catch(console.error);

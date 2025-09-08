#!/usr/bin/env node

/**
 * User Permission Fix Script for dekr-nextgen
 * 
 * This script fixes common permission issues by:
 * 1. Creating missing user documents
 * 2. Setting up proper user permissions
 * 3. Testing all Firebase operations
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

async function fixUserPermissions() {
  console.log('🔧 User Permission Fix Script for dekr-nextgen\n');
  
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
    
    // Check if user document exists
    console.log('\n🔍 Checking user document...');
    let userDoc;
    try {
      userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        console.log('❌ User document does not exist - creating it...');
        await createUserProfile(user.uid, user.email, user.displayName);
      } else {
        console.log('✅ User document already exists');
      }
    } catch (error) {
      console.log('⚠️ Cannot check user document due to permission error');
      console.log('   This is expected for new users - creating user document...');
      await createUserProfile(user.uid, user.email, user.displayName);
    }
    
    // Test all permissions
    console.log('\n🧪 Testing all permissions...');
    const results = await testUserPermissions(user.uid);
    
    // Summary
    console.log('\n📋 Permission Test Results:');
    console.log('============================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
    }
    
    if (successful === results.length) {
      console.log('\n🎉 All permissions are working correctly!');
      console.log('   Your permission denied errors should be resolved.');
    } else {
      console.log('\n⚠️ Some permissions are still failing.');
      console.log('   This may indicate issues with Firestore security rules.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.code, error.message);
    
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
fixUserPermissions().catch(console.error);

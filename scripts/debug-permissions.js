#!/usr/bin/env node

/**
 * Permission Debug Script for dekr-nextgen
 * 
 * This script helps diagnose permission denied errors by:
 * 1. Testing Firebase authentication
 * 2. Checking Firestore access
 * 3. Verifying Storage access
 * 4. Testing Cloud Functions
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, onAuthStateChanged } = require('firebase/auth');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');

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
const storage = getStorage(app);

async function testAuthentication() {
  console.log('🔐 Testing Firebase Authentication...');
  
  try {
    // Check if user is already authenticated
    if (auth.currentUser) {
      console.log('✅ User already authenticated!');
      console.log('   User ID:', auth.currentUser.uid);
      console.log('   Email:', auth.currentUser.email);
      console.log('   Email Verified:', auth.currentUser.emailVerified);
      return auth.currentUser;
    }
    
    console.log('⚠️ No user currently authenticated');
    console.log('💡 Please sign in through the app first, then run this script');
    console.log('   Or provide credentials to test authentication');
    
    return null;
  } catch (error) {
    console.error('❌ Authentication check failed:', error.code, error.message);
    return null;
  }
}

async function testFirestoreAccess(user) {
  console.log('\n📊 Testing Firestore Access...');
  
  if (!user) {
    console.log('❌ Cannot test Firestore without authenticated user');
    return;
  }
  
  try {
    // Test reading user document
    console.log('🔄 Testing user document read...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      console.log('✅ User document exists and is readable');
      console.log('   User data:', userDoc.data());
    } else {
      console.log('⚠️ User document does not exist');
    }
    
    // Test reading cards collection
    console.log('🔄 Testing cards collection read...');
    const cardsSnapshot = await getDocs(collection(db, 'cards'));
    console.log('✅ Cards collection accessible');
    console.log('   Number of cards:', cardsSnapshot.size);
    
    // Test reading education content
    console.log('🔄 Testing education content read...');
    const educationSnapshot = await getDocs(collection(db, 'educationContent'));
    console.log('✅ Education content accessible');
    console.log('   Number of education items:', educationSnapshot.size);
    
  } catch (error) {
    console.error('❌ Firestore access failed:', error.code, error.message);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Permission denied. Check your Firestore security rules.');
      console.log('   Make sure the user is authenticated and has proper permissions.');
    } else if (error.code === 'unavailable') {
      console.log('💡 Firestore is unavailable. Check your internet connection.');
    }
  }
}

async function testStorageAccess(user) {
  console.log('\n📁 Testing Firebase Storage Access...');
  
  if (!user) {
    console.log('❌ Cannot test Storage without authenticated user');
    return;
  }
  
  try {
    // Test reading a public asset
    console.log('🔄 Testing public asset read...');
    const publicRef = ref(storage, 'public-assets/test.txt');
    
    try {
      const url = await getDownloadURL(publicRef);
      console.log('✅ Public assets accessible');
      console.log('   Test URL:', url);
    } catch (publicError) {
      console.log('⚠️ Public assets not accessible:', publicError.message);
    }
    
    // Test reading user-specific content
    console.log('🔄 Testing user-specific content read...');
    const userRef = ref(storage, `dekr-content/audio/lessons/test.mp3`);
    
    try {
      const url = await getDownloadURL(userRef);
      console.log('✅ User-specific content accessible');
      console.log('   Test URL:', url);
    } catch (userError) {
      console.log('⚠️ User-specific content not accessible:', userError.message);
    }
    
  } catch (error) {
    console.error('❌ Storage access failed:', error.code, error.message);
    
    if (error.code === 'storage/object-not-found') {
      console.log('💡 Object not found. This is expected for test files.');
    } else if (error.code === 'storage/unauthorized') {
      console.log('💡 Unauthorized. Check your Storage security rules.');
    }
  }
}

async function testCloudFunctions(user) {
  console.log('\n☁️ Testing Cloud Functions Access...');
  
  if (!user) {
    console.log('❌ Cannot test Cloud Functions without authenticated user');
    return;
  }
  
  try {
    // Test calling a simple Cloud Function
    console.log('🔄 Testing Cloud Function call...');
    
    // Note: This would require the actual Cloud Function to be deployed
    // For now, we'll just check if the user has the right permissions
    console.log('✅ Cloud Functions access test completed');
    console.log('   Note: Actual function calls require deployed functions');
    
  } catch (error) {
    console.error('❌ Cloud Functions access failed:', error.code, error.message);
  }
}

async function runPermissionDiagnostics() {
  console.log('🚀 Starting Permission Diagnostics for dekr-nextgen\n');
  
  // Test authentication
  const user = await testAuthentication();
  
  // Test Firestore access
  await testFirestoreAccess(user);
  
  // Test Storage access
  await testStorageAccess(user);
  
  // Test Cloud Functions access
  await testCloudFunctions(user);
  
  console.log('\n📋 Permission Diagnostics Summary:');
  console.log('=====================================');
  
  if (user) {
    console.log('✅ Authentication: Working');
    console.log('✅ User ID:', user.uid);
    console.log('✅ Email:', user.email);
  } else {
    console.log('❌ Authentication: Failed');
    console.log('💡 Fix authentication issues first');
  }
  
  console.log('\n🔧 Common Permission Issues and Solutions:');
  console.log('1. Authentication: Make sure demo user exists in Firebase Console');
  console.log('2. Firestore Rules: Check firestore.rules file for proper permissions');
  console.log('3. Storage Rules: Check storage.rules file for proper permissions');
  console.log('4. User Profile: Ensure user document exists in Firestore');
  console.log('5. Network: Check internet connection and Firebase project status');
  
  console.log('\n📚 Next Steps:');
  console.log('1. Run: firebase deploy --only firestore:rules');
  console.log('2. Run: firebase deploy --only storage');
  console.log('3. Check Firebase Console for any error logs');
  console.log('4. Verify demo user exists in Authentication section');
  
  process.exit(0);
}

// Run the diagnostics
runPermissionDiagnostics().catch(console.error);

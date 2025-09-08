#!/usr/bin/env node

/**
 * Debug Authentication Context
 * This will help us understand what's happening with the authenticated user
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

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

async function debugAuthContext() {
  console.log('🔍 Debugging Authentication Context\n');
  
  try {
    // Step 1: Sign in
    console.log('🔄 Step 1: Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, 'trackstack@gmail.com', 'password');
    const user = userCredential.user;
    
    console.log('✅ Authentication successful!');
    console.log('   User ID:', user.uid);
    console.log('   Email:', user.email);
    console.log('   Email Verified:', user.emailVerified);
    console.log('   Auth Token:', user.accessToken ? 'Present' : 'Missing');
    
    // Step 2: Check auth state
    console.log('\n🔄 Step 2: Checking auth state...');
    console.log('   Current User:', auth.currentUser ? auth.currentUser.uid : 'None');
    console.log('   Auth State:', auth.currentUser ? 'Authenticated' : 'Not authenticated');
    
    // Step 3: Try to read the document we created
    console.log('\n🔄 Step 3: Reading user document with auth...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    console.log('✅ User document read:', userDoc.exists() ? 'EXISTS' : 'DOES NOT EXIST');
    
    if (userDoc.exists()) {
      console.log('   Document data:', userDoc.data());
    }
    
    // Step 4: Try to update the document
    console.log('\n🔄 Step 4: Updating user document with auth...');
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: 'trackstack',
      createdAt: new Date(),
      isPublic: false,
      lastUpdated: new Date(),
      updatedBy: 'authenticated-user'
    });
    console.log('✅ User document updated successfully!');
    
    console.log('\n🎉 All authenticated operations working!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.code, error.message);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Permission denied with authenticated user');
      console.log('   This suggests there might be an issue with the auth context');
    }
  }
  
  process.exit(0);
}

debugAuthContext().catch(console.error);

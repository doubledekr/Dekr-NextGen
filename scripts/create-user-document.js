#!/usr/bin/env node

/**
 * User Document Creation Script
 * 
 * This script creates a user document in Firestore for authenticated users.
 * Run this with bootstrap rules deployed to allow document creation.
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

async function main() {
  console.log('🚀 User Document Creation Script for dekr-nextgen\n');
  console.log('📋 Make sure bootstrap rules are deployed before running this script!\n');
  
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
  
  const displayName = await new Promise((resolve) => {
    rl.question('Enter display name (optional): ', resolve);
  });
  
  rl.close();
  
  try {
    // Step 1: Sign in
    console.log('\n🔄 Step 1: Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Authentication successful!');
    console.log('   User ID:', user.uid);
    console.log('   Email:', user.email);
    
    // Step 2: Check if user document exists
    console.log('\n🔄 Step 2: Checking if user document exists...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      console.log('✅ User document already exists');
      console.log('   Document data:', userDoc.data());
    } else {
      console.log('📝 User document does not exist - creating it...');
      
      // Step 3: Create user document
      await createUserDocument(user.uid, user.email, displayName || null);
      
      // Step 4: Verify document was created
      console.log('\n🔄 Step 4: Verifying document creation...');
      const newUserDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (newUserDoc.exists()) {
        console.log('✅ User document created and verified!');
        console.log('   Document data:', newUserDoc.data());
      } else {
        console.log('❌ User document creation failed');
      }
    }
    
    console.log('\n🎉 User document setup complete!');
    console.log('   You can now switch back to secure rules.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.code, error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 User not found. Please check your email address.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Wrong password. Please check your password.');
    } else if (error.code === 'auth/invalid-credential') {
      console.log('💡 Invalid credentials. Please check your email and password.');
    } else if (error.code === 'permission-denied') {
      console.log('💡 Permission denied. Make sure bootstrap rules are deployed.');
      console.log('   Run: cp firestore.rules.bootstrap firestore.rules && firebase deploy --only firestore:rules');
    }
  }
  
  process.exit(0);
}

// Run the script
main().catch(console.error);

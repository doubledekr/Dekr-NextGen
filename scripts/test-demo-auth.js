#!/usr/bin/env node

/**
 * Script to test demo user authentication
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase config (same as in your app)
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

async function testDemoAuth() {
  try {
    console.log('🧪 Testing demo user authentication...');
    
    const demoEmail = 'trackstack@gmail.com';
    const demoPassword = 'password';
    
    console.log('📧 Email:', demoEmail);
    console.log('🔑 Password:', demoPassword);
    
    console.log('🔄 Attempting to sign in...');
    const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
    
    console.log('✅ Authentication successful!');
    console.log('👤 User ID:', userCredential.user.uid);
    console.log('📧 Email:', userCredential.user.email);
    console.log('📅 Email Verified:', userCredential.user.emailVerified);
    
    // Sign out
    await auth.signOut();
    console.log('👋 Signed out successfully');
    
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 The user does not exist. Please create the user in Firebase Console.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 The password is incorrect. Please check the password in Firebase Console.');
    } else if (error.code === 'auth/invalid-credential') {
      console.log('💡 The credentials are invalid. This could mean:');
      console.log('   - The user does not exist');
      console.log('   - The password is wrong');
      console.log('   - The user account is disabled');
    } else if (error.code === 'auth/too-many-requests') {
      console.log('💡 Too many failed attempts. Please try again later.');
    }
  } finally {
    process.exit(0);
  }
}

testDemoAuth();

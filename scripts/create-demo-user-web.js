#!/usr/bin/env node

/**
 * Script to create demo user using Firebase Web SDK
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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

async function createDemoUser() {
  try {
    console.log('🔄 Creating demo user...');
    
    const demoEmail = 'trackstack@gmail.com';
    const demoPassword = 'password';
    
    console.log('📧 Email:', demoEmail);
    console.log('🔑 Password:', demoPassword);
    
    console.log('🔄 Creating user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
    
    console.log('✅ Demo user created successfully!');
    console.log('👤 User ID:', userCredential.user.uid);
    console.log('📧 Email:', userCredential.user.email);
    console.log('📅 Email Verified:', userCredential.user.emailVerified);
    
    console.log('🎉 Demo user is ready to use!');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('💡 The email is already in use. The user might already exist.');
      console.log('🔄 Trying to sign in with existing credentials...');
      
      // Try to sign in with the existing user
      const { signInWithEmailAndPassword } = require('firebase/auth');
      try {
        const signInResult = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
        console.log('✅ Sign in successful with existing user!');
        console.log('👤 User ID:', signInResult.user.uid);
      } catch (signInError) {
        console.error('❌ Sign in failed:', signInError.message);
        console.log('💡 The password might be wrong. Please check the password in Firebase Console.');
      }
    } else if (error.code === 'auth/weak-password') {
      console.log('💡 The password is too weak. Please use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 The email address is invalid.');
    }
  } finally {
    process.exit(0);
  }
}

createDemoUser();

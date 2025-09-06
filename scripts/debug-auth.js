#!/usr/bin/env node

/**
 * Script to debug authentication and check user ID
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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
const db = getFirestore(app);

async function debugAuth() {
  try {
    console.log('🔐 Authenticating as demo user...');
    
    // Sign in as demo user
    const demoEmail = 'trackstack@gmail.com';
    const demoPassword = 'password';
    
    const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
    console.log('✅ Authenticated as:', userCredential.user.email);
    console.log('✅ User ID:', userCredential.user.uid);
    console.log('✅ User display name:', userCredential.user.displayName);
    console.log('✅ User email verified:', userCredential.user.emailVerified);
    
    // Try to write a simple test document
    console.log('🧪 Testing write permissions...');
    
    const testDoc = {
      test: true,
      userId: userCredential.user.uid,
      email: userCredential.user.email,
      timestamp: serverTimestamp(),
      message: 'Test document to check permissions'
    };
    
    try {
      const docRef = await addDoc(collection(db, 'test'), testDoc);
      console.log('✅ Successfully wrote test document:', docRef.id);
      
      // Clean up
      await docRef.delete();
      console.log('✅ Cleaned up test document');
    } catch (error) {
      console.error('❌ Failed to write test document:', error);
    }
    
    // Try to write to cards collection
    console.log('🧪 Testing cards collection write...');
    
    const testCard = {
      id: 'test-card-123',
      type: 'lesson',
      title: 'Test Card',
      description: 'This is a test card',
      priority: 50,
      tags: ['test'],
      engagement: { views: 0, saves: 0, shares: 0 },
      createdAt: serverTimestamp()
    };
    
    try {
      const cardRef = await addDoc(collection(db, 'cards'), testCard);
      console.log('✅ Successfully wrote test card:', cardRef.id);
      
      // Clean up
      await cardRef.delete();
      console.log('✅ Cleaned up test card');
    } catch (error) {
      console.error('❌ Failed to write test card:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error in debug auth:', error);
  } finally {
    process.exit(0);
  }
}

debugAuth();

#!/usr/bin/env node

/**
 * Simple Firebase Test Script
 * Tests basic Firebase operations with current rules
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

async function simpleTest() {
  console.log('🧪 Simple Firebase Test\n');
  
  try {
    // Test 1: Sign in
    console.log('🔄 Test 1: Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, 'trackstack@gmail.com', 'password');
    console.log('✅ Sign in successful:', userCredential.user.uid);
    
    // Test 2: Try to read a document
    console.log('\n🔄 Test 2: Reading user document...');
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    console.log('✅ User document read:', userDoc.exists() ? 'EXISTS' : 'DOES NOT EXIST');
    
    // Test 3: Try to create a document
    console.log('\n🔄 Test 3: Creating user document...');
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: 'trackstack',
      createdAt: new Date(),
      isPublic: false
    });
    console.log('✅ User document created successfully!');
    
    // Test 4: Try to read cards collection
    console.log('\n🔄 Test 4: Reading cards collection...');
    const cardsSnapshot = await getDocs(collection(db, 'cards'));
    console.log('✅ Cards collection read:', cardsSnapshot.size, 'documents');
    
    console.log('\n🎉 All tests passed! Your app should work now.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.code, error.message);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Permission denied - rules may not be fully deployed yet');
    }
  }
  
  process.exit(0);
}

simpleTest().catch(console.error);

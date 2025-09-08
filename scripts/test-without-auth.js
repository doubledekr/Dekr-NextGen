#!/usr/bin/env node

/**
 * Test Firebase without authentication
 * This will help us determine if the issue is with auth or rules
 */

const { initializeApp } = require('firebase/app');
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
const db = getFirestore(app);

async function testWithoutAuth() {
  console.log('🧪 Testing Firebase without authentication\n');
  
  try {
    // Test 1: Try to read a document without auth
    console.log('🔄 Test 1: Reading user document without auth...');
    const userDoc = await getDoc(doc(db, 'users', 'jlCeTPWN9aPjX1HX1FJeAmHScA33'));
    console.log('✅ User document read:', userDoc.exists() ? 'EXISTS' : 'DOES NOT EXIST');
    
    // Test 2: Try to create a document without auth
    console.log('\n🔄 Test 2: Creating user document without auth...');
    await setDoc(doc(db, 'users', 'jlCeTPWN9aPjX1HX1FJeAmHScA33'), {
      uid: 'jlCeTPWN9aPjX1HX1FJeAmHScA33',
      email: 'trackstack@gmail.com',
      displayName: 'trackstack',
      createdAt: new Date(),
      isPublic: false,
      testField: 'created without auth'
    });
    console.log('✅ User document created successfully!');
    
    // Test 3: Try to read cards collection without auth
    console.log('\n🔄 Test 3: Reading cards collection without auth...');
    const cardsSnapshot = await getDocs(collection(db, 'cards'));
    console.log('✅ Cards collection read:', cardsSnapshot.size, 'documents');
    
    console.log('\n🎉 All tests passed! Rules are working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.code, error.message);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Permission denied - the rules are not working as expected');
      console.log('   This suggests the rules may not have propagated yet');
      console.log('   Or there might be a different issue');
    }
  }
  
  process.exit(0);
}

testWithoutAuth().catch(console.error);

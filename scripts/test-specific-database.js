#!/usr/bin/env node

/**
 * Test with specific database
 * This will help us determine which database the app is using
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

// Try both databases
const db1 = getFirestore(app); // Default database
const db2 = getFirestore(app, 'default'); // Named database

async function testSpecificDatabase() {
  console.log('🧪 Testing with specific databases\n');
  
  try {
    // Sign in
    console.log('🔄 Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, 'trackstack@gmail.com', 'password');
    const user = userCredential.user;
    console.log('✅ Authentication successful:', user.uid);
    
    // Test database 1 (default)
    console.log('\n🔄 Testing database 1 (default)...');
    try {
      const userDoc1 = await getDoc(doc(db1, 'users', user.uid));
      console.log('✅ Database 1 - User document:', userDoc1.exists() ? 'EXISTS' : 'DOES NOT EXIST');
      
      if (!userDoc1.exists()) {
        await setDoc(doc(db1, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: 'trackstack',
          createdAt: new Date(),
          database: 'default'
        });
        console.log('✅ Database 1 - User document created');
      }
    } catch (error) {
      console.log('❌ Database 1 - Error:', error.code, error.message);
    }
    
    // Test database 2 (named "default")
    console.log('\n🔄 Testing database 2 (named "default")...');
    try {
      const userDoc2 = await getDoc(doc(db2, 'users', user.uid));
      console.log('✅ Database 2 - User document:', userDoc2.exists() ? 'EXISTS' : 'DOES NOT EXIST');
      
      if (!userDoc2.exists()) {
        await setDoc(doc(db2, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: 'trackstack',
          createdAt: new Date(),
          database: 'named-default'
        });
        console.log('✅ Database 2 - User document created');
      }
    } catch (error) {
      console.log('❌ Database 2 - Error:', error.code, error.message);
    }
    
    console.log('\n🎉 Database testing complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.code, error.message);
  }
  
  process.exit(0);
}

testSpecificDatabase().catch(console.error);

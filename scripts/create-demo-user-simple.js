#!/usr/bin/env node

/**
 * Simple script to create a demo user in Firebase Auth
 * Run this if the demo user doesn't exist in Firebase Console
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../requirement_files/alpha-orbit-5fa37f0155c7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'dekr-nextgen'
});

async function createDemoUser() {
  try {
    console.log('🔄 Creating demo user...');
    
    const demoEmail = 'trackstack@gmail.com';
    const demoPassword = 'password';
    
    // Check if user already exists
    try {
      const existingUser = await admin.auth().getUserByEmail(demoEmail);
      console.log('✅ Demo user already exists:', existingUser.uid);
      return;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('🔄 User not found, creating new user...');
      } else {
        throw error;
      }
    }
    
    // Create the demo user
    const userRecord = await admin.auth().createUser({
      email: demoEmail,
      password: demoPassword,
      displayName: 'Demo User',
      emailVerified: true
    });
    
    console.log('✅ Demo user created successfully!');
    console.log('📧 Email:', demoEmail);
    console.log('🔑 Password:', demoPassword);
    console.log('🆔 UID:', userRecord.uid);
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    process.exit(0);
  }
}

createDemoUser();

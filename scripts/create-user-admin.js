#!/usr/bin/env node

/**
 * Admin User Document Creation Script
 * 
 * This script uses Firebase Admin SDK to create user documents
 * It bypasses Firestore security rules since it runs with admin privileges
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Try to use service account key if available
    const serviceAccount = require('../requirement_files/alpha-orbit-5fa37f0155c7.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'dekr-nextgen'
    });
    console.log('✅ Initialized with service account');
  } catch (error) {
    console.log('⚠️ Service account not found, using default credentials');
    // Use default credentials (Firebase CLI authentication)
    admin.initializeApp({
      projectId: 'dekr-nextgen'
    });
  }
}

const db = admin.firestore();

async function createUserDocument(userId, email, displayName = null) {
  console.log(`📝 Creating user document for: ${userId}`);
  
  const userData = {
    uid: userId,
    email: email,
    displayName: displayName || email.split('@')[0],
    isPublic: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
    await db.collection('users').doc(userId).set(userData);
    console.log('✅ User document created successfully');
    return userData;
  } catch (error) {
    console.error('❌ Error creating user document:', error.message);
    throw error;
  }
}

async function verifyUserDocument(userId) {
  console.log(`🔍 Verifying user document for: ${userId}`);
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      console.log('✅ User document exists and is readable');
      console.log('   Document data:', userDoc.data());
      return true;
    } else {
      console.log('❌ User document does not exist');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying user document:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Admin User Document Creation Script for dekr-nextgen\n');
  console.log('🔧 This script uses admin privileges to bypass security rules\n');
  
  try {
    // Use the known user details
    const finalUserId = 'jlCeTPWN9aPjX1HX1FJeAmHScA33';
    const finalEmail = 'trackstack@gmail.com';
    const finalDisplayName = 'trackstack';
    
    console.log(`\n🔄 Creating user document for:`);
    console.log(`   User ID: ${finalUserId}`);
    console.log(`   Email: ${finalEmail}`);
    console.log(`   Display Name: ${finalDisplayName}`);
    
    // Check if document already exists
    const exists = await verifyUserDocument(finalUserId);
    
    if (!exists) {
      // Create the user document
      await createUserDocument(finalUserId, finalEmail, finalDisplayName);
      
      // Verify it was created
      await verifyUserDocument(finalUserId);
    }
    
    console.log('\n🎉 User document setup complete!');
    console.log('   You can now switch back to secure rules.');
    console.log('   Run: cp firestore.rules.fixed firestore.rules && firebase deploy --only firestore:rules');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('💡 Permission error. Make sure you have Firebase CLI authenticated:');
      console.log('   Run: firebase login');
    }
  }
  
  process.exit(0);
}

// Run the script
main().catch(console.error);
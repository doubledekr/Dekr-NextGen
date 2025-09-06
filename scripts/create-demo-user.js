#!/usr/bin/env node

/**
 * Script to create demo user account in Firebase Auth
 * This ensures the demo user exists with proper credentials
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../requirement_files/alpha-orbit-5fa37f0155c7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'dekr-nextgen'
});

const auth = admin.auth();
const firestore = admin.firestore();

async function createDemoUser() {
  try {
    console.log('🔄 Creating demo user account...');
    
    const demoEmail = 'demo@dekr.app';
    const demoPassword = 'DemoUser123!';
    const demoUid = 'demo-user-123';
    
    // Check if demo user already exists
    try {
      const existingUser = await auth.getUser(demoUid);
      console.log('✅ Demo user already exists:', existingUser.email);
      
      // Update password to ensure it's correct
      await auth.updateUser(demoUid, {
        password: demoPassword,
        displayName: 'Demo User',
        emailVerified: true
      });
      console.log('✅ Demo user password updated');
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new demo user
        const userRecord = await auth.createUser({
          uid: demoUid,
          email: demoEmail,
          password: demoPassword,
          displayName: 'Demo User',
          emailVerified: true
        });
        console.log('✅ Demo user created:', userRecord.uid);
      } else {
        throw error;
      }
    }
    
    // Create demo user profile in Firestore
    const userRef = firestore.collection('users').doc(demoUid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      await userRef.set({
        uid: demoUid,
        email: demoEmail,
        displayName: 'Demo User',
        avatarUrl: '',
        joinDate: admin.firestore.FieldValue.serverTimestamp(),
        isPublic: false,
        currentStage: 1,
        xp: 0,
        stats: {
          weeklyGainPercent: 0,
          competitionsWon: 0,
          lessonsCompleted: 0
        },
        settings: {
          pushNotifications: true,
          emailNotifications: true,
          theme: 'auto'
        }
      });
      console.log('✅ Demo user profile created in Firestore');
    } else {
      console.log('✅ Demo user profile already exists in Firestore');
    }
    
    console.log('🎉 Demo user setup complete!');
    console.log('📧 Email:', demoEmail);
    console.log('🔑 Password:', demoPassword);
    console.log('🆔 UID:', demoUid);
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    process.exit(1);
  }
}

// Run the script
createDemoUser()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

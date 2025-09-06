#!/usr/bin/env node

/**
 * Script to create a real demo user account in Firebase Auth
 * This creates a proper authenticated user that can access all features
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

async function setupDemoUser() {
  try {
    console.log('🔄 Setting up real demo user account...');
    
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
    
    // Create some sample cards for the demo user to see
    await createSampleCards();
    
    console.log('🎉 Demo user setup complete!');
    console.log('📧 Email:', demoEmail);
    console.log('🔑 Password:', demoPassword);
    console.log('🆔 UID:', demoUid);
    
  } catch (error) {
    console.error('❌ Error setting up demo user:', error);
    process.exit(1);
  }
}

async function createSampleCards() {
  try {
    console.log('🔄 Creating sample cards...');
    
    const sampleCards = [
      {
        id: 'demo-lesson-1',
        type: 'lesson',
        title: 'Introduction to Stock Market Basics',
        description: 'Learn the fundamentals of how the stock market works, including key concepts like stocks, bonds, and market indices.',
        priority: 90,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          duration: '5 minutes',
          difficulty: 'beginner',
          category: 'education'
        },
        tags: ['stocks', 'beginner', 'education'],
        engagement: { views: 1250, saves: 89, shares: 23 }
      },
      {
        id: 'demo-news-1',
        type: 'news',
        title: 'Market Update: Tech Stocks Rally',
        description: 'Latest news on technology stock performance and market trends.',
        priority: 85,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          source: 'Financial Times',
          category: 'market-news'
        },
        tags: ['tech', 'stocks', 'news'],
        engagement: { views: 980, saves: 67, shares: 18 }
      },
      {
        id: 'demo-lesson-2',
        type: 'lesson',
        title: 'Understanding Market Volatility',
        description: 'Explore what causes market volatility and how to navigate uncertain market conditions.',
        priority: 80,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          duration: '8 minutes',
          difficulty: 'intermediate',
          category: 'education'
        },
        tags: ['volatility', 'intermediate', 'market-analysis'],
        engagement: { views: 750, saves: 45, shares: 12 }
      },
      {
        id: 'demo-stock-1',
        type: 'stock',
        title: 'Apple Inc. (AAPL) Analysis',
        description: 'Current analysis and outlook for Apple stock performance.',
        priority: 75,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          symbol: 'AAPL',
          sector: 'Technology',
          category: 'stock-analysis'
        },
        tags: ['AAPL', 'apple', 'tech-stocks'],
        engagement: { views: 1200, saves: 95, shares: 25 }
      }
    ];
    
    const batch = firestore.batch();
    
    for (const card of sampleCards) {
      const cardRef = firestore.collection('cards').doc(card.id);
      batch.set(cardRef, card);
    }
    
    await batch.commit();
    console.log('✅ Sample cards created successfully!');
    console.log(`📊 Created ${sampleCards.length} cards`);
    
  } catch (error) {
    console.error('❌ Error creating sample cards:', error);
    // Don't fail the whole script if cards can't be created
  }
}

// Run the script
setupDemoUser()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

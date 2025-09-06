#!/usr/bin/env node

/**
 * Script to create sample cards in Firestore for testing
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../requirement_files/alpha-orbit-5fa37f0155c7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'dekr-nextgen'
});

const firestore = admin.firestore();

const sampleCards = [
  {
    id: 'card-1',
    type: 'lesson',
    title: 'Introduction to Stock Market',
    description: 'Learn the basics of how the stock market works',
    priority: 90,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: {
      duration: '5 minutes',
      difficulty: 'beginner',
      category: 'education'
    }
  },
  {
    id: 'card-2',
    type: 'news',
    title: 'Market Update: Tech Stocks Rally',
    description: 'Latest news on technology stock performance',
    priority: 85,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: {
      source: 'Financial Times',
      category: 'market-news'
    }
  },
  {
    id: 'card-3',
    type: 'lesson',
    title: 'Understanding Cryptocurrency',
    description: 'A beginner\'s guide to digital currencies',
    priority: 80,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: {
      duration: '8 minutes',
      difficulty: 'beginner',
      category: 'crypto'
    }
  },
  {
    id: 'card-4',
    type: 'news',
    title: 'Federal Reserve Interest Rate Decision',
    description: 'Analysis of the latest Fed policy changes',
    priority: 95,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: {
      source: 'Wall Street Journal',
      category: 'economic-news'
    }
  },
  {
    id: 'card-5',
    type: 'lesson',
    title: 'Portfolio Diversification Strategies',
    description: 'How to spread risk across different investments',
    priority: 75,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: {
      duration: '12 minutes',
      difficulty: 'intermediate',
      category: 'investment'
    }
  }
];

async function createSampleCards() {
  try {
    console.log('🔄 Creating sample cards...');
    
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
    process.exit(1);
  }
}

// Run the script
createSampleCards()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

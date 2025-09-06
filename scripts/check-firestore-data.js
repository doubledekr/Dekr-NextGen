#!/usr/bin/env node

/**
 * Script to check Firestore data and trigger card generation
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../requirement_files/alpha-orbit-5fa37f0155c7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'dekr-nextgen'
});

const db = admin.firestore();

async function checkFirestoreData() {
  try {
    console.log('🔍 Checking Firestore data...');
    
    // Check cards collection
    console.log('\n📋 Checking cards collection...');
    const cardsSnapshot = await db.collection('cards').limit(10).get();
    console.log(`Found ${cardsSnapshot.size} cards in database`);
    
    if (cardsSnapshot.size > 0) {
      console.log('\n📄 Sample cards:');
      cardsSnapshot.forEach((doc, index) => {
        if (index < 3) { // Show first 3 cards
          const data = doc.data();
          console.log(`- ${data.type}: ${data.title} (Priority: ${data.priority})`);
        }
      });
    } else {
      console.log('❌ No cards found in database');
    }
    
    // Check educationContent collection
    console.log('\n📚 Checking educationContent collection...');
    const educationSnapshot = await db.collection('educationContent').limit(5).get();
    console.log(`Found ${educationSnapshot.size} education content items`);
    
    // Check communityPodcasts collection
    console.log('\n🎧 Checking communityPodcasts collection...');
    const podcastsSnapshot = await db.collection('communityPodcasts').limit(5).get();
    console.log(`Found ${podcastsSnapshot.size} community podcasts`);
    
    // Check users collection
    console.log('\n👥 Checking users collection...');
    const usersSnapshot = await db.collection('users').limit(5).get();
    console.log(`Found ${usersSnapshot.size} users`);
    
    // If no cards exist, let's create some sample data
    if (cardsSnapshot.size === 0) {
      console.log('\n🔄 No cards found. Creating sample cards...');
      await createSampleCards();
    }
    
  } catch (error) {
    console.error('❌ Error checking Firestore data:', error);
  } finally {
    process.exit(0);
  }
}

async function createSampleCards() {
  try {
    const sampleCards = [
      {
        id: 'sample_lesson_1',
        type: 'lesson',
        title: 'Introduction to Stock Trading',
        description: 'Learn the basics of stock trading and market analysis',
        contentUrl: 'https://example.com/lesson1',
        imageUrl: 'https://example.com/lesson1-thumb.jpg',
        metadata: {
          stage: 1,
          difficulty: 'beginner',
          sector: 'general'
        },
        createdAt: admin.firestore.Timestamp.now(),
        priority: 85,
        tags: ['trading', 'stocks', 'beginner'],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        }
      },
      {
        id: 'sample_podcast_1',
        type: 'podcast',
        title: 'Weekly Market Update',
        description: 'This week\'s market analysis and trading insights',
        contentUrl: 'https://example.com/podcast1.mp3',
        imageUrl: 'https://example.com/podcast1-thumb.jpg',
        metadata: {
          weekNumber: '1'
        },
        createdAt: admin.firestore.Timestamp.now(),
        priority: 75,
        tags: ['podcast', 'market', 'weekly'],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        }
      },
      {
        id: 'sample_news_1',
        type: 'news',
        title: 'Tech Stocks Rally on AI News',
        description: 'Major tech companies see gains following AI breakthrough announcements',
        contentUrl: 'https://example.com/news1',
        imageUrl: 'https://example.com/news1-thumb.jpg',
        metadata: {
          symbol: 'AAPL',
          sector: 'technology'
        },
        createdAt: admin.firestore.Timestamp.now(),
        priority: 90,
        tags: ['news', 'tech', 'AI'],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        }
      }
    ];
    
    for (const card of sampleCards) {
      await db.collection('cards').doc(card.id).set(card);
      console.log(`✅ Created sample card: ${card.title}`);
    }
    
    console.log('🎉 Sample cards created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample cards:', error);
  }
}

checkFirestoreData();

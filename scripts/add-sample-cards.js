#!/usr/bin/env node

/**
 * Script to add sample cards to Firestore using client-side Firebase
 */

const { initializeApp } = require('firebase/app');
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
const db = getFirestore(app);

async function addSampleCards() {
  try {
    console.log('🔄 Adding sample cards to Firestore...');
    
    const sampleCards = [
      {
        type: 'lesson',
        title: 'Introduction to Stock Trading',
        description: 'Learn the basics of stock trading and market analysis. Perfect for beginners who want to understand how the stock market works.',
        contentUrl: 'https://example.com/lesson1',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        metadata: {
          stage: 1,
          difficulty: 'beginner',
          sector: 'general'
        },
        priority: 85,
        tags: ['trading', 'stocks', 'beginner', 'education'],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        },
        createdAt: serverTimestamp()
      },
      {
        type: 'podcast',
        title: 'Weekly Market Update - Tech Stocks Rally',
        description: 'This week\'s market analysis covering the latest tech stock movements and AI sector developments.',
        contentUrl: 'https://example.com/podcast1.mp3',
        imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
        metadata: {
          weekNumber: '1',
          duration: '25:30'
        },
        priority: 75,
        tags: ['podcast', 'market', 'weekly', 'tech'],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        },
        createdAt: serverTimestamp()
      },
      {
        type: 'news',
        title: 'Tech Stocks Rally on AI Breakthrough News',
        description: 'Major tech companies see significant gains following breakthrough announcements in artificial intelligence and machine learning.',
        contentUrl: 'https://example.com/news1',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        metadata: {
          symbol: 'AAPL',
          sector: 'technology',
          sentiment: 'positive'
        },
        priority: 90,
        tags: ['news', 'tech', 'AI', 'stocks'],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        },
        createdAt: serverTimestamp()
      },
      {
        type: 'crypto',
        title: 'Bitcoin Reaches New Monthly High',
        description: 'Bitcoin breaks through resistance levels as institutional adoption continues to grow.',
        contentUrl: 'https://example.com/crypto1',
        imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        metadata: {
          symbol: 'BTC',
          price: 45000,
          change: '+5.2%'
        },
        priority: 80,
        tags: ['crypto', 'bitcoin', 'price', 'analysis'],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        },
        createdAt: serverTimestamp()
      },
      {
        type: 'lesson',
        title: 'Understanding Market Volatility',
        description: 'Learn how to navigate market volatility and protect your investments during uncertain times.',
        contentUrl: 'https://example.com/lesson2',
        imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400',
        metadata: {
          stage: 2,
          difficulty: 'intermediate',
          sector: 'general'
        },
        priority: 70,
        tags: ['volatility', 'risk', 'intermediate', 'education'],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        },
        createdAt: serverTimestamp()
      }
    ];
    
    const cardsRef = collection(db, 'cards');
    
    for (const card of sampleCards) {
      try {
        const docRef = await addDoc(cardsRef, card);
        console.log(`✅ Added card: ${card.title} (ID: ${docRef.id})`);
      } catch (error) {
        console.error(`❌ Error adding card ${card.title}:`, error);
      }
    }
    
    console.log('🎉 Sample cards added successfully!');
    console.log('📱 Now try the demo button in your app - you should see real cards loading!');
    
  } catch (error) {
    console.error('❌ Error adding sample cards:', error);
  } finally {
    process.exit(0);
  }
}

addSampleCards();

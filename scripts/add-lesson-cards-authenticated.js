#!/usr/bin/env node

/**
 * Script to add lesson cards to Firestore using authenticated user
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
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
const auth = getAuth(app);
const db = getFirestore(app);

async function addLessonCards() {
  try {
    console.log('🔐 Authenticating as demo user...');
    
    // Sign in as demo user
    const demoEmail = 'trackstack@gmail.com';
    const demoPassword = 'password';
    
    const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
    console.log('✅ Authenticated as:', userCredential.user.email);
    
    console.log('📚 Adding lesson cards to Firestore...');
    
    // Load lessons data
    const lessonsData = require('../data/lessons.json');
    
    const cardsRef = collection(db, 'cards');
    let addedCount = 0;
    
    for (const stage of lessonsData) {
      console.log(`Processing Stage ${stage.id}: ${stage.title}`);
      
      for (const lesson of stage.lessons) {
        // Find audio content
        const audioContent = lesson.content.find(c => c.type === 'audio');
        const quizContent = lesson.content.find(c => c.type === 'multiple-choice');
        
        // Create lesson card
        const lessonCard = {
          id: `lesson-${stage.id}-${lesson.id}`,
          type: 'lesson',
          title: lesson.title,
          description: lesson.description,
          contentUrl: audioContent?.audioUrl || null,
          imageUrl: getLessonImageUrl(stage.id, lesson.id),
          metadata: {
            stage: stage.id,
            difficulty: getDifficultyFromStage(stage.id),
            duration: lesson.duration,
            xpReward: lesson.xpReward,
            hasAudio: !!audioContent,
            hasQuiz: !!quizContent,
            audioDuration: audioContent?.audioDuration || 0,
            transcript: audioContent?.transcript || null,
            quiz: quizContent ? {
              question: quizContent.question?.questionText || '',
              options: quizContent.question?.options || [],
              correctAnswer: quizContent.question?.correctAnswer || '',
              explanation: quizContent.question?.explanation || ''
            } : null
          },
          priority: calculateLessonPriority(stage.id, lesson.id),
          tags: generateLessonTags(stage.id, lesson),
          engagement: {
            views: 0,
            saves: 0,
            shares: 0
          },
          isLessonCard: true,
          dataSource: 'lessons-json',
          createdAt: serverTimestamp()
        };
        
        try {
          await addDoc(cardsRef, lessonCard);
          addedCount++;
          console.log(`  ✅ Added: ${lesson.title}`);
        } catch (error) {
          console.error(`  ❌ Error adding ${lesson.title}:`, error);
        }
      }
    }
    
    console.log(`\n🎉 Successfully added ${addedCount} lesson cards to Firestore!`);
    console.log('📱 Now try the demo button - you should see lesson cards in the feed!');
    
  } catch (error) {
    console.error('❌ Error adding lesson cards:', error);
  } finally {
    process.exit(0);
  }
}

// Helper functions
function getDifficultyFromStage(stageId) {
  if (stageId === 1) return 'beginner';
  if (stageId === 2) return 'intermediate';
  return 'advanced';
}

function calculateLessonPriority(stageId, lessonId) {
  let priority = 70; // Base priority for lessons
  
  // Higher priority for earlier stages (more fundamental)
  if (stageId === 1) priority += 20;
  else if (stageId === 2) priority += 10;
  
  // Higher priority for earlier lessons in each stage
  if (lessonId <= 3) priority += 10;
  else if (lessonId <= 6) priority += 5;
  
  return Math.min(100, priority);
}

function generateLessonTags(stageId, lesson) {
  const baseTags = ['lesson', 'education', 'learning'];
  
  // Add stage-specific tags
  if (stageId === 1) {
    baseTags.push('beginner', 'money-basics', 'financial-literacy');
  } else if (stageId === 2) {
    baseTags.push('intermediate', 'investing', 'wealth-building');
  }
  
  // Add lesson-specific tags based on title
  const title = lesson.title.toLowerCase();
  if (title.includes('money')) baseTags.push('money');
  if (title.includes('bank')) baseTags.push('banking');
  if (title.includes('saving') || title.includes('spending')) baseTags.push('budgeting');
  if (title.includes('credit') || title.includes('debt')) baseTags.push('credit');
  if (title.includes('budget')) baseTags.push('budgeting');
  if (title.includes('emergency')) baseTags.push('emergency-fund');
  if (title.includes('insurance')) baseTags.push('insurance');
  if (title.includes('goal')) baseTags.push('goal-setting');
  if (title.includes('invest')) baseTags.push('investing');
  if (title.includes('stock')) baseTags.push('stocks');
  if (title.includes('bond')) baseTags.push('bonds');
  if (title.includes('risk')) baseTags.push('risk-management');
  if (title.includes('diversif')) baseTags.push('diversification');
  if (title.includes('retirement')) baseTags.push('retirement');
  if (title.includes('tax')) baseTags.push('tax-planning');
  if (title.includes('real estate')) baseTags.push('real-estate');
  
  return [...new Set(baseTags)]; // Remove duplicates
}

function getLessonImageUrl(stageId, lessonId) {
  // Return appropriate images based on lesson content
  const imageMap = {
    // Stage 1 - Money Basics
    '1-1': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400', // Money
    '1-2': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', // Banking
    '1-3': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', // Saving/Spending
    '1-4': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400', // Credit
    '1-5': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', // Budgeting
    '1-6': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', // Emergency Fund
    '1-7': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', // Insurance
    '1-8': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400', // Goals
    
    // Stage 2 - Investing
    '2-1': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', // Investing
    '2-2': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400', // Time Value
    '2-3': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', // Risk/Reward
    '2-4': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', // Asset Classes
    '2-5': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400', // Inflation
    '2-6': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', // Diversification
    '2-7': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', // Stock Market
    '2-8': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400', // Dividends
    '2-9': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', // DCA
    '2-10': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', // Index vs Active
    '2-11': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400', // Retirement
    '2-12': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', // Tax Accounts
    '2-13': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', // Real Estate
    '2-14': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400', // International
    '2-15': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', // Alternatives
    '2-16': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', // Portfolio
  };
  
  const key = `${stageId}-${lessonId}`;
  return imageMap[key] || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400';
}

addLessonCards();

import { Platform } from 'react-native';
import { UnifiedCard } from './CardService';

export class LessonCardService {
  private db: any;

  constructor() {
    // Initialize Firestore
    if (Platform.OS === 'web') {
      const { getFirestore } = require('firebase/firestore');
      this.db = getFirestore();
    } else {
      const firestore = require('@react-native-firebase/firestore').default;
      this.db = firestore();
    }
  }

  /**
   * Convert lessons from JSON to UnifiedCard format and save to Firestore
   */
  async convertLessonsToCards(): Promise<UnifiedCard[]> {
    try {
      console.log('📚 Converting lessons from JSON to cards...');
      
      // Load lessons data
      const lessonsData = require('../data/lessons.json');
      
      const lessonCards: UnifiedCard[] = [];
      
      for (const stage of lessonsData) {
        for (const lesson of stage.lessons) {
          // Find audio content
          const audioContent = lesson.content.find((c: any) => c.type === 'audio');
          const textContent = lesson.content.find((c: any) => c.type === 'text');
          const quizContent = lesson.content.find((c: any) => c.type === 'multiple-choice');
          
          // Create lesson card
          const lessonCard: UnifiedCard = {
            id: `lesson-${stage.id}-${lesson.id}`,
            type: 'lesson',
            title: lesson.title,
            description: lesson.description,
            contentUrl: audioContent?.audioUrl || undefined,
            imageUrl: this.getLessonImageUrl(stage.id, lesson.id),
            metadata: {
              stage: stage.id,
              difficulty: this.getDifficultyFromStage(stage.id),
              duration: lesson.duration,
              xpReward: lesson.xpReward,
              hasAudio: !!audioContent,
              hasQuiz: !!quizContent,
              audioDuration: audioContent?.audioDuration || 0,
              transcript: audioContent?.transcript || undefined,
              quiz: quizContent ? {
                question: quizContent.question?.questionText || '',
                options: quizContent.question?.options || [],
                correctAnswer: quizContent.question?.correctAnswer || '',
                explanation: quizContent.question?.explanation || ''
              } : undefined
            },
            createdAt: new Date(),
            priority: this.calculateLessonPriority(stage.id, lesson.id),
            tags: this.generateLessonTags(stage.id, lesson),
            engagement: {
              views: 0,
              saves: 0,
              shares: 0
            }
          };
          
          lessonCards.push(lessonCard);
        }
      }
      
      console.log(`✅ Converted ${lessonCards.length} lessons to cards`);
      return lessonCards;
    } catch (error) {
      console.error('❌ Error converting lessons to cards:', error);
      return [];
    }
  }

  /**
   * Save lesson cards to Firestore
   */
  async saveLessonCardsToFirestore(cards: UnifiedCard[]): Promise<void> {
    try {
      console.log(`💾 Saving ${cards.length} lesson cards to Firestore...`);
      
      const batch = this.db.batch();
      
      for (const card of cards) {
        const cardRef = this.db.collection('cards').doc(card.id);
        batch.set(cardRef, {
          ...card,
          createdAt: this.db.FieldValue.serverTimestamp(),
          isLessonCard: true,
          dataSource: 'lessons-json'
        });
      }
      
      await batch.commit();
      console.log('✅ Lesson cards saved to Firestore successfully');
    } catch (error) {
      console.error('❌ Error saving lesson cards to Firestore:', error);
    }
  }

  /**
   * Generate and save lesson cards from JSON data
   */
  async generateAndSaveLessonCards(): Promise<UnifiedCard[]> {
    try {
      console.log('🔄 Generating and saving lesson cards from JSON...');
      
      const cards = await this.convertLessonsToCards();
      
      if (cards.length > 0) {
        await this.saveLessonCardsToFirestore(cards);
      }
      
      return cards;
    } catch (error) {
      console.error('❌ Error generating and saving lesson cards:', error);
      return [];
    }
  }

  /**
   * Get lesson cards from Firestore
   */
  async getLessonCardsFromFirestore(limit: number = 10): Promise<UnifiedCard[]> {
    try {
      console.log(`📚 Getting ${limit} lesson cards from Firestore...`);
      
      const snapshot = await this.db
        .collection('cards')
        .where('type', '==', 'lesson')
        .where('isLessonCard', '==', true)
        .orderBy('priority', 'desc')
        .limit(limit)
        .get();

      const cards = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      console.log(`✅ Found ${cards.length} lesson cards in Firestore`);
      return cards;
    } catch (error) {
      console.error('❌ Error getting lesson cards from Firestore:', error);
      return [];
    }
  }

  // Helper methods
  private getDifficultyFromStage(stageId: number): 'beginner' | 'intermediate' | 'advanced' {
    if (stageId === 1) return 'beginner';
    if (stageId === 2) return 'intermediate';
    return 'advanced';
  }

  private calculateLessonPriority(stageId: number, lessonId: number): number {
    let priority = 70; // Base priority for lessons
    
    // Higher priority for earlier stages (more fundamental)
    if (stageId === 1) priority += 20;
    else if (stageId === 2) priority += 10;
    
    // Higher priority for earlier lessons in each stage
    if (lessonId <= 3) priority += 10;
    else if (lessonId <= 6) priority += 5;
    
    return Math.min(100, priority);
  }

  private generateLessonTags(stageId: number, lesson: any): string[] {
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

  private getLessonImageUrl(stageId: number, lessonId: number): string {
    // Return appropriate images based on lesson content
    const imageMap: { [key: string]: string } = {
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
}

// Export singleton instance
export const lessonCardService = new LessonCardService();

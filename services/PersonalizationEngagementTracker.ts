// Personalization Engagement Tracker
// Tracks user engagement metrics for different personalization modes
import { Platform } from 'react-native';
import { logEvent, AnalyticsEvents } from './analytics';
import { communityFeedbackLoop } from './CommunityFeedbackLoop';

// Check if we're running in Expo Go (which doesn't support native Firebase modules)
const isExpoGo = typeof global.__expo !== 'undefined' && global.__expo?.modules?.ExpoGo;

// Dummy implementations for Expo Go
const dummyFirestore = {
  collection: () => ({
    doc: () => ({
      set: () => Promise.resolve(),
      get: () => Promise.resolve({ exists: false, data: () => null }),
      update: () => Promise.resolve(),
    }),
    add: () => Promise.resolve({ id: 'dummy' }),
  }),
};

export let firestore: any;

if (Platform.OS === 'web' || isExpoGo) {
  firestore = () => dummyFirestore;
  console.log('🔄 Using dummy Firebase services for PersonalizationEngagementTracker (Expo Go/Web mode)');
} else {
  try {
    const nativeFirestore = require('@react-native-firebase/firestore').default;
    firestore = nativeFirestore;
    console.log('✅ Using native Firebase services for PersonalizationEngagementTracker');
  } catch (error) {
    console.log('⚠️ Native Firebase not available for PersonalizationEngagementTracker, using dummy services');
    firestore = () => dummyFirestore;
  }
}

export interface PersonalizationEngagementMetrics {
  userId: string;
  mode: 'personalized' | 'general';
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  cardsViewed: number;
  cardsSwiped: number;
  cardsSaved: number;
  cardsShared: number;
  averageTimePerCard: number;
  engagementScore: number;
  satisfactionRating?: number;
  feedback?: string;
}

export interface PersonalizationComparison {
  userId: string;
  personalizedMetrics: PersonalizationEngagementMetrics;
  generalMetrics: PersonalizationEngagementMetrics;
  improvementPercentage: number;
  preferredMode: 'personalized' | 'general';
  confidence: number;
}

export class PersonalizationEngagementTracker {
  private db: any;
  private activeSessions: Map<string, PersonalizationEngagementMetrics> = new Map();

  constructor() {
    this.db = firestore();
  }

  // Start tracking a personalization session
  async startPersonalizationSession(
    userId: string, 
    mode: 'personalized' | 'general',
    sessionId: string
  ): Promise<void> {
    try {
      const session: PersonalizationEngagementMetrics = {
        userId,
        mode,
        sessionId,
        startTime: new Date(),
        cardsViewed: 0,
        cardsSwiped: 0,
        cardsSaved: 0,
        cardsShared: 0,
        averageTimePerCard: 0,
        engagementScore: 0,
      };

      this.activeSessions.set(sessionId, session);

      // Log session start
      await logEvent(AnalyticsEvents.START_SESSION, {
        userId,
        sessionId,
        personalizationMode: mode,
        timestamp: session.startTime.toISOString(),
      });

      console.log('📊 Started personalization session:', sessionId, 'Mode:', mode);
    } catch (error) {
      console.error('Error starting personalization session:', error);
    }
  }

  // Track card interaction
  async trackCardInteraction(
    sessionId: string,
    action: 'view' | 'swipe' | 'save' | 'share',
    cardId: string,
    timeSpent?: number
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      // Update session metrics
      switch (action) {
        case 'view':
          session.cardsViewed++;
          if (timeSpent) {
            session.averageTimePerCard = 
              (session.averageTimePerCard * (session.cardsViewed - 1) + timeSpent) / session.cardsViewed;
          }
          break;
        case 'swipe':
          session.cardsSwiped++;
          break;
        case 'save':
          session.cardsSaved++;
          break;
        case 'share':
          session.cardsShared++;
          break;
      }

      // Calculate engagement score
      session.engagementScore = this.calculateEngagementScore(session);

      // Log interaction
      await logEvent(AnalyticsEvents.TRACK_PERFORMANCE, {
        userId: session.userId,
        sessionId,
        action,
        cardId,
        timeSpent,
        personalizationMode: session.mode,
        engagementScore: session.engagementScore,
      });

      console.log('📊 Tracked card interaction:', action, 'Session:', sessionId, 'Score:', session.engagementScore);
    } catch (error) {
      console.error('Error tracking card interaction:', error);
    }
  }

  // End personalization session
  async endPersonalizationSession(
    sessionId: string,
    satisfactionRating?: number,
    feedback?: string
  ): Promise<PersonalizationEngagementMetrics | null> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return null;

      session.endTime = new Date();
      session.satisfactionRating = satisfactionRating;
      session.feedback = feedback;

      // Calculate final engagement score
      session.engagementScore = this.calculateEngagementScore(session);

      // Store session data
      await this.storeSessionData(session);

      // Collect community contribution data
      await this.collectCommunityContribution(session);

      // Log session end
      await logEvent(AnalyticsEvents.END_SESSION, {
        userId: session.userId,
        sessionId,
        personalizationMode: session.mode,
        duration: session.endTime.getTime() - session.startTime.getTime(),
        engagementScore: session.engagementScore,
        cardsViewed: session.cardsViewed,
        cardsSwiped: session.cardsSwiped,
        satisfactionRating,
      });

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      console.log('📊 Ended personalization session:', sessionId, 'Final score:', session.engagementScore);
      return session;
    } catch (error) {
      console.error('Error ending personalization session:', error);
      return null;
    }
  }

  // Compare personalization modes for a user
  async comparePersonalizationModes(userId: string): Promise<PersonalizationComparison | null> {
    try {
      const sessions = await this.getUserSessions(userId);
      
      if (sessions.length < 2) return null;

      // Separate sessions by mode
      const personalizedSessions = sessions.filter(s => s.mode === 'personalized');
      const generalSessions = sessions.filter(s => s.mode === 'general');

      if (personalizedSessions.length === 0 || generalSessions.length === 0) return null;

      // Calculate average metrics for each mode
      const personalizedAvg = this.calculateAverageMetrics(personalizedSessions);
      const generalAvg = this.calculateAverageMetrics(generalSessions);

      // Calculate improvement percentage
      const improvementPercentage = 
        ((personalizedAvg.engagementScore - generalAvg.engagementScore) / generalAvg.engagementScore) * 100;

      // Determine preferred mode
      const preferredMode = personalizedAvg.engagementScore > generalAvg.engagementScore ? 'personalized' : 'general';
      
      // Calculate confidence based on sample size and consistency
      const confidence = this.calculateConfidence(personalizedSessions, generalSessions);

      const comparison: PersonalizationComparison = {
        userId,
        personalizedMetrics: personalizedAvg,
        generalMetrics: generalAvg,
        improvementPercentage,
        preferredMode,
        confidence,
      };

      // Store comparison
      await this.storeComparison(comparison);

      console.log('📊 Personalization comparison for user:', userId, 'Preferred:', preferredMode, 'Improvement:', improvementPercentage.toFixed(1) + '%');
      return comparison;
    } catch (error) {
      console.error('Error comparing personalization modes:', error);
      return null;
    }
  }

  // Calculate engagement score based on various metrics
  private calculateEngagementScore(session: PersonalizationEngagementMetrics): number {
    const weights = {
      cardsViewed: 0.2,
      cardsSwiped: 0.3,
      cardsSaved: 0.3,
      cardsShared: 0.2,
    };

    const normalizedMetrics = {
      cardsViewed: Math.min(session.cardsViewed / 10, 1), // Normalize to 0-1
      cardsSwiped: Math.min(session.cardsSwiped / 5, 1),
      cardsSaved: Math.min(session.cardsSaved / 3, 1),
      cardsShared: Math.min(session.cardsShared / 2, 1),
    };

    return Object.entries(weights).reduce((score, [metric, weight]) => {
      return score + (normalizedMetrics[metric as keyof typeof normalizedMetrics] * weight);
    }, 0) * 100; // Scale to 0-100
  }

  // Calculate average metrics from multiple sessions
  private calculateAverageMetrics(sessions: PersonalizationEngagementMetrics[]): PersonalizationEngagementMetrics {
    const total = sessions.reduce((acc, session) => ({
      cardsViewed: acc.cardsViewed + session.cardsViewed,
      cardsSwiped: acc.cardsSwiped + session.cardsSwiped,
      cardsSaved: acc.cardsSaved + session.cardsSaved,
      cardsShared: acc.cardsShared + session.cardsShared,
      averageTimePerCard: acc.averageTimePerCard + session.averageTimePerCard,
      engagementScore: acc.engagementScore + session.engagementScore,
    }), {
      cardsViewed: 0,
      cardsSwiped: 0,
      cardsSaved: 0,
      cardsShared: 0,
      averageTimePerCard: 0,
      engagementScore: 0,
    });

    const count = sessions.length;
    return {
      ...sessions[0], // Copy base properties
      cardsViewed: total.cardsViewed / count,
      cardsSwiped: total.cardsSwiped / count,
      cardsSaved: total.cardsSaved / count,
      cardsShared: total.cardsShared / count,
      averageTimePerCard: total.averageTimePerCard / count,
      engagementScore: total.engagementScore / count,
    };
  }

  // Calculate confidence in comparison
  private calculateConfidence(
    personalizedSessions: PersonalizationEngagementMetrics[],
    generalSessions: PersonalizationEngagementMetrics[]
  ): number {
    const sampleSize = Math.min(personalizedSessions.length, generalSessions.length);
    const consistency = this.calculateConsistency([...personalizedSessions, ...generalSessions]);
    
    // Confidence based on sample size and consistency
    return Math.min(0.5 + (sampleSize * 0.1) + (consistency * 0.3), 1.0);
  }

  // Calculate consistency of engagement scores
  private calculateConsistency(sessions: PersonalizationEngagementMetrics[]): number {
    if (sessions.length < 2) return 0;
    
    const scores = sessions.map(s => s.engagementScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    return Math.max(0, 1 - (standardDeviation / 50)); // Normalize to 0-1
  }

  // Store session data
  private async storeSessionData(session: PersonalizationEngagementMetrics): Promise<void> {
    try {
      await this.db.collection('personalization_sessions').add(session);
    } catch (error) {
      console.error('Error storing session data:', error);
    }
  }

  // Get user sessions
  private async getUserSessions(userId: string): Promise<PersonalizationEngagementMetrics[]> {
    try {
      const snapshot = await this.db.collection('personalization_sessions')
        .where('userId', '==', userId)
        .orderBy('startTime', 'desc')
        .limit(50)
        .get();

      return snapshot.docs.map(doc => doc.data() as PersonalizationEngagementMetrics);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Store comparison data
  private async storeComparison(comparison: PersonalizationComparison): Promise<void> {
    try {
      await this.db.collection('personalization_comparisons').doc(comparison.userId).set(comparison);
    } catch (error) {
      console.error('Error storing comparison data:', error);
    }
  }

  // Collect community contribution data from session
  private async collectCommunityContribution(session: PersonalizationEngagementMetrics): Promise<void> {
    try {
      // Get user preferences (this would be fetched from user profile in real implementation)
      const userPreferences = {
        assetTypes: ['stock', 'crypto', 'news'], // Placeholder
        sectors: ['technology', 'finance'], // Placeholder
        riskTolerance: 'medium' as const,
        experienceLevel: 'intermediate' as const,
      };

      // Create sentiment contributions based on session data
      const sentimentContributions = [];
      
      // If user had high engagement, infer positive sentiment
      if (session.engagementScore > 0.7) {
        sentimentContributions.push({
          assetSymbol: 'COMMUNITY_ENGAGEMENT',
          sentiment: 'positive' as const,
          confidence: session.engagementScore,
          timestamp: session.endTime || new Date(),
        });
      }

      // Collect community contribution
      await communityFeedbackLoop.collectUserContribution(session.userId, {
        interactions: {
          views: session.cardsViewed,
          saves: session.cardsSaved,
          shares: session.cardsShared,
          swipes: session.cardsSwiped,
          timeSpent: session.averageTimePerCard * session.cardsViewed,
        },
        preferences: userPreferences,
        sentimentContributions,
        personalizationMode: session.mode,
        sessionData: [{
          sessionId: session.sessionId,
          duration: session.endTime ? session.endTime.getTime() - session.startTime.getTime() : 0,
          engagementScore: session.engagementScore,
          satisfactionRating: session.satisfactionRating,
        }],
      });

      console.log('📊 Collected community contribution for session:', session.sessionId);
    } catch (error) {
      console.error('Error collecting community contribution:', error);
    }
  }
}

export const personalizationEngagementTracker = new PersonalizationEngagementTracker();

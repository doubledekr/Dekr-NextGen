// Community Feedback Loop System
// Aggregates community data for sentiment analysis and personalization insights
import { Platform } from 'react-native';
import { logEvent, AnalyticsEvents } from './analytics';

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
    where: () => ({
      orderBy: () => ({
        limit: () => ({
          get: () => Promise.resolve({ docs: [] }),
        }),
      }),
      get: () => Promise.resolve({ docs: [] }),
    }),
  }),
};

export let firestore: any;

if (Platform.OS === 'web' || isExpoGo) {
  firestore = () => dummyFirestore;
  console.log('🔄 Using dummy Firebase services for CommunityFeedbackLoop (Expo Go/Web mode)');
} else {
  try {
    const nativeFirestore = require('@react-native-firebase/firestore').default;
    firestore = nativeFirestore;
    console.log('✅ Using native Firebase services for CommunityFeedbackLoop');
  } catch (error) {
    console.log('⚠️ Native Firebase not available for CommunityFeedbackLoop, using dummy services');
    firestore = () => dummyFirestore;
  }
}

export interface CommunitySentimentData {
  assetSymbol: string;
  assetType: 'stock' | 'crypto' | 'news' | 'lesson' | 'podcast';
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // -1 to 1
  confidence: number; // 0 to 1
  totalInteractions: number;
  positiveInteractions: number;
  negativeInteractions: number;
  neutralInteractions: number;
  trendingDirection: 'up' | 'down' | 'stable';
  momentumScore: number; // Rate of change in sentiment
  communityEngagement: {
    views: number;
    saves: number;
    shares: number;
    comments: number;
  };
  demographicBreakdown: {
    byExperience: {
      beginner: { count: number; sentiment: number };
      intermediate: { count: number; sentiment: number };
      expert: { count: number; sentiment: number };
    };
    byAge: {
      under25: { count: number; sentiment: number };
      '25-35': { count: number; sentiment: number };
      '35-45': { count: number; sentiment: number };
      over45: { count: number; sentiment: number };
    };
  };
  timestamp: Date;
  lastUpdated: Date;
}

export interface PersonalizationInsight {
  insightType: 'trending' | 'emerging' | 'declining' | 'controversial' | 'consensus';
  category: string;
  description: string;
  confidence: number;
  supportingData: {
    userCount: number;
    interactionCount: number;
    sentimentScore: number;
    timeSpan: string;
  };
  recommendations: {
    forUsers: string[];
    forContent: string[];
    forStrategy: string[];
  };
  timestamp: Date;
}

export interface CommunityIntelligenceReport {
  reportId: string;
  generatedAt: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalUsers: number;
    totalInteractions: number;
    averageSentiment: number;
    topTrendingAssets: string[];
    emergingTrends: string[];
  };
  sentimentAnalysis: CommunitySentimentData[];
  personalizationInsights: PersonalizationInsight[];
  communityMetrics: {
    engagementRate: number;
    diversityScore: number;
    consensusLevel: number;
    volatilityIndex: number;
  };
  recommendations: {
    contentStrategy: string[];
    userExperience: string[];
    featureSuggestions: string[];
  };
}

export interface UserContribution {
  userId: string;
  interactions: {
    views: number;
    saves: number;
    shares: number;
    swipes: number;
    timeSpent: number;
  };
  preferences: {
    assetTypes: string[];
    sectors: string[];
    riskTolerance: 'low' | 'medium' | 'high';
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
  };
  sentimentContributions: {
    assetSymbol: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    timestamp: Date;
  }[];
  personalizationMode: 'personalized' | 'general';
  sessionData: {
    sessionId: string;
    duration: number;
    engagementScore: number;
    satisfactionRating?: number;
  }[];
}

export class CommunityFeedbackLoop {
  private db: any;
  private aggregationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.db = firestore();
    this.startPeriodicAggregation();
  }

  // Start periodic aggregation of community data
  private startPeriodicAggregation(): void {
    // Run aggregation every 15 minutes
    this.aggregationInterval = setInterval(async () => {
      try {
        await this.aggregateCommunityData();
        console.log('🔄 Community data aggregation completed');
      } catch (error) {
        console.error('Error in community data aggregation:', error);
      }
    }, 15 * 60 * 1000); // 15 minutes
  }

  // Stop periodic aggregation
  public stopAggregation(): void {
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
      this.aggregationInterval = null;
    }
  }

  // Collect user contribution data
  async collectUserContribution(userId: string, contribution: Partial<UserContribution>): Promise<void> {
    try {
      const userContribution: UserContribution = {
        userId,
        interactions: contribution.interactions || {
          views: 0,
          saves: 0,
          shares: 0,
          swipes: 0,
          timeSpent: 0,
        },
        preferences: contribution.preferences || {
          assetTypes: [],
          sectors: [],
          riskTolerance: 'medium',
          experienceLevel: 'intermediate',
        },
        sentimentContributions: contribution.sentimentContributions || [],
        personalizationMode: contribution.personalizationMode || 'personalized',
        sessionData: contribution.sessionData || [],
      };

      await this.db.collection('community_contributions').doc(userId).set(userContribution, { merge: true });

      // Log contribution collection
      await logEvent(AnalyticsEvents.TRACK_FEATURE_USAGE, {
        feature: 'community_contribution',
        userId,
        contributionType: Object.keys(contribution).join(','),
        timestamp: new Date().toISOString(),
      });

      console.log('📊 Collected user contribution for:', userId);
    } catch (error) {
      console.error('Error collecting user contribution:', error);
    }
  }

  // Aggregate community data for sentiment analysis
  async aggregateCommunityData(): Promise<CommunityIntelligenceReport> {
    try {
      const now = new Date();
      const timeRange = {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: now,
      };

      // Collect all user contributions from the last 24 hours
      const contributions = await this.getUserContributions(timeRange);
      
      // Analyze sentiment data
      const sentimentAnalysis = await this.analyzeCommunitySentiment(contributions);
      
      // Generate personalization insights
      const personalizationInsights = await this.generatePersonalizationInsights(contributions);
      
      // Calculate community metrics
      const communityMetrics = await this.calculateCommunityMetrics(contributions);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(sentimentAnalysis, personalizationInsights);

      const report: CommunityIntelligenceReport = {
        reportId: `report_${Date.now()}`,
        generatedAt: now,
        timeRange,
        summary: {
          totalUsers: contributions.length,
          totalInteractions: contributions.reduce((sum, c) => 
            sum + c.interactions.views + c.interactions.saves + c.interactions.shares, 0),
          averageSentiment: this.calculateAverageSentiment(sentimentAnalysis),
          topTrendingAssets: this.getTopTrendingAssets(sentimentAnalysis),
          emergingTrends: this.getEmergingTrends(personalizationInsights),
        },
        sentimentAnalysis,
        personalizationInsights,
        communityMetrics,
        recommendations,
      };

      // Store the report
      await this.storeIntelligenceReport(report);

      console.log('📊 Generated community intelligence report:', report.reportId);
      return report;
    } catch (error) {
      console.error('Error aggregating community data:', error);
      throw error;
    }
  }

  // Analyze community sentiment from user contributions
  private async analyzeCommunitySentiment(contributions: UserContribution[]): Promise<CommunitySentimentData[]> {
    const sentimentMap = new Map<string, CommunitySentimentData>();

    // Process each user's sentiment contributions
    for (const contribution of contributions) {
      for (const sentimentContribution of contribution.sentimentContributions) {
        const key = sentimentContribution.assetSymbol;
        
        if (!sentimentMap.has(key)) {
          sentimentMap.set(key, {
            assetSymbol: sentimentContribution.assetSymbol,
            assetType: this.inferAssetType(sentimentContribution.assetSymbol),
            overallSentiment: 'neutral',
            sentimentScore: 0,
            confidence: 0,
            totalInteractions: 0,
            positiveInteractions: 0,
            negativeInteractions: 0,
            neutralInteractions: 0,
            trendingDirection: 'stable',
            momentumScore: 0,
            communityEngagement: {
              views: 0,
              saves: 0,
              shares: 0,
              comments: 0,
            },
            demographicBreakdown: {
              byExperience: {
                beginner: { count: 0, sentiment: 0 },
                intermediate: { count: 0, sentiment: 0 },
                expert: { count: 0, sentiment: 0 },
              },
              byAge: {
                under25: { count: 0, sentiment: 0 },
                '25-35': { count: 0, sentiment: 0 },
                '35-45': { count: 0, sentiment: 0 },
                over45: { count: 0, sentiment: 0 },
              },
            },
            timestamp: new Date(),
            lastUpdated: new Date(),
          });
        }

        const sentimentData = sentimentMap.get(key)!;
        
        // Update sentiment counts
        sentimentData.totalInteractions++;
        switch (sentimentContribution.sentiment) {
          case 'positive':
            sentimentData.positiveInteractions++;
            break;
          case 'negative':
            sentimentData.negativeInteractions++;
            break;
          case 'neutral':
            sentimentData.neutralInteractions++;
            break;
        }

        // Update demographic breakdown
        const experienceLevel = contribution.preferences.experienceLevel;
        sentimentData.demographicBreakdown.byExperience[experienceLevel].count++;
        sentimentData.demographicBreakdown.byExperience[experienceLevel].sentiment += 
          this.sentimentToNumber(sentimentContribution.sentiment);
      }

      // Add interaction data
      for (const [symbol, sentimentData] of sentimentMap) {
        sentimentData.communityEngagement.views += contribution.interactions.views;
        sentimentData.communityEngagement.saves += contribution.interactions.saves;
        sentimentData.communityEngagement.shares += contribution.interactions.shares;
      }
    }

    // Calculate final sentiment scores and confidence
    for (const [symbol, sentimentData] of sentimentMap) {
      sentimentData.sentimentScore = this.calculateSentimentScore(sentimentData);
      sentimentData.overallSentiment = this.determineOverallSentiment(sentimentData.sentimentScore);
      sentimentData.confidence = this.calculateSentimentConfidence(sentimentData);
      sentimentData.momentumScore = this.calculateMomentumScore(sentimentData);
      sentimentData.trendingDirection = this.determineTrendingDirection(sentimentData.momentumScore);
    }

    return Array.from(sentimentMap.values());
  }

  // Generate personalization insights from community data
  private async generatePersonalizationInsights(contributions: UserContribution[]): Promise<PersonalizationInsight[]> {
    const insights: PersonalizationInsight[] = [];

    // Analyze personalization mode effectiveness
    const personalizedUsers = contributions.filter(c => c.personalizationMode === 'personalized');
    const generalUsers = contributions.filter(c => c.personalizationMode === 'general');

    if (personalizedUsers.length > 0 && generalUsers.length > 0) {
      const personalizedEngagement = this.calculateAverageEngagement(personalizedUsers);
      const generalEngagement = this.calculateAverageEngagement(generalUsers);
      
      const improvement = ((personalizedEngagement - generalEngagement) / generalEngagement) * 100;
      
      insights.push({
        insightType: 'consensus',
        category: 'personalization',
        description: `Personalized mode shows ${improvement.toFixed(1)}% higher engagement than general mode`,
        confidence: Math.min(0.9, personalizedUsers.length / 100),
        supportingData: {
          userCount: personalizedUsers.length,
          interactionCount: personalizedUsers.reduce((sum, c) => 
            sum + c.interactions.views + c.interactions.saves + c.interactions.shares, 0),
          sentimentScore: improvement / 100,
          timeSpan: '24h',
        },
        recommendations: {
          forUsers: ['Consider using personalized mode for better content relevance'],
          forContent: ['Focus on algorithmic personalization improvements'],
          forStrategy: ['Promote personalized mode to new users'],
        },
        timestamp: new Date(),
      });
    }

    // Analyze trending asset types
    const assetTypeEngagement = new Map<string, number>();
    contributions.forEach(contribution => {
      contribution.preferences.assetTypes.forEach(assetType => {
        const current = assetTypeEngagement.get(assetType) || 0;
        assetTypeEngagement.set(assetType, current + contribution.interactions.views);
      });
    });

    const sortedAssetTypes = Array.from(assetTypeEngagement.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    sortedAssetTypes.forEach(([assetType, engagement], index) => {
      insights.push({
        insightType: index === 0 ? 'trending' : 'emerging',
        category: 'content_preference',
        description: `${assetType} content is ${index === 0 ? 'trending' : 'gaining popularity'} with high community engagement`,
        confidence: Math.min(0.8, engagement / 1000),
        supportingData: {
          userCount: contributions.filter(c => c.preferences.assetTypes.includes(assetType)).length,
          interactionCount: engagement,
          sentimentScore: 0.7,
          timeSpan: '24h',
        },
        recommendations: {
          forUsers: [`Consider exploring more ${assetType} content`],
          forContent: [`Increase ${assetType} content production`],
          forStrategy: [`Feature ${assetType} content prominently`],
        },
        timestamp: new Date(),
      });
    });

    return insights;
  }

  // Calculate community metrics
  private async calculateCommunityMetrics(contributions: UserContribution[]): Promise<CommunityIntelligenceReport['communityMetrics']> {
    const totalInteractions = contributions.reduce((sum, c) => 
      sum + c.interactions.views + c.interactions.saves + c.interactions.shares, 0);
    
    const totalUsers = contributions.length;
    const engagementRate = totalUsers > 0 ? totalInteractions / totalUsers : 0;
    
    // Calculate diversity score based on asset type preferences
    const allAssetTypes = new Set<string>();
    contributions.forEach(c => c.preferences.assetTypes.forEach(type => allAssetTypes.add(type)));
    const diversityScore = allAssetTypes.size / 10; // Normalize to 0-1
    
    // Calculate consensus level based on sentiment consistency
    const consensusLevel = this.calculateConsensusLevel(contributions);
    
    // Calculate volatility index based on engagement variance
    const volatilityIndex = this.calculateVolatilityIndex(contributions);

    return {
      engagementRate,
      diversityScore: Math.min(1, diversityScore),
      consensusLevel,
      volatilityIndex,
    };
  }

  // Generate recommendations based on analysis
  private async generateRecommendations(
    sentimentAnalysis: CommunitySentimentData[],
    insights: PersonalizationInsight[]
  ): Promise<CommunityIntelligenceReport['recommendations']> {
    const contentStrategy: string[] = [];
    const userExperience: string[] = [];
    const featureSuggestions: string[] = [];

    // Content strategy recommendations
    const topSentimentAssets = sentimentAnalysis
      .filter(s => s.sentimentScore > 0.3)
      .sort((a, b) => b.sentimentScore - a.sentimentScore)
      .slice(0, 5);

    if (topSentimentAssets.length > 0) {
      contentStrategy.push(`Focus on ${topSentimentAssets.map(a => a.assetSymbol).join(', ')} content due to positive community sentiment`);
    }

    // User experience recommendations
    const personalizationInsight = insights.find(i => i.category === 'personalization');
    if (personalizationInsight) {
      userExperience.push('Promote personalized mode to improve user engagement');
    }

    // Feature suggestions
    const trendingInsights = insights.filter(i => i.insightType === 'trending');
    if (trendingInsights.length > 0) {
      featureSuggestions.push('Add trending content section to highlight popular assets');
    }

    return {
      contentStrategy,
      userExperience,
      featureSuggestions,
    };
  }

  // Helper methods
  private getUserContributions(timeRange: { start: Date; end: Date }): Promise<UserContribution[]> {
    // Implementation would query Firebase for user contributions in the time range
    return Promise.resolve([]);
  }

  private inferAssetType(symbol: string): 'stock' | 'crypto' | 'news' | 'lesson' | 'podcast' {
    // Simple heuristic - in real implementation, this would be more sophisticated
    if (symbol.length <= 4) return 'stock';
    if (symbol.includes('BTC') || symbol.includes('ETH')) return 'crypto';
    return 'stock';
  }

  private sentimentToNumber(sentiment: 'positive' | 'negative' | 'neutral'): number {
    switch (sentiment) {
      case 'positive': return 1;
      case 'negative': return -1;
      case 'neutral': return 0;
    }
  }

  private calculateSentimentScore(sentimentData: CommunitySentimentData): number {
    const total = sentimentData.totalInteractions;
    if (total === 0) return 0;
    
    const positiveWeight = sentimentData.positiveInteractions / total;
    const negativeWeight = sentimentData.negativeInteractions / total;
    
    return positiveWeight - negativeWeight; // Range: -1 to 1
  }

  private determineOverallSentiment(sentimentScore: number): 'bullish' | 'bearish' | 'neutral' {
    if (sentimentScore > 0.2) return 'bullish';
    if (sentimentScore < -0.2) return 'bearish';
    return 'neutral';
  }

  private calculateSentimentConfidence(sentimentData: CommunitySentimentData): number {
    // Higher confidence with more interactions
    return Math.min(1, sentimentData.totalInteractions / 100);
  }

  private calculateMomentumScore(sentimentData: CommunitySentimentData): number {
    // Simplified momentum calculation
    return sentimentData.sentimentScore * sentimentData.confidence;
  }

  private determineTrendingDirection(momentumScore: number): 'up' | 'down' | 'stable' {
    if (momentumScore > 0.1) return 'up';
    if (momentumScore < -0.1) return 'down';
    return 'stable';
  }

  private calculateAverageEngagement(contributions: UserContribution[]): number {
    if (contributions.length === 0) return 0;
    
    const totalEngagement = contributions.reduce((sum, c) => 
      sum + c.interactions.views + c.interactions.saves + c.interactions.shares, 0);
    
    return totalEngagement / contributions.length;
  }

  private calculateAverageSentiment(sentimentAnalysis: CommunitySentimentData[]): number {
    if (sentimentAnalysis.length === 0) return 0;
    
    const totalSentiment = sentimentAnalysis.reduce((sum, s) => sum + s.sentimentScore, 0);
    return totalSentiment / sentimentAnalysis.length;
  }

  private getTopTrendingAssets(sentimentAnalysis: CommunitySentimentData[]): string[] {
    return sentimentAnalysis
      .filter(s => s.trendingDirection === 'up')
      .sort((a, b) => b.momentumScore - a.momentumScore)
      .slice(0, 5)
      .map(s => s.assetSymbol);
  }

  private getEmergingTrends(insights: PersonalizationInsight[]): string[] {
    return insights
      .filter(i => i.insightType === 'emerging')
      .map(i => i.description);
  }

  private calculateConsensusLevel(contributions: UserContribution[]): number {
    // Simplified consensus calculation
    return 0.7; // Placeholder
  }

  private calculateVolatilityIndex(contributions: UserContribution[]): number {
    // Simplified volatility calculation
    return 0.3; // Placeholder
  }

  private storeIntelligenceReport(report: CommunityIntelligenceReport): Promise<void> {
    return this.db.collection('community_intelligence_reports').doc(report.reportId).set(report);
  }

  // Public methods for external access
  public async getLatestIntelligenceReport(): Promise<CommunityIntelligenceReport | null> {
    try {
      const snapshot = await this.db.collection('community_intelligence_reports')
        .orderBy('generatedAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      
      return snapshot.docs[0].data() as CommunityIntelligenceReport;
    } catch (error) {
      console.error('Error getting latest intelligence report:', error);
      return null;
    }
  }

  public async getCommunitySentiment(assetSymbol: string): Promise<CommunitySentimentData | null> {
    try {
      const report = await this.getLatestIntelligenceReport();
      if (!report) return null;
      
      return report.sentimentAnalysis.find(s => s.assetSymbol === assetSymbol) || null;
    } catch (error) {
      console.error('Error getting community sentiment:', error);
      return null;
    }
  }

  public async getPersonalizationInsights(): Promise<PersonalizationInsight[]> {
    try {
      const report = await this.getLatestIntelligenceReport();
      return report?.personalizationInsights || [];
    } catch (error) {
      console.error('Error getting personalization insights:', error);
      return [];
    }
  }
}

export const communityFeedbackLoop = new CommunityFeedbackLoop();

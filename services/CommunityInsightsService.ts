// Community Insights Service
// Provides community sentiment and insights to the UI
import { Platform } from 'react-native';
import { communityFeedbackLoop, CommunitySentimentData, PersonalizationInsight, CommunityIntelligenceReport } from './CommunityFeedbackLoop';

// Check if we're running in Expo Go (which doesn't support native Firebase modules)
const isExpoGo = typeof global.__expo !== 'undefined' && global.__expo?.modules?.ExpoGo;

export interface CommunityInsight {
  id: string;
  type: 'sentiment' | 'trending' | 'personalization' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  data: any;
  timestamp: Date;
}

export interface TrendingAsset {
  symbol: string;
  name: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  confidence: number;
  engagement: number;
  trendingDirection: 'up' | 'down' | 'stable';
  communityActivity: {
    views: number;
    saves: number;
    shares: number;
    discussions: number;
  };
  demographicInsights: {
    mostEngaged: string;
    sentimentByExperience: {
      beginner: number;
      intermediate: number;
      expert: number;
    };
  };
}

export interface PersonalizationEffectiveness {
  mode: 'personalized' | 'general';
  effectiveness: {
    engagementRate: number;
    satisfactionScore: number;
    retentionRate: number;
    conversionRate: number;
  };
  userPreferences: {
    mostEffectiveFor: string[];
    leastEffectiveFor: string[];
  };
  recommendations: string[];
}

export interface CommunityDashboard {
  summary: {
    totalUsers: number;
    activeUsers: number;
    totalInteractions: number;
    averageSentiment: number;
    topTrendingAssets: string[];
  };
  trendingAssets: TrendingAsset[];
  personalizationInsights: PersonalizationEffectiveness;
  communityInsights: CommunityInsight[];
  recommendations: {
    content: string[];
    features: string[];
    strategy: string[];
  };
  lastUpdated: Date;
}

export class CommunityInsightsService {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Get community dashboard data
  async getCommunityDashboard(): Promise<CommunityDashboard> {
    try {
      const cacheKey = 'community_dashboard';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const report = await communityFeedbackLoop.getLatestIntelligenceReport();
      if (!report) {
        return this.getDefaultDashboard();
      }

      const dashboard: CommunityDashboard = {
        summary: {
          totalUsers: report.summary.totalUsers,
          activeUsers: Math.floor(report.summary.totalUsers * 0.7), // Estimate active users
          totalInteractions: report.summary.totalInteractions,
          averageSentiment: report.summary.averageSentiment,
          topTrendingAssets: report.summary.topTrendingAssets,
        },
        trendingAssets: await this.processTrendingAssets(report.sentimentAnalysis),
        personalizationInsights: await this.processPersonalizationInsights(report.personalizationInsights),
        communityInsights: await this.processCommunityInsights(report),
        recommendations: report.recommendations,
        lastUpdated: report.generatedAt,
      };

      this.setCachedData(cacheKey, dashboard);
      return dashboard;
    } catch (error) {
      console.error('Error getting community dashboard:', error);
      return this.getDefaultDashboard();
    }
  }

  // Get trending assets with detailed insights
  async getTrendingAssets(limit: number = 10): Promise<TrendingAsset[]> {
    try {
      const cacheKey = `trending_assets_${limit}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const report = await communityFeedbackLoop.getLatestIntelligenceReport();
      if (!report) return [];

      const trendingAssets = await this.processTrendingAssets(report.sentimentAnalysis);
      const limitedAssets = trendingAssets.slice(0, limit);

      this.setCachedData(cacheKey, limitedAssets);
      return limitedAssets;
    } catch (error) {
      console.error('Error getting trending assets:', error);
      return [];
    }
  }

  // Get community sentiment for a specific asset
  async getAssetSentiment(assetSymbol: string): Promise<CommunitySentimentData | null> {
    try {
      const cacheKey = `asset_sentiment_${assetSymbol}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const sentiment = await communityFeedbackLoop.getCommunitySentiment(assetSymbol);
      if (sentiment) {
        this.setCachedData(cacheKey, sentiment);
      }
      return sentiment;
    } catch (error) {
      console.error('Error getting asset sentiment:', error);
      return null;
    }
  }

  // Get personalization effectiveness insights
  async getPersonalizationEffectiveness(): Promise<PersonalizationEffectiveness> {
    try {
      const cacheKey = 'personalization_effectiveness';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const insights = await communityFeedbackLoop.getPersonalizationInsights();
      const effectiveness = await this.processPersonalizationInsights(insights);

      this.setCachedData(cacheKey, effectiveness);
      return effectiveness;
    } catch (error) {
      console.error('Error getting personalization effectiveness:', error);
      return this.getDefaultPersonalizationEffectiveness();
    }
  }

  // Get community insights for display
  async getCommunityInsights(): Promise<CommunityInsight[]> {
    try {
      const cacheKey = 'community_insights';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const report = await communityFeedbackLoop.getLatestIntelligenceReport();
      if (!report) return [];

      const insights = await this.processCommunityInsights(report);
      this.setCachedData(cacheKey, insights);
      return insights;
    } catch (error) {
      console.error('Error getting community insights:', error);
      return [];
    }
  }

  // Process trending assets from sentiment analysis
  private async processTrendingAssets(sentimentAnalysis: CommunitySentimentData[]): Promise<TrendingAsset[]> {
    return sentimentAnalysis
      .filter(asset => asset.trendingDirection === 'up' || asset.sentimentScore > 0.3)
      .sort((a, b) => b.momentumScore - a.momentumScore)
      .map(asset => ({
        symbol: asset.assetSymbol,
        name: this.getAssetName(asset.assetSymbol),
        sentiment: asset.overallSentiment,
        sentimentScore: asset.sentimentScore,
        confidence: asset.confidence,
        engagement: asset.communityEngagement.views + asset.communityEngagement.saves + asset.communityEngagement.shares,
        trendingDirection: asset.trendingDirection,
        communityActivity: {
          views: asset.communityEngagement.views,
          saves: asset.communityEngagement.saves,
          shares: asset.communityEngagement.shares,
          discussions: Math.floor(asset.totalInteractions * 0.1), // Estimate discussions
        },
        demographicInsights: {
          mostEngaged: this.getMostEngagedDemographic(asset.demographicBreakdown),
          sentimentByExperience: {
            beginner: asset.demographicBreakdown.byExperience.beginner.sentiment,
            intermediate: asset.demographicBreakdown.byExperience.intermediate.sentiment,
            expert: asset.demographicBreakdown.byExperience.expert.sentiment,
          },
        },
      }));
  }

  // Process personalization insights
  private async processPersonalizationInsights(insights: PersonalizationInsight[]): Promise<PersonalizationEffectiveness> {
    const personalizationInsight = insights.find(i => i.category === 'personalization');
    
    if (personalizationInsight) {
      return {
        mode: 'personalized',
        effectiveness: {
          engagementRate: personalizationInsight.supportingData.sentimentScore * 100,
          satisfactionScore: personalizationInsight.confidence * 100,
          retentionRate: personalizationInsight.confidence * 85, // Estimate
          conversionRate: personalizationInsight.confidence * 70, // Estimate
        },
        userPreferences: {
          mostEffectiveFor: ['experienced users', 'engaged users', 'active traders'],
          leastEffectiveFor: ['new users', 'casual users'],
        },
        recommendations: personalizationInsight.recommendations.forUsers,
      };
    }

    return this.getDefaultPersonalizationEffectiveness();
  }

  // Process community insights from report
  private async processCommunityInsights(report: CommunityIntelligenceReport): Promise<CommunityInsight[]> {
    const insights: CommunityInsight[] = [];

    // Add sentiment insights
    const topSentimentAssets = report.sentimentAnalysis
      .filter(s => s.sentimentScore > 0.5)
      .slice(0, 3);

    topSentimentAssets.forEach(asset => {
      insights.push({
        id: `sentiment_${asset.assetSymbol}`,
        type: 'sentiment',
        title: `${asset.assetSymbol} Community Sentiment`,
        description: `Strong ${asset.overallSentiment} sentiment with ${asset.confidence.toFixed(1)} confidence`,
        confidence: asset.confidence,
        impact: asset.confidence > 0.8 ? 'high' : asset.confidence > 0.5 ? 'medium' : 'low',
        actionable: true,
        data: asset,
        timestamp: asset.lastUpdated,
      });
    });

    // Add trending insights
    const trendingInsights = report.personalizationInsights.filter(i => i.insightType === 'trending');
    trendingInsights.forEach(insight => {
      insights.push({
        id: `trending_${insight.category}`,
        type: 'trending',
        title: `Trending: ${insight.category}`,
        description: insight.description,
        confidence: insight.confidence,
        impact: insight.confidence > 0.7 ? 'high' : 'medium',
        actionable: true,
        data: insight,
        timestamp: insight.timestamp,
      });
    });

    // Add personalization insights
    const personalizationInsights = report.personalizationInsights.filter(i => i.category === 'personalization');
    personalizationInsights.forEach(insight => {
      insights.push({
        id: `personalization_${insight.insightType}`,
        type: 'personalization',
        title: 'Personalization Effectiveness',
        description: insight.description,
        confidence: insight.confidence,
        impact: 'high',
        actionable: true,
        data: insight,
        timestamp: insight.timestamp,
      });
    });

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  // Helper methods
  private getAssetName(symbol: string): string {
    // In real implementation, this would fetch from a database
    const assetNames: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'TSLA': 'Tesla Inc.',
      'AMZN': 'Amazon.com Inc.',
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
    };
    return assetNames[symbol] || symbol;
  }

  private getMostEngagedDemographic(demographicBreakdown: any): string {
    const experience = demographicBreakdown.byExperience;
    const counts = [
      { name: 'beginner', count: experience.beginner.count },
      { name: 'intermediate', count: experience.intermediate.count },
      { name: 'expert', count: experience.expert.count },
    ];
    
    const mostEngaged = counts.reduce((max, current) => 
      current.count > max.count ? current : max
    );
    
    return mostEngaged.name;
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private getDefaultDashboard(): CommunityDashboard {
    return {
      summary: {
        totalUsers: 0,
        activeUsers: 0,
        totalInteractions: 0,
        averageSentiment: 0,
        topTrendingAssets: [],
      },
      trendingAssets: [],
      personalizationInsights: this.getDefaultPersonalizationEffectiveness(),
      communityInsights: [],
      recommendations: {
        content: [],
        features: [],
        strategy: [],
      },
      lastUpdated: new Date(),
    };
  }

  private getDefaultPersonalizationEffectiveness(): PersonalizationEffectiveness {
    return {
      mode: 'personalized',
      effectiveness: {
        engagementRate: 0,
        satisfactionScore: 0,
        retentionRate: 0,
        conversionRate: 0,
      },
      userPreferences: {
        mostEffectiveFor: [],
        leastEffectiveFor: [],
      },
      recommendations: [],
    };
  }
}

export const communityInsightsService = new CommunityInsightsService();

// React hook for accessing community insights
import { useState, useEffect, useCallback } from 'react';
import { 
  communityInsightsService, 
  CommunityDashboard, 
  TrendingAsset, 
  CommunitySentimentData, 
  PersonalizationEffectiveness, 
  CommunityInsight 
} from '../services/CommunityInsightsService';

export interface UseCommunityInsightsReturn {
  dashboard: CommunityDashboard | null;
  trendingAssets: TrendingAsset[];
  personalizationEffectiveness: PersonalizationEffectiveness | null;
  communityInsights: CommunityInsight[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getAssetSentiment: (symbol: string) => Promise<CommunitySentimentData | null>;
}

export function useCommunityInsights(): UseCommunityInsightsReturn {
  const [dashboard, setDashboard] = useState<CommunityDashboard | null>(null);
  const [trendingAssets, setTrendingAssets] = useState<TrendingAsset[]>([]);
  const [personalizationEffectiveness, setPersonalizationEffectiveness] = useState<PersonalizationEffectiveness | null>(null);
  const [communityInsights, setCommunityInsights] = useState<CommunityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        dashboardData,
        trendingData,
        personalizationData,
        insightsData
      ] = await Promise.all([
        communityInsightsService.getCommunityDashboard(),
        communityInsightsService.getTrendingAssets(10),
        communityInsightsService.getPersonalizationEffectiveness(),
        communityInsightsService.getCommunityInsights()
      ]);

      setDashboard(dashboardData);
      setTrendingAssets(trendingData);
      setPersonalizationEffectiveness(personalizationData);
      setCommunityInsights(insightsData);
    } catch (err) {
      console.error('Error loading community insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load community insights');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const getAssetSentiment = useCallback(async (symbol: string): Promise<CommunitySentimentData | null> => {
    try {
      return await communityInsightsService.getAssetSentiment(symbol);
    } catch (err) {
      console.error('Error getting asset sentiment:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    dashboard,
    trendingAssets,
    personalizationEffectiveness,
    communityInsights,
    loading,
    error,
    refresh,
    getAssetSentiment,
  };
}

// Hook for specific asset sentiment
export function useAssetSentiment(symbol: string) {
  const [sentiment, setSentiment] = useState<CommunitySentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSentiment = async () => {
      try {
        setLoading(true);
        setError(null);
        const sentimentData = await communityInsightsService.getAssetSentiment(symbol);
        setSentiment(sentimentData);
      } catch (err) {
        console.error('Error loading asset sentiment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sentiment');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      loadSentiment();
    }
  }, [symbol]);

  return { sentiment, loading, error };
}

// Hook for trending assets
export function useTrendingAssets(limit: number = 10) {
  const [trendingAssets, setTrendingAssets] = useState<TrendingAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrendingAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const assets = await communityInsightsService.getTrendingAssets(limit);
        setTrendingAssets(assets);
      } catch (err) {
        console.error('Error loading trending assets:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trending assets');
      } finally {
        setLoading(false);
      }
    };

    loadTrendingAssets();
  }, [limit]);

  return { trendingAssets, loading, error };
}

// Hook for personalization effectiveness
export function usePersonalizationEffectiveness() {
  const [effectiveness, setEffectiveness] = useState<PersonalizationEffectiveness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEffectiveness = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await communityInsightsService.getPersonalizationEffectiveness();
        setEffectiveness(data);
      } catch (err) {
        console.error('Error loading personalization effectiveness:', err);
        setError(err instanceof Error ? err.message : 'Failed to load effectiveness data');
      } finally {
        setLoading(false);
      }
    };

    loadEffectiveness();
  }, []);

  return { effectiveness, loading, error };
}

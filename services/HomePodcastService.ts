import { fetchPolygonFinancialNews, getPolygonPopularStocks } from './polygon-service';
import { fetchFinancialNews } from './news-service';
import { NewsArticle } from './market-data';
import { weeklyPodcastService, WeeklyPodcastData } from './WeeklyPodcastService';
import * as FileSystem from 'expo-file-system';

export interface PodcastData {
  id: string;
  title: string;
  description: string;
  weekOf: string;
  duration: number;
  audioUrl?: string;
  createdAt: Date;
  dataSources: {
    newsCount: number;
    stockCount: number;
    cryptoCount: number;
    topPerformers: number;
    communityMembers: number;
  };
  content: {
    marketSummary: string;
    topNews: NewsArticle[];
    topStocks: any[];
    topCrypto: any[];
    communityHighlights: string[];
  };
}

export class HomePodcastService {
  private static instance: HomePodcastService;
  
  public static getInstance(): HomePodcastService {
    if (!HomePodcastService.instance) {
      HomePodcastService.instance = new HomePodcastService();
    }
    return HomePodcastService.instance;
  }

  /**
   * Generate a mock weekly podcast using Polygon API and News API data
   * DISABLED: Using provided podcast instead of generating new ones
   */
  async generateMockWeeklyPodcast(): Promise<PodcastData> {
    console.log('⚠️ Podcast generation is disabled. Using provided podcast instead.');
    return this.getProvidedPodcastData();
  }

  /**
   * Generate audio for the podcast using autocontent
   * DISABLED: Using provided podcast audio instead of generating new ones
   */
  async generatePodcastAudio(podcastData: PodcastData): Promise<string | null> {
    console.log('⚠️ Audio generation is disabled. Using provided podcast audio instead.');
    return 'weekly-podcast.mp3'; // Return the filename that maps to local assets
  }

  /**
   * Generate audio using AutoContent API (simplified version)
   * DISABLED: Using provided podcast audio instead of generating new ones
   */
  private async generateAudioWithAutoContent(script: string): Promise<ArrayBuffer | null> {
    console.log('⚠️ AutoContent API audio generation is disabled. Using provided podcast audio instead.');
    return null;
  }

  /**
   * Get the provided weekly podcast (no generation)
   */
  async getOrGenerateWeeklyPodcast(): Promise<PodcastData> {
    try {
      // Use the provided podcast file instead of generating new ones
      console.log('🎙️ Using provided podcast file...');
      return this.getProvidedPodcastData();
    } catch (error) {
      console.error('Error getting provided podcast:', error);
      return this.getFallbackPodcastData();
    }
  }

  /**
   * Download and store a podcast MP3 file from a URL
   */
  async downloadAndStorePodcast(podcastUrl: string, filename: string = 'weekly-podcast.mp3'): Promise<string | null> {
    try {
      console.log('📥 Downloading podcast from:', podcastUrl);
      
      // Create the audio directory if it doesn't exist
      const audioDir = `${FileSystem.documentDirectory}audio/`;
      const dirInfo = await FileSystem.getInfoAsync(audioDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
        console.log('📁 Created audio directory:', audioDir);
      }
      
      // Define the local file path
      const localPath = `${audioDir}${filename}`;
      
      // Download the file
      const downloadResult = await FileSystem.downloadAsync(podcastUrl, localPath);
      
      if (downloadResult.status === 200) {
        console.log('✅ Podcast downloaded successfully to:', downloadResult.uri);
        return downloadResult.uri;
      } else {
        console.error('❌ Failed to download podcast. Status:', downloadResult.status);
        return null;
      }
    } catch (error) {
      console.error('Error downloading podcast:', error);
      return null;
    }
  }

  /**
   * Set a custom podcast file URL (for when user provides their own podcast)
   */
  async setCustomPodcast(podcastUrl: string, title: string = 'Custom Weekly Podcast'): Promise<PodcastData> {
    try {
      console.log('🎙️ Setting custom podcast:', podcastUrl);
      
      // Download and store the podcast locally
      const localPath = await this.downloadAndStorePodcast(podcastUrl, 'custom-weekly-podcast.mp3');
      
      return {
        id: 'custom-podcast',
        title,
        description: 'Custom weekly podcast provided by user.',
        weekOf: this.getCurrentWeek(),
        duration: 480, // Default duration
        audioUrl: localPath || podcastUrl, // Use local path if available, otherwise use original URL
        createdAt: new Date(),
        dataSources: {
          newsCount: 0,
          stockCount: 0,
          cryptoCount: 0,
          topPerformers: 0,
          communityMembers: 0,
        },
        content: {
          marketSummary: 'Custom podcast content provided by user.',
          topNews: [],
          topStocks: [],
          topCrypto: [],
          communityHighlights: [],
        },
      };
    } catch (error) {
      console.error('Error setting custom podcast:', error);
      return this.getFallbackPodcastData();
    }
  }

  private deduplicateNews(news: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    return news.filter(article => {
      const key = article.headline.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private getCurrentWeek(): string {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    return startOfWeek.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private generatePodcastContent(news: NewsArticle[], stocks: any[], crypto: any[]): any {
    // Create market summary
    const marketSummary = this.createMarketSummary(news, stocks, crypto);
    
    // Get top news (limit to 3 most recent)
    const topNews = news
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);
    
    // Create community highlights (mock data)
    const communityHighlights = [
      'Community member JohnDoe achieved 15% returns this week',
      'New trading strategy shared by CryptoTrader123',
      'Weekly challenge winner: StockMaster99',
    ];
    
    return {
      marketSummary,
      topNews,
      topStocks: stocks,
      topCrypto: crypto,
      communityHighlights,
    };
  }

  private createMarketSummary(news: NewsArticle[], stocks: any[], crypto: any[]): string {
    const positiveNews = news.filter(n => n.sentiment === 'positive').length;
    const negativeNews = news.filter(n => n.sentiment === 'negative').length;
    
    let summary = `This week in the markets, we saw ${news.length} major news stories. `;
    
    if (positiveNews > negativeNews) {
      summary += `The sentiment was largely positive with ${positiveNews} bullish stories. `;
    } else if (negativeNews > positiveNews) {
      summary += `Market sentiment was cautious with ${negativeNews} bearish developments. `;
    } else {
      summary += `Market sentiment was mixed with balanced positive and negative news. `;
    }
    
    summary += `We're tracking ${stocks.length} trending stocks and ${crypto.length} crypto assets. `;
    summary += `The community remains active with new strategies and insights being shared daily.`;
    
    return summary;
  }

  private createPodcastScript(podcastData: PodcastData): string {
    const { content, dataSources } = podcastData;
    
    let script = `Welcome to the Dekr Weekly Community Podcast for the week of ${podcastData.weekOf}. `;
    script += `I'm your host, and today we're diving into the week's most important market developments. `;
    script += `\n\n`;
    
    script += `Market Summary: ${content.marketSummary} `;
    script += `\n\n`;
    
    if (content.topNews.length > 0) {
      script += `Top News Stories: `;
      content.topNews.forEach((news, index) => {
        script += `Story ${index + 1}: ${news.headline}. ${news.content.substring(0, 100)}... `;
      });
      script += `\n\n`;
    }
    
    if (content.topStocks.length > 0) {
      script += `Stock Market Highlights: `;
      content.topStocks.forEach((stock, index) => {
        script += `${stock.symbol} is showing strong performance. `;
      });
      script += `\n\n`;
    }
    
    if (content.topCrypto.length > 0) {
      script += `Crypto Market Update: `;
      content.topCrypto.forEach((crypto, index) => {
        script += `${crypto.symbol} continues to be a community favorite. `;
      });
      script += `\n\n`;
    }
    
    if (content.communityHighlights.length > 0) {
      script += `Community Highlights: `;
      content.communityHighlights.forEach((highlight, index) => {
        script += `${highlight}. `;
      });
      script += `\n\n`;
    }
    
    script += `That wraps up this week's Dekr Community Podcast. `;
    script += `Thank you for listening, and remember to stay informed and trade responsibly. `;
    script += `Join our community for more insights and discussions. `;
    script += `Until next week, happy trading!`;
    
    return script;
  }

  private calculateDuration(content: any): number {
    // Estimate duration based on content length
    const baseDuration = 300; // 5 minutes base
    const newsDuration = content.topNews.length * 30; // 30 seconds per news item
    const stocksDuration = content.topStocks.length * 20; // 20 seconds per stock
    const cryptoDuration = content.topCrypto.length * 20; // 20 seconds per crypto
    const communityDuration = content.communityHighlights.length * 15; // 15 seconds per highlight
    
    return baseDuration + newsDuration + stocksDuration + cryptoDuration + communityDuration;
  }

  /**
   * Get the provided podcast data (using local podcast file)
   */
  private getProvidedPodcastData(): PodcastData {
    return {
      id: 'provided-podcast',
      title: 'Weekly Market Insights',
      description: 'This week\'s market analysis with community highlights and trading insights.',
      weekOf: this.getCurrentWeek(),
      duration: 480, // 8 minutes
      audioUrl: 'weekly-podcast.mp3', // Use filename that maps to local assets
      createdAt: new Date(),
      dataSources: {
        newsCount: 5,
        stockCount: 3,
        cryptoCount: 0,
        topPerformers: 5,
        communityMembers: 75,
      },
      content: {
        marketSummary: 'This week brought mixed signals to the markets with various economic indicators and corporate earnings reports.',
        topNews: [],
        topStocks: [],
        topCrypto: [],
        communityHighlights: [
          'Community remains active with new trading strategies',
          'Weekly challenges continue to engage members',
          'Educational content receives positive feedback',
        ],
      },
    };
  }

  private getFallbackPodcastData(): PodcastData {
    return {
      id: 'fallback-podcast',
      title: 'Weekly Market Insights - Fallback',
      description: 'This week\'s market analysis with community highlights and trading insights.',
      weekOf: this.getCurrentWeek(),
      duration: 480, // 8 minutes
      audioUrl: 'weekly-podcast.mp3', // Use filename that maps to local assets
      createdAt: new Date(),
      dataSources: {
        newsCount: 5,
        stockCount: 3,
        cryptoCount: 0, // No crypto for now
        topPerformers: 5,
        communityMembers: 75,
      },
      content: {
        marketSummary: 'This week brought mixed signals to the markets with various economic indicators and corporate earnings reports.',
        topNews: [],
        topStocks: [],
        topCrypto: [],
        communityHighlights: [
          'Community remains active with new trading strategies',
          'Weekly challenges continue to engage members',
          'Educational content receives positive feedback',
        ],
      },
    };
  }
}

export const homePodcastService = HomePodcastService.getInstance();

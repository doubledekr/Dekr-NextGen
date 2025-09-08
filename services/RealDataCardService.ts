import { Platform } from 'react-native';
import { 
  getPolygonPopularStocks, 
  getPolygonPopularCrypto, 
  fetchPolygonFinancialNews,
  fetchPolygonTickerNews 
} from './polygon-service';
import { UnifiedCard } from './CardService';

export class RealDataCardService {
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
   * Generate real stock cards from Polygon API
   */
  async generateRealStockCards(limit: number = 5): Promise<UnifiedCard[]> {
    try {
      console.log('📈 Generating real stock cards from Polygon API...');
      
      const stocks = await getPolygonPopularStocks(limit);
      
      const stockCards: UnifiedCard[] = stocks.map(stock => ({
        id: `real-stock-${stock.symbol}`,
        type: 'stock',
        title: `${stock.name} (${stock.symbol})`,
        description: `${stock.symbol} is trading at $${stock.price.toFixed(2)} (${stock.changePercentage > 0 ? '+' : ''}${stock.changePercentage.toFixed(2)}%)`,
        contentUrl: `https://polygon.io/stocks/${stock.symbol}`,
        imageUrl: `https://logo.clearbit.com/${stock.name.toLowerCase().replace(/\s+/g, '')}.com`,
        metadata: {
          symbol: stock.symbol,
          price: stock.price,
          changePercentage: stock.changePercentage,
          volume: stock.volume,
          dayRange: stock.dayRange,
          sector: this.getSectorFromSymbol(stock.symbol),
          sentiment: stock.sentiment,
          grade: stock.grade,
          volatility: stock.volatility,
          signal: stock.currentSignal
        },
        createdAt: new Date(),
        priority: this.calculateStockPriority(stock),
        tags: ['stock', 'market', 'real-time', stock.sentiment, stock.volatility.toLowerCase()],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        }
      }));

      console.log(`✅ Generated ${stockCards.length} real stock cards`);
      return stockCards;
    } catch (error) {
      console.error('❌ Error generating real stock cards:', error);
      return [];
    }
  }

  /**
   * Generate real crypto cards from Polygon API (disabled - stocks only mode)
   */
  async generateRealCryptoCards(limit: number = 3): Promise<UnifiedCard[]> {
    try {
      console.log('₿ Skipping crypto cards - stocks only mode');
      
      // Skip crypto requests for now
      const cryptos: any[] = [];
      
      const cryptoCards: UnifiedCard[] = cryptos.map(crypto => ({
        id: `real-crypto-${crypto.symbol}`,
        type: 'crypto',
        title: `${crypto.name} (${crypto.symbol})`,
        description: `${crypto.symbol} is trading at $${crypto.price.toFixed(2)} (${crypto.changePercentage > 0 ? '+' : ''}${crypto.changePercentage.toFixed(2)}%)`,
        contentUrl: `https://polygon.io/crypto/${crypto.symbol}`,
        imageUrl: this.getCryptoImageUrl(crypto.symbol),
        metadata: {
          symbol: crypto.symbol,
          price: crypto.price,
          changePercentage: crypto.changePercentage,
          volume: crypto.volume,
          dayRange: crypto.dayRange,
          high24h: crypto.high24h,
          low24h: crypto.low24h,
          sentiment: crypto.sentiment,
          grade: crypto.grade,
          volatility: crypto.volatility,
          signal: crypto.currentSignal
        },
        createdAt: new Date(),
        priority: this.calculateCryptoPriority(crypto),
        tags: ['crypto', 'blockchain', 'real-time', crypto.sentiment, crypto.volatility.toLowerCase()],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        }
      }));

      console.log(`✅ Generated ${cryptoCards.length} real crypto cards`);
      return cryptoCards;
    } catch (error) {
      console.error('❌ Error generating real crypto cards:', error);
      return [];
    }
  }

  /**
   * Generate real news cards from Polygon API
   */
  async generateRealNewsCards(limit: number = 5): Promise<UnifiedCard[]> {
    try {
      console.log('📰 Generating real news cards from Polygon API...');
      
      const newsArticles = await fetchPolygonFinancialNews(limit);
      
      const newsCards: UnifiedCard[] = newsArticles.map(article => ({
        id: `real-news-${article.id}`,
        type: 'news',
        title: article.headline,
        description: article.content.substring(0, 150) + '...',
        contentUrl: article.url,
        imageUrl: article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
        metadata: {
          source: article.source,
          sentiment: article.sentiment,
          tickers: article.tickers,
          publishedAt: new Date(article.timestamp)
        },
        createdAt: new Date(article.timestamp),
        priority: this.calculateNewsPriority(article),
        tags: ['news', 'market', 'real-time', article.sentiment, ...(article.tickers || [])],
        engagement: {
          views: 0,
          saves: 0,
          shares: 0
        }
      }));

      console.log(`✅ Generated ${newsCards.length} real news cards`);
      return newsCards;
    } catch (error) {
      console.error('❌ Error generating real news cards:', error);
      return [];
    }
  }

  /**
   * Generate a comprehensive feed of real data cards
   */
  async generateRealDataFeed(limit: number = 15): Promise<UnifiedCard[]> {
    try {
      console.log('🚀 Generating comprehensive real data feed...');
      
      const [stockCards, cryptoCards, newsCards] = await Promise.all([
        this.generateRealStockCards(Math.ceil(limit * 0.4)), // 40% stocks
        this.generateRealCryptoCards(Math.ceil(limit * 0.2)), // 20% crypto
        this.generateRealNewsCards(Math.ceil(limit * 0.4))    // 40% news
      ]);

      // Combine and sort by priority
      const allCards = [...stockCards, ...cryptoCards, ...newsCards]
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit);

      console.log(`✅ Generated comprehensive real data feed with ${allCards.length} cards`);
      return allCards;
    } catch (error) {
      console.error('❌ Error generating real data feed:', error);
      return [];
    }
  }

  /**
   * Save real data cards to Firestore
   */
  async saveRealDataCardsToFirestore(cards: UnifiedCard[]): Promise<void> {
    try {
      console.log(`💾 Saving ${cards.length} real data cards to Firestore...`);
      
      const batch = this.db.batch();
      
      for (const card of cards) {
        const cardRef = this.db.collection('cards').doc(card.id);
        batch.set(cardRef, {
          ...card,
          createdAt: this.db.FieldValue.serverTimestamp(),
          isRealData: true,
          dataSource: 'polygon-api'
        });
      }
      
      await batch.commit();
      console.log('✅ Real data cards saved to Firestore successfully');
    } catch (error) {
      console.error('❌ Error saving real data cards to Firestore:', error);
    }
  }

  /**
   * Generate and save real data cards to Firestore
   */
  async generateAndSaveRealDataCards(limit: number = 15): Promise<UnifiedCard[]> {
    try {
      console.log('🔄 Generating and saving real data cards...');
      
      const cards = await this.generateRealDataFeed(limit);
      
      if (cards.length > 0) {
        await this.saveRealDataCardsToFirestore(cards);
      }
      
      return cards;
    } catch (error) {
      console.error('❌ Error generating and saving real data cards:', error);
      return [];
    }
  }

  // Helper methods
  private calculateStockPriority(stock: any): number {
    let priority = 50; // Base priority
    
    // Higher priority for better performance
    if (stock.changePercentage > 5) priority += 20;
    else if (stock.changePercentage > 2) priority += 10;
    else if (stock.changePercentage < -5) priority += 15; // Volatility is interesting
    else if (stock.changePercentage < -2) priority += 5;
    
    // Higher priority for higher volume
    if (stock.volume > 1000000) priority += 10;
    else if (stock.volume > 100000) priority += 5;
    
    // Higher priority for popular stocks
    const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA'];
    if (popularStocks.includes(stock.symbol)) priority += 15;
    
    return Math.min(100, priority);
  }

  private calculateCryptoPriority(crypto: any): number {
    let priority = 45; // Base priority (slightly lower than stocks)
    
    // Higher priority for significant moves
    if (Math.abs(crypto.changePercentage) > 10) priority += 25;
    else if (Math.abs(crypto.changePercentage) > 5) priority += 15;
    else if (Math.abs(crypto.changePercentage) > 2) priority += 5;
    
    // Higher priority for major cryptos
    const majorCryptos = ['BTC', 'ETH', 'ADA', 'SOL'];
    if (majorCryptos.includes(crypto.symbol)) priority += 20;
    
    return Math.min(100, priority);
  }

  private calculateNewsPriority(article: any): number {
    let priority = 40; // Base priority
    
    // Higher priority for recent news
    const hoursAgo = (Date.now() - article.timestamp) / (1000 * 60 * 60);
    if (hoursAgo < 1) priority += 20;
    else if (hoursAgo < 6) priority += 15;
    else if (hoursAgo < 24) priority += 10;
    
    // Higher priority for sentiment
    if (article.sentiment === 'positive') priority += 10;
    else if (article.sentiment === 'negative') priority += 15; // Negative news can be more impactful
    
    // Higher priority for major tickers
    const majorTickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'BTC', 'ETH'];
    if (article.tickers && article.tickers.some((ticker: string) => majorTickers.includes(ticker))) {
      priority += 15;
    }
    
    return Math.min(100, priority);
  }

  private getSectorFromSymbol(symbol: string): string {
    const sectorMap: { [key: string]: string } = {
      'AAPL': 'Technology',
      'GOOGL': 'Technology',
      'MSFT': 'Technology',
      'META': 'Technology',
      'NVDA': 'Technology',
      'AMZN': 'Consumer Discretionary',
      'TSLA': 'Consumer Discretionary',
      'NFLX': 'Communication Services',
      'AMD': 'Technology',
      'BABA': 'Consumer Discretionary',
      'UBER': 'Industrials',
      'COIN': 'Financial Services',
      'PLTR': 'Technology',
      'PYPL': 'Financial Services',
      'SHOP': 'Technology',
      'SQ': 'Financial Services',
      'ROKU': 'Communication Services',
      'ZOOM': 'Technology',
      'DOCU': 'Technology',
      'CRM': 'Technology'
    };
    
    return sectorMap[symbol] || 'General';
  }

  private getCryptoImageUrl(symbol: string): string {
    const cryptoImages: { [key: string]: string } = {
      'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
      'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
      'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
      'SHIB': 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
      'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
      'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
      'DOT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png'
    };
    
    return cryptoImages[symbol] || 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400';
  }
}

// Export singleton instance
export const realDataCardService = new RealDataCardService();

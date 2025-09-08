import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Share,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import {
  Card,
  Button,
  Title,
  Paragraph,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Newsletter, newsletterService } from '../../services/NewsletterService';
import { useAppSelector } from '../../store/hooks';
import { safeHapticImpact } from '../../utils/haptics';
import Swiper from 'react-native-deck-swiper';

// Newsletter Card Component
function NewsletterCard({ newsletter, onAction, theme }: {
  newsletter: Newsletter;
  onAction: (newsletter: Newsletter, action: 'like' | 'dislike' | 'share') => void;
  theme: any;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  
  console.log('NewsletterCard rendering with:', newsletter.title);

  const formatDate = (date: any) => {
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    } else if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date().toLocaleDateString();
  };

  const handleCardPress = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Newsletter colors (blue theme matching podcast green theme)
  const colors = {
    background: '#E3F2FD', // Light blue (matches podcast light green)
    ribbon: '#2196F3',     // Blue (matches podcast green)
    ribbonText: '#FFFFFF', // White
    text: '#1565C0',       // Dark blue (matches podcast dark green)
    stats: '#BBDEFB',      // Light blue (matches podcast light green)
  };

  return (
    <>
      <View style={styles.newsletterCardTouchable}>
        <View style={[styles.newsletterCard, { backgroundColor: colors.background }]}>
          <View style={styles.newsletterCardContent}>
            {/* Newsletter Corner Banner (matches podcast banner exactly) */}
            <View style={[styles.newsletterBanner, { backgroundColor: colors.ribbon }]}>
              <Text style={[styles.newsletterBannerText, { color: colors.ribbonText }]}>
                NEWSLETTER
              </Text>
            </View>

          {/* Newsletter icon */}
          <View style={styles.typeIconContainer}>
            <MaterialCommunityIcons
              name="newspaper"
              size={32}
              color={colors.text}
            />
          </View>

          {/* Title */}
          <View style={styles.nameContainer}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={3}>
              {newsletter.title}
            </Text>
          </View>

          {/* Week badge */}
          <View style={styles.weekBadge}>
            <Text style={[styles.weekText, { color: colors.text }]}>
              Week of {formatDate(newsletter.publishedAt)}
            </Text>
          </View>

          </View>
          
          {/* Stats container - positioned at bottom of card */}
          <View style={[styles.statsContainer, { backgroundColor: colors.stats }]}>
            <View style={styles.newsletterInfo}>
              <MaterialCommunityIcons name="clock" size={20} color={colors.text} />
              <Text style={[styles.newsletterStats, { color: colors.text }]}>
                {Math.ceil(newsletter.content.length / 1000)} min read
              </Text>
              <MaterialCommunityIcons name="newspaper" size={20} color={colors.text} />
              <Text style={[styles.newsletterStats, { color: colors.text }]}>
                Newsletter
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface }]}>
            <IconButton
              icon="close"
              onPress={closeModal}
              iconColor={theme.colors.onSurface}
            />
            <Title style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Newsletter
            </Title>
            <View style={{ width: 48 }} />
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalCard}>
              <Title style={[styles.modalNewsletterTitle, { color: theme.colors.onSurface }]}>
                {newsletter.title}
              </Title>
              
              <Text style={[styles.modalDate, { color: theme.colors.onSurfaceVariant }]}>
                Published: {formatDate(newsletter.publishedAt)}
              </Text>
              
              <Paragraph style={[styles.modalContentText, { color: theme.colors.onSurface }]}>
                {newsletter.content}
              </Paragraph>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

// Newsletter Card Stack Component using Swiper
function NewsletterCardStack({ newsletters, onAction, theme }: { 
  newsletters: Newsletter[]; 
  onAction: (newsletter: Newsletter, action: 'like' | 'dislike' | 'share') => void;
  theme: any;
}) {
  const swiperRef = useRef<Swiper<Newsletter>>(null);
  
  console.log('NewsletterCardStack render - newsletters:', newsletters.length, newsletters);

  const handleSwipeLeft = (cardIndex: number) => {
    console.log('Swiped left on newsletter:', newsletters[cardIndex]?.title);
    safeHapticImpact('light');
    // All swipes move card to back of stack
    if (swiperRef.current) {
      swiperRef.current.swipeBack();
    }
  };

  const handleSwipeRight = (cardIndex: number) => {
    console.log('Swiped right on newsletter:', newsletters[cardIndex]?.title);
    safeHapticImpact('light');
    // All swipes move card to back of stack
    if (swiperRef.current) {
      swiperRef.current.swipeBack();
    }
  };

  const handleSwipeTop = (cardIndex: number) => {
    console.log('Swiped up on newsletter:', newsletters[cardIndex]?.title);
    safeHapticImpact('light');
    // All swipes move card to back of stack
    if (swiperRef.current) {
      swiperRef.current.swipeBack();
    }
  };

  const handleSwipeBottom = (cardIndex: number) => {
    console.log('Swiped down on newsletter:', newsletters[cardIndex]?.title);
    safeHapticImpact('light');
    // All swipes move card to back of stack
    if (swiperRef.current) {
      swiperRef.current.swipeBack();
    }
  };

  if (newsletters.length === 0) {
    return (
      <View style={[styles.swiperContainer, { backgroundColor: theme.colors.background }]}>
        <Card style={[styles.newsletterCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              No Newsletters Available
            </Title>
            <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
              Check back later for the latest newsletters.
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.swiperContainer, { backgroundColor: theme.colors.background }]}>
      <Swiper
        ref={swiperRef}
        cards={newsletters}
        key={newsletters.length}
        renderCard={(newsletter) => {
          console.log('Swiper renderCard called with:', newsletter?.title || 'null');
          return newsletter ? (
            <NewsletterCard 
              newsletter={newsletter} 
              onAction={onAction}
              theme={theme}
            />
          ) : null;
        }}
        onSwipedRight={handleSwipeRight}
        onSwipedLeft={handleSwipeLeft}
        onSwipedTop={handleSwipeTop}
        onSwipedBottom={handleSwipeBottom}
        cardIndex={0}
        backgroundColor="transparent"
        stackSize={3}
        stackScale={0}
        stackSeparation={8}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
        verticalSwipe={true}
        horizontalSwipe={true}
        cardVerticalMargin={10}
        cardHorizontalMargin={15}
        infinite={true}
        overlayLabels={{}}
      />
    </View>
  );
}

export default function NewsletterScreen() {
  const theme = useTheme();
  const { user } = useAppSelector((state: any) => state.auth);
  
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('NewsletterScreen useEffect triggered, user:', user);
    
    if (user) {
    loadNewsletters();
    }
  }, [user]);

  const loadNewsletters = async () => {
    try {
      setIsLoading(true);
      console.log('Loading newsletters...');
      const recentNewsletters = await newsletterService.getRecentNewsletters();
      console.log('Loaded newsletters:', recentNewsletters.length, recentNewsletters);
      
      // If no newsletters returned, create a simple fallback
      if (recentNewsletters.length === 0) {
        console.log('No newsletters returned, creating fallback newsletter');
        const fallbackNewsletter: Newsletter = {
          id: 'fallback-newsletter',
          title: 'Welcome to Dekr Newsletter',
          content: 'This is a test newsletter to ensure the newsletter system is working properly.',
          publishedAt: new Date(),
          weekOf: new Date(),
          stats: {
            views: 0,
            shares: 0,
            likes: 0,
            clickThroughRate: 0,
            engagementTime: 0,
          },
          data: {
            weeklyStats: {
              totalUsers: 100,
              activeUsers: 50,
              newSignups: 10,
              totalPredictions: 200,
              accuracyRate: 75,
              totalRecommendations: 50,
              totalCompetitions: 5,
            },
            topPerformers: {
              users: [],
              strategies: [],
              predictions: [],
            },
            communityInsights: {
              trendingStocks: [],
              popularStrategies: [],
              discussionHighlights: [],
            },
            marketContext: {
              weeklyMarketSummary: 'Market data is being processed...',
              majorEvents: [],
              sectorPerformance: [],
            },
            educationalHighlights: {
              popularCourses: [],
              learningTrends: [],
              knowledgeGaps: [],
            },
          },
          status: 'published',
          version: 1,
        };
        setNewsletters([fallbackNewsletter]);
      } else {
      setNewsletters(recentNewsletters);
      }
    } catch (error) {
      console.error('Error loading newsletters:', error);
      // Don't show alert to user, just log the error
      console.log('Newsletter loading failed, but continuing with fallback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNewsletters();
    setRefreshing(false);
  };

  const shareNewsletter = async (newsletter: Newsletter) => {
    try {
      await Share.share({
        message: `Check out this week's Dekr newsletter: ${newsletter.title}`,
        title: newsletter.title,
      });
    } catch (error) {
      console.error('Error sharing newsletter:', error);
    }
  };

  const handleNewsletterAction = (newsletter: Newsletter, action: 'like' | 'dislike' | 'share') => {
    safeHapticImpact();
    
    switch (action) {
      case 'like':
        // Handle like action - could update analytics or user preferences
        console.log('Liked newsletter:', newsletter.id);
        break;
      case 'dislike':
        // Handle dislike action - could update user preferences
        console.log('Disliked newsletter:', newsletter.id);
        break;
      case 'share':
        shareNewsletter(newsletter);
        break;
    }
  };


  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Loading newsletters...
        </Text>
      </View>
    );
  }

  // Always show content now - no empty state

    return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Newsletter Card Stack */}
      {newsletters.length > 0 ? (
        <NewsletterCardStack 
          newsletters={newsletters}
          onAction={handleNewsletterAction}
          theme={theme}
        />
      ) : (
        <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="newspaper-variant-outline"
          size={80}
          color={theme.colors.onSurfaceVariant}
        />
        <Title style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
          No Newsletters Available
        </Title>
        <Paragraph style={[styles.emptyStateDescription, { color: theme.colors.onSurfaceVariant }]}>
          Check back later for the latest community insights and market updates.
        </Paragraph>
        <Button
          mode="contained"
          onPress={handleRefresh}
          style={styles.refreshButton}
        >
          Refresh
        </Button>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    marginTop: 16,
  },
  // Newsletter Swiper Container (matches home screen)
  swiperContainer: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Newsletter Card Styles (matches home card sizing exactly)
  newsletterCardTouchable: {
    flex: 1,
  },
  newsletterCard: {
    width: Math.min(Dimensions.get('window').width * 0.9, 380),
    height: Math.min(Math.min(Dimensions.get('window').width * 0.9, 380) * 1.5, Dimensions.get('window').height * 0.65),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  newsletterCardContent: {
    flex: 1,
    position: 'relative',
    padding: 20,
    paddingBottom: 80, // Space for stats container
  },
  // Newsletter Banner (matches podcast banner exactly)
  newsletterBanner: {
    position: 'absolute',
    top: 25,
    left: -48,
    transform: [
      { rotate: '-45deg' },
    ],
    width: 190,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 10,
  },
  newsletterBannerText: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
    letterSpacing: 1,
  },
  // Type icon container (matches podcast)
  typeIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Name container (matches podcast)
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Title styling (matches podcast)
  cardTitle: {
    fontFamily: 'AustinNewsDeck-Bold',
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 28,
  },
  // Week badge (matches podcast)
  weekBadge: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  weekText: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Stats container (matches podcast)
  statsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 16,
  },
  newsletterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newsletterStats: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalCard: {
    padding: 16,
  },
  modalNewsletterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 14,
    marginBottom: 16,
  },
  modalContentText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

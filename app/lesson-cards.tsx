import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
import { useTheme, FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Swiper from 'react-native-deck-swiper';
import { cardService, UnifiedCard as UnifiedCardType } from '../services/CardService';
import { PersonalizedCard } from '../services/PersonalizationEngine';
import { UnifiedCard } from '../components/UnifiedCard';
import { useAppSelector } from '../store/hooks';
import { safeHapticImpact } from '../utils/haptics';
import * as Haptics from 'expo-haptics';

export default function LessonCardsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state: any) => state.auth);
  const [cards, setCards] = useState<PersonalizedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMoreCards, setHasMoreCards] = useState(true);
  const swiperRef = useRef<Swiper<PersonalizedCard>>(null);
  const isFetchingRef = useRef(false);

  const loadLessonCards = async (isRefresh: boolean = false) => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const lessonCards = await cardService.getLessonCards(20);
      
      // Convert to PersonalizedCard format
      const personalizedCards: PersonalizedCard[] = lessonCards.map(card => ({
        ...card,
        personalizationScore: 1.0, // All lesson cards have high relevance
        reason: 'Educational content',
        timestamp: new Date(),
      }));

      if (isRefresh) {
        setCards(personalizedCards);
      } else {
        setCards(prev => [...prev, ...personalizedCards]);
      }

      setHasMoreCards(lessonCards.length >= 20);
    } catch (error) {
      console.error('Error loading lesson cards:', error);
      Alert.alert('Error', 'Failed to load lesson cards');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    loadLessonCards();
  }, []);

  const handleSwipeRight = async (cardIndex: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const card = cards[cardIndex];
    
    if (user) {
      try {
        // Mark lesson as completed or save progress
        console.log('Lesson completed:', card.title);
        
        // Update card engagement
        await cardService.updateCardEngagement(card.id, 'save');
        
        // Show success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error updating lesson progress:', error);
      }
    }
  };

  const handleSwipeLeft = (cardIndex: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    console.log('Lesson skipped:', cards[cardIndex]?.title);
  };

  const handleSwipeTop = (cardIndex: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log('Lesson shared:', cards[cardIndex]?.title);
  };

  const handleSwipeBottom = (cardIndex: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    console.log('Lesson dismissed:', cards[cardIndex]?.title);
  };

  const handleChatPress = () => {
    safeHapticImpact();
    router.push('/chat');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading lesson cards...</Text>
        </View>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Lesson Cards Available</Text>
          <Text style={styles.emptySubtitle}>Check back later for new educational content</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={cards}
          key={cards.length}
          renderCard={(card) => card ? <UnifiedCard data={card} /> : null}
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
          onSwipedAll={() => {
            // Load more cards when all cards are swiped
            if (hasMoreCards && !isFetchingRef.current) {
              loadLessonCards();
            }
          }}
          overlayLabels={{
            left: {
              title: 'SKIP',
              style: {
                label: {
                  backgroundColor: '#f59e0b',
                  borderColor: '#f59e0b',
                  color: 'white',
                  borderWidth: 1,
                  fontSize: 24,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                }
              }
            },
            right: {
              title: 'COMPLETE',
              style: {
                label: {
                  backgroundColor: '#10b981',
                  borderColor: '#10b981',
                  color: 'white',
                  borderWidth: 1,
                  fontSize: 24,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                }
              }
            },
            top: {
              title: 'SHARE',
              style: {
                label: {
                  backgroundColor: '#3b82f6',
                  borderColor: '#3b82f6',
                  color: 'white',
                  borderWidth: 1,
                  fontSize: 24,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                }
              }
            },
            bottom: {
              title: 'DISMISS',
              style: {
                label: {
                  backgroundColor: '#ef4444',
                  borderColor: '#ef4444',
                  color: 'white',
                  borderWidth: 1,
                  fontSize: 24,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  marginBottom: 20,
                }
              }
            }
          }}
        />
      </View>

      <FAB
        icon="chat"
        label="Chat"
        style={[
          styles.fab, 
          { bottom: insets.bottom - 20 }
        ]}
        onPress={handleChatPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0E7CB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0E7CB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Graphik-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#536B31',
    marginBottom: 8,
    fontFamily: 'AustinNewsDeck-Bold',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'Graphik-Regular',
  },
  swiperContainer: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    borderRadius: 28,
    zIndex: 1000,
  },
});

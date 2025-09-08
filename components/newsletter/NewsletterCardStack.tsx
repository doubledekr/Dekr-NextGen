import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanGestureHandler,
  State,
  Animated,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Card, Text, Title, Paragraph, Icon, Button, Chip } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Newsletter } from '../../services/NewsletterService';
import { safeHapticImpact } from '../../utils/haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.7;

interface NewsletterCardStackProps {
  newsletters: Newsletter[];
  onNewsletterAction?: (newsletter: Newsletter, action: 'like' | 'dislike' | 'share') => void;
}

export function NewsletterCardStack({ newsletters, onNewsletterAction }: NewsletterCardStackProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY, velocityX } = event.nativeEvent;
      
      // Determine if it's a swipe or tap
      const isSwipe = Math.abs(translationX) > 50 || Math.abs(translationY) > 50;
      
      if (isSwipe) {
        // Handle swipe
        const swipeThreshold = screenWidth * 0.3;
        const isRightSwipe = translationX > swipeThreshold;
        const isLeftSwipe = translationX < -swipeThreshold;
        
        if (isRightSwipe || isLeftSwipe) {
          // Animate card off screen
          const targetX = isRightSwipe ? screenWidth : -screenWidth;
          const targetRotation = isRightSwipe ? 30 : -30;
          
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: targetX,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: translationY * 2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: targetRotation,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Move to next card
            handleNextCard(isRightSwipe ? 'like' : 'dislike');
          });
        } else {
          // Return to center
          resetCardPosition();
        }
      } else {
        // Handle tap - open fullscreen
        handleCardTap();
      }
    }
  };

  const resetCardPosition = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(rotate, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNextCard = (action: 'like' | 'dislike') => {
    safeHapticImpact();
    
    // Call action callback
    if (onNewsletterAction && newsletters[currentIndex]) {
      onNewsletterAction(newsletters[currentIndex], action);
    }
    
    // Move to next card
    const nextIndex = (currentIndex + 1) % newsletters.length;
    setCurrentIndex(nextIndex);
    
    // Reset animations
    translateX.setValue(0);
    translateY.setValue(0);
    rotate.setValue(0);
    scale.setValue(1);
  };

  const handleCardTap = () => {
    if (newsletters[currentIndex]) {
      setSelectedNewsletter(newsletters[currentIndex]);
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNewsletter(null);
  };

  const formatDate = (date: any) => {
    // Handle both Date objects and Firestore timestamps
    let dateObj: Date;
    if (date && typeof date.toDate === 'function') {
      // Firestore timestamp
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      // Native Date object
      dateObj = date;
    } else if (date && typeof date.getTime === 'function') {
      // Date-like object
      dateObj = new Date(date.getTime());
    } else {
      // Fallback for invalid dates
      dateObj = new Date();
    }
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatWeekOf = (date: any) => {
    // Handle both Date objects and Firestore timestamps
    let dateObj: Date;
    if (date && typeof date.toDate === 'function') {
      // Firestore timestamp
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      // Native Date object
      dateObj = date;
    } else if (date && typeof date.getTime === 'function') {
      // Date-like object
      dateObj = new Date(date.getTime());
    } else {
      // Fallback for invalid dates
      dateObj = new Date();
    }
    
    const startOfWeek = new Date(dateObj);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    return startOfWeek.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderNewsletterContent = (newsletter: Newsletter) => {
    return (
      <View>
        {newsletter.data.weeklyStats && (
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              📊 Community Stats
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {newsletter.data.weeklyStats.activeUsers}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Active Users
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {newsletter.data.weeklyStats.newSignups}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  New Signups
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {newsletter.data.marketInsights && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              📈 Market Insights
            </Text>
            <Paragraph style={[styles.sectionContent, { color: theme.colors.onSurface }]}>
              {newsletter.data.marketInsights.summary}
            </Paragraph>
          </View>
        )}
        
        {newsletter.data.communityHighlights && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              🌟 Community Highlights
            </Text>
            <Paragraph style={[styles.sectionContent, { color: theme.colors.onSurface }]}>
              {newsletter.data.communityHighlights.summary}
            </Paragraph>
          </View>
        )}
      </View>
    );
  };

  if (newsletters.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons
          name="newspaper-variant-outline"
          size={80}
          color={theme.colors.onSurfaceVariant}
        />
        <Title style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
          No Newsletters Available
        </Title>
        <Paragraph style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
          Check back later for the latest community insights and market updates.
        </Paragraph>
      </View>
    );
  }

  const currentNewsletter = newsletters[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Card Counter */}
      <View style={styles.counterContainer}>
        <Text style={[styles.counter, { color: theme.colors.onSurfaceVariant }]}>
          {currentIndex + 1} of {newsletters.length}
        </Text>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleGestureStateChange}
        >
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: rotate.interpolate({
                    inputRange: [-30, 0, 30],
                    outputRange: ['-30deg', '0deg', '30deg'],
                  }) },
                  { scale },
                ],
              },
            ]}
          >
            <TouchableOpacity onPress={handleCardTap} activeOpacity={0.9}>
              <Card style={[styles.newsletterCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.newsletterHeader}>
                    <View style={styles.titleContainer}>
                      <Icon source="newspaper" size={24} color={theme.colors.primary} />
                      <Title style={[styles.newsletterTitle, { color: theme.colors.onSurface }]}>
                        {currentNewsletter.title}
                      </Title>
                    </View>
                    <Chip
                      mode="outlined"
                      textStyle={{ color: theme.colors.primary }}
                      style={{ borderColor: theme.colors.primary }}
                    >
                      Latest
                    </Chip>
                  </View>
                  
                  <Text style={[styles.newsletterDate, { color: theme.colors.onSurfaceVariant }]}>
                    Week of {formatWeekOf(currentNewsletter.weekOf)} • Published {formatDate(currentNewsletter.publishedAt)}
                  </Text>
                  
                  <ScrollView 
                    style={styles.contentScroll}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {renderNewsletterContent(currentNewsletter)}
                  </ScrollView>

                  {/* Newsletter Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="eye" size={16} color={theme.colors.onSurfaceVariant} />
                      <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                        {currentNewsletter.stats.views}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="share" size={16} color={theme.colors.onSurfaceVariant} />
                      <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                        {currentNewsletter.stats.shares}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="heart" size={16} color={theme.colors.onSurfaceVariant} />
                      <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                        {currentNewsletter.stats.likes}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleNextCard('dislike')}
        >
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleNextCard('like')}
        >
          <MaterialCommunityIcons name="heart" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}>
          Swipe left to dismiss • Swipe right to like • Tap to read full content
        </Text>
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <Title style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {selectedNewsletter?.title}
            </Title>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedNewsletter && (
              <View>
                <Text style={[styles.modalDate, { color: theme.colors.onSurfaceVariant }]}>
                  Week of {formatWeekOf(selectedNewsletter.weekOf)} • Published {formatDate(selectedNewsletter.publishedAt)}
                </Text>
                
                {renderNewsletterContent(selectedNewsletter)}
                
                {/* Full content sections */}
                {selectedNewsletter.data.marketInsights?.details && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                      📈 Detailed Market Analysis
                    </Text>
                    <Paragraph style={[styles.sectionContent, { color: theme.colors.onSurface }]}>
                      {selectedNewsletter.data.marketInsights.details}
                    </Paragraph>
                  </View>
                )}
                
                {selectedNewsletter.data.communityHighlights?.details && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                      🌟 Community Stories
                    </Text>
                    <Paragraph style={[styles.sectionContent, { color: theme.colors.onSurface }]}>
                      {selectedNewsletter.data.communityHighlights.details}
                    </Paragraph>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: CARD_HEIGHT + 100, // Set minimum height instead of flex: 1
  },
  counterContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  counter: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardContainer: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  newsletterCard: {
    flex: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  newsletterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newsletterTitle: {
    marginLeft: 8,
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  newsletterDate: {
    fontSize: 12,
    marginBottom: 16,
  },
  contentScroll: {
    flex: 1,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsSection: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dislikeButton: {
    backgroundColor: '#f44336',
  },
  likeButton: {
    backgroundColor: '#4caf50',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  instructions: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    marginRight: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDate: {
    fontSize: 14,
    marginBottom: 20,
  },
});

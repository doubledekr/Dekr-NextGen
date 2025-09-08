import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LessonCard as LessonCardType } from '../../types/deck';
import { safeHapticImpact } from '../../utils/haptics';
import ReactNativeAudioPlayer from '../ReactNativeAudioPlayer';
import Swiper from 'react-native-deck-swiper';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = Math.min(screenWidth * 0.9, 380);
const CARD_HEIGHT = Math.min(CARD_WIDTH * 1.5, screenHeight * 0.65);

interface LessonCardPileProps {
  cards: LessonCardType[];
  stageId: number;
  onCardComplete: (cardId: string) => void;
  onDeckComplete: (deckId: string) => void;
}

// Individual Lesson Card Component using archetype style
function LessonCard({ lesson, stageId, onComplete, onFlip, isFlipped, colors }: {
  lesson: LessonCardType;
  stageId: number;
  onComplete: () => void;
  onFlip: () => void;
  isFlipped: boolean;
  colors: any;
}) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    safeHapticImpact();
    setIsCompleted(true);
    onComplete();
  };

  const handlePress = () => {
    safeHapticImpact();
    onFlip();
  };

  return (
    <Pressable style={[styles.lessonCard, { backgroundColor: colors.background }]} onPress={handlePress}>
      <View style={styles.cardContent}>
        {/* Corner Banner - matches podcast/newsletter archetype */}
        <View style={[styles.cornerLabel, { backgroundColor: colors.ribbon }]}>
          <Text style={[styles.cornerLabelText, { color: colors.ribbonText }]}>
            LESSON
          </Text>
        </View>

        {/* Type Icon - matches archetype */}
        <View style={styles.typeIconContainer}>
          <MaterialCommunityIcons
            name="school"
            size={32}
            color={colors.text}
          />
        </View>

        {!isFlipped ? (
          // Front of card - matches archetype layout
          <>
            {/* Lesson Number Banner */}
            <View style={styles.lessonNumberContainer}>
              <Text style={[styles.lessonNumber, { color: colors.text }]}>
                Lesson {lesson.id.split('-')[1]}
              </Text>
            </View>

            {/* Title - matches archetype */}
            <View style={styles.nameContainer}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={3}>
                {lesson.title}
              </Text>
            </View>

            {/* Week badge equivalent - shows duration */}
            <View style={styles.weekBadge}>
              <Text style={[styles.weekText, { color: colors.text }]}>
                {lesson.duration}
              </Text>
            </View>

            {/* Stats container - matches archetype */}
            <View style={[styles.statsContainer, { backgroundColor: colors.stats }]}>
              <View style={styles.lessonInfo}>
                <MaterialCommunityIcons name="star" size={20} color={colors.text} />
                <Text style={[styles.lessonStats, { color: colors.text }]}>
                  {lesson.xpReward} XP
                </Text>
                <MaterialCommunityIcons name="trending-up" size={20} color={colors.text} />
                <Text style={[styles.lessonStats, { color: colors.text }]}>
                  {lesson.difficulty}
                </Text>
              </View>
            </View>

            {/* Audio Player */}
            {lesson.audioUrl && (
              <View style={styles.audioContainer}>
                <ReactNativeAudioPlayer
                  audioUrl={lesson.audioUrl}
                  title={lesson.title}
                  stage={stageId}
                  lessonId={parseInt(lesson.id.split('-')[1])}
                />
              </View>
            )}
          </>
        ) : (
          // Back of card - detailed information
          <>
            {/* Back Header */}
            <View style={styles.backHeader}>
              <Text style={[styles.backTitle, { color: colors.text }]}>
                Lesson Details
              </Text>
            </View>

            {/* Description */}
            <View style={[styles.backDescription, { backgroundColor: colors.stats }]}>
              <Text style={[styles.descriptionText, { color: colors.text }]}>
                {lesson.description}
              </Text>
            </View>

            {/* Details */}
            <View style={[styles.lessonBackContent, { backgroundColor: colors.background }]}>
              <View style={styles.lessonMetadata}>
                <View style={styles.metadataRow}>
                  <Text style={[styles.metadataLabel, { color: colors.text }]}>Duration</Text>
                  <Text style={[styles.metadataValue, { color: colors.text }]}>
                    {lesson.duration}
                  </Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={[styles.metadataLabel, { color: colors.text }]}>XP Reward</Text>
                  <Text style={[styles.metadataValue, { color: colors.text }]}>
                    {lesson.xpReward} XP
                  </Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={[styles.metadataLabel, { color: colors.text }]}>Difficulty</Text>
                  <Text style={[styles.metadataValue, { color: colors.text }]}>
                    {lesson.difficulty}
                  </Text>
                </View>
              </View>

              {/* Tips Section */}
              <View style={styles.tipsContainer}>
                <Text style={[styles.tipsTitle, { color: colors.text }]}>
                  💡 Key Tips
                </Text>
                <Text style={[styles.tipsText, { color: colors.text }]}>
                  • Listen to the audio for the full lesson experience
                </Text>
                <Text style={[styles.tipsText, { color: colors.text }]}>
                  • Take notes on important concepts
                </Text>
                <Text style={[styles.tipsText, { color: colors.text }]}>
                  • Practice applying what you learn
                </Text>
              </View>

              {/* Complete Button */}
              <TouchableOpacity
                style={[styles.completeButton, { backgroundColor: colors.ribbon }]}
                onPress={handleComplete}
                disabled={isCompleted}
              >
                <MaterialCommunityIcons
                  name={isCompleted ? "check-circle" : "check"}
                  size={20}
                  color={colors.ribbonText}
                />
                <Text style={[styles.completeButtonText, { color: colors.ribbonText }]}>
                  {isCompleted ? "Completed" : "Mark Complete"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

// Card Stack Component using Swiper
function LessonCardStack({ cards, stageId, onCardComplete, onDeckComplete, colors }: {
  cards: LessonCardType[];
  stageId: number;
  onCardComplete: (cardId: string) => void;
  onDeckComplete: (deckId: string) => void;
  colors: any;
}) {
  const swiperRef = useRef<Swiper<LessonCardType>>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const handleSwipeLeft = (cardIndex: number) => {
    console.log('Swiped left on lesson:', cards[cardIndex]?.title);
    safeHapticImpact('light');
    // All swipes move card to back of stack
    if (swiperRef.current) {
      swiperRef.current.swipeBack();
    }
  };

  const handleSwipeRight = (cardIndex: number) => {
    console.log('Swiped right on lesson:', cards[cardIndex]?.title);
    safeHapticImpact('light');
    // All swipes move card to back of stack
    if (swiperRef.current) {
      swiperRef.current.swipeBack();
    }
  };

  const handleSwipeTop = (cardIndex: number) => {
    console.log('Swiped up on lesson:', cards[cardIndex]?.title);
    safeHapticImpact('light');
    // All swipes move card to back of stack
    if (swiperRef.current) {
      swiperRef.current.swipeBack();
    }
  };

  const handleSwipeBottom = (cardIndex: number) => {
    console.log('Swiped down on lesson:', cards[cardIndex]?.title);
    safeHapticImpact('light');
    // All swipes move card to back of stack
    if (swiperRef.current) {
      swiperRef.current.swipeBack();
    }
  };

  const handleCardComplete = (cardId: string) => {
    onCardComplete(cardId);
  };

  const handleCardFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  if (cards.length === 0) {
    return (
      <View style={[styles.swiperContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.lessonCard, { backgroundColor: colors.background }]}>
          <View style={styles.cardContent}>
            <Text style={[styles.name, { color: colors.text }]}>
              No Lessons Available
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.swiperContainer, { backgroundColor: colors.background }]}>
      <Swiper
        ref={swiperRef}
        cards={cards}
        key={cards.length}
        renderCard={(lesson) => {
          return lesson ? (
            <LessonCard 
              lesson={lesson}
              stageId={stageId}
              onComplete={() => handleCardComplete(lesson.id)}
              onFlip={() => handleCardFlip(lesson.id)}
              isFlipped={flippedCards.has(lesson.id)}
              colors={colors}
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

export const LessonCardPile: React.FC<LessonCardPileProps> = ({
  cards,
  stageId,
  onCardComplete,
  onDeckComplete,
}) => {
  const theme = useTheme();

  // Get color scheme for the stage - matches archetype patterns
  const getStageColors = (stageId: number) => {
    switch (stageId) {
      case 1:
        return {
          background: '#E3F2FD', // Light blue (matches newsletter)
          ribbon: '#1976D2',     // Blue
          ribbonText: '#FFFFFF', // White
          text: '#0D47A1',       // Dark blue
          stats: '#BBDEFB',      // Light blue
        };
      case 2:
        return {
          background: '#E8F5E8', // Light green (matches podcast)
          ribbon: '#388E3C',     // Green
          ribbonText: '#FFFFFF', // White
          text: '#1B5E20',       // Dark green
          stats: '#C8E6C9',      // Light green
        };
      case 3:
        return {
          background: '#FFF3E0', // Light orange
          ribbon: '#F57C00',     // Orange
          ribbonText: '#FFFFFF', // White
          text: '#E65100',       // Dark orange
          stats: '#FFE0B2',      // Light orange
        };
      default:
        return {
          background: '#F3E5F5', // Light purple
          ribbon: '#9C27B0',     // Purple
          ribbonText: '#FFFFFF', // White
          text: '#4A148C',       // Dark purple
          stats: '#E1BEE7',      // Light purple
        };
    }
  };

  const colors = getStageColors(stageId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.stats }]}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            Stage {stageId} Lessons
          </Text>
          <Text style={[styles.remainingText, { color: colors.text }]}>
            {cards.length} lessons available
          </Text>
        </View>
      </View>

      {/* Card Stack */}
      <LessonCardStack
        cards={cards}
        stageId={stageId}
        onCardComplete={onCardComplete}
        onDeckComplete={onDeckComplete}
        colors={colors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'AustinNewsDeck-Bold',
  },
  remainingText: {
    fontSize: 14,
    fontFamily: 'Graphik-Regular',
    marginTop: 4,
  },
  swiperContainer: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Lesson Card Styles - matches podcast/newsletter archetype exactly
  lessonCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  cardContent: {
    flex: 1,
    position: 'relative',
  },
  // Corner Banner - matches archetype exactly
  cornerLabel: {
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
  cornerLabelText: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
    letterSpacing: 1,
  },
  // Type icon container - matches archetype
  typeIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Lesson number container
  lessonNumberContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  lessonNumber: {
    fontFamily: 'Graphik-Medium',
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Name container - matches archetype
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Name styling - matches archetype
  name: {
    fontFamily: 'AustinNewsDeck-Bold',
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 28,
  },
  // Week badge - matches archetype
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
  // Stats container - matches archetype
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
  lessonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonStats: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  // Audio container
  audioContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },
  // Back of card styles
  backHeader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  backTitle: {
    fontSize: 24,
    fontFamily: 'AustinNewsDeck-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  backDescription: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  descriptionText: {
    fontFamily: 'Graphik-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  lessonBackContent: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  lessonMetadata: {
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metadataLabel: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
  },
  metadataValue: {
    fontFamily: 'Graphik-Bold',
    fontSize: 14,
  },
  tipsContainer: {
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Graphik-Semibold',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    fontFamily: 'Graphik-Regular',
    lineHeight: 20,
    marginBottom: 4,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  completeButtonText: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
  },
});
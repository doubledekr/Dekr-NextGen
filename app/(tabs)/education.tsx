import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEducation } from '../../contexts/EducationContext';
import { cardService, UnifiedCard as UnifiedCardType } from '../../services/CardService';
import { UnifiedCard } from '../../components/UnifiedCard';

const { width } = Dimensions.get('window');

export default function EducationScreen() {
  const { user, stages, loading } = useEducation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [lessonCards, setLessonCards] = useState<UnifiedCardType[]>([]);
  const [loadingLessonCards, setLoadingLessonCards] = useState(true);

  // Load lesson cards
  useEffect(() => {
    const loadLessonCards = async () => {
      try {
        setLoadingLessonCards(true);
        const cards = await cardService.getLessonCards(20); // Load first 20 lesson cards
        setLessonCards(cards);
      } catch (error) {
        console.error('Error loading lesson cards:', error);
      } finally {
        setLoadingLessonCards(false);
      }
    };

    loadLessonCards();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      </View>
    );
  }

  const currentStage = stages.find(stage => stage.id === user.currentStage);
  const completedLessonsCount = user.completedLessons.length;
  const totalLessons = stages.reduce((total, stage) => total + stage.lessons.length, 0);
  const progressPercentage = (completedLessonsCount / totalLessons) * 100;

  const isLessonCompleted = (stageId: number, lessonId: number) => {
    return user.completedLessons.some(
      completed => completed.stageId === stageId && completed.lessonId === lessonId
    );
  };

  const isLessonLocked = (stageId: number, lessonId: number) => {
    // All lessons are now unlocked - users can learn freely
    return false;
  };

  const getStageProgress = (stageId: number) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return 0;
    
    const completedCount = stage.lessons.filter(lesson => 
      isLessonCompleted(stageId, lesson.id)
    ).length;
    
    return (completedCount / stage.lessons.length) * 100;
  };

  const handleLessonPress = (stageId: number, lessonId: number) => {
    // All lessons are accessible - no locking restrictions
    router.push({
      pathname: '/lesson-detail',
      params: { stageId: stageId.toString(), lessonId: lessonId.toString() }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user.firstName}!</Text>
          <Text style={styles.subtitle}>Ready to learn today?</Text>
        </View>
        <View style={styles.xpContainer}>
          <MaterialCommunityIcons name="star" size={24} color="#fbbf24" />
          <Text style={styles.xpText}>{user.xp} XP</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedLessonsCount} of {totalLessons} lessons completed
          </Text>
        </View>

        {/* Current Stage */}
        {currentStage && (
          <View style={styles.currentStageCard}>
            <Text style={styles.cardTitle}>Current Stage</Text>
            <Text style={styles.stageTitle}>{currentStage.title}</Text>
            <Text style={styles.stageDescription}>{currentStage.description}</Text>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => {
                // Scroll to current stage lessons
                const nextLesson = currentStage.lessons.find(lesson => 
                  !isLessonCompleted(currentStage.id, lesson.id)
                );
                if (nextLesson) {
                  handleLessonPress(currentStage.id, nextLesson.id);
                }
              }}
            >
              <Text style={styles.continueButtonText}>Continue Learning</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="fire" size={32} color="#f59e0b" />
            <Text style={styles.statNumber}>{user.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="trophy" size={32} color="#8b5cf6" />
            <Text style={styles.statNumber}>{user.earnedBadges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="school" size={32} color="#10b981" />
            <Text style={styles.statNumber}>{completedLessonsCount}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
        </View>

        {/* Lesson Cards Section */}
        <View style={styles.lessonCardsSection}>
          <Text style={styles.sectionTitle}>Interactive Lessons</Text>
          <Text style={styles.sectionSubtitle}>Swipe through audio lessons with real content</Text>
          
          {loadingLessonCards ? (
            <View style={styles.lessonCardsLoading}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading lesson cards...</Text>
            </View>
          ) : lessonCards.length > 0 ? (
            <View style={styles.lessonCardsContainer}>
              {lessonCards.slice(0, 3).map((card, index) => (
                <View key={card.id} style={styles.lessonCardWrapper}>
                  <UnifiedCard data={card} />
                </View>
              ))}
              {lessonCards.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => {
                    // Navigate to a dedicated lesson cards screen
                    router.push('/lesson-cards');
                  }}
                >
                  <Text style={styles.viewAllButtonText}>
                    View All {lessonCards.length} Lessons
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#2563eb" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noLessonCards}>
              <MaterialCommunityIcons name="school" size={48} color="#9ca3af" />
              <Text style={styles.noLessonCardsText}>No lesson cards available</Text>
            </View>
          )}
        </View>

        {/* Learning Path Decks */}
        <View style={styles.stagesContainer}>
          <Text style={styles.sectionTitle}>Learning Path Decks</Text>
          <Text style={styles.sectionSubtitle}>Master financial concepts through structured learning decks</Text>
          
          {stages.map((stage) => {
            const progress = getStageProgress(stage.id);
            const completedCount = stage.lessons.filter(lesson => 
              isLessonCompleted(stage.id, lesson.id)
            ).length;
            const totalDuration = stage.lessons.reduce((total, lesson) => total + lesson.duration, 0);
            const totalXP = stage.lessons.reduce((total, lesson) => total + lesson.xpReward, 0);
            const audioLessons = stage.lessons.filter(lesson => 
              lesson.content.some(c => c.type === 'audio')
            ).length;

            // Get stage colors
            const getStageColors = (stageId: number) => {
              switch (stageId) {
                case 1:
                  return {
                    background: '#E3F2FD',
                    ribbon: '#1976D2',
                    ribbonText: '#FFFFFF',
                    text: '#0D47A1',
                    stats: '#BBDEFB',
                  };
                case 2:
                  return {
                    background: '#E8F5E8',
                    ribbon: '#388E3C',
                    ribbonText: '#FFFFFF',
                    text: '#1B5E20',
                    stats: '#C8E6C9',
                  };
                case 3:
                  return {
                    background: '#FFF3E0',
                    ribbon: '#F57C00',
                    ribbonText: '#FFFFFF',
                    text: '#E65100',
                    stats: '#FFE0B2',
                  };
                default:
                  return {
                    background: '#F3E5F5',
                    ribbon: '#9C27B0',
                    ribbonText: '#FFFFFF',
                    text: '#4A148C',
                    stats: '#E1BEE7',
                  };
              }
            };

            const colors = getStageColors(stage.id);

            return (
              <View key={stage.id} style={styles.cardPileContainer}>
                {/* Card Pile - shows 3-4 cards stacked */}
                <TouchableOpacity
                  style={styles.cardPileWrapper}
                  onPress={() => {
                    router.push({
                      pathname: '/StageDeckScreen',
                      params: { stageId: stage.id.toString() }
                    });
                  }}
                >
                  {/* Background cards (2-3 cards behind) */}
                  {[1, 2, 3].map((offset) => (
                    <View
                      key={`bg-${stage.id}-${offset}`}
                      style={[
                        styles.cardBackground,
                        {
                          transform: [
                            { translateY: offset * 4 },
                            { scale: 1 - offset * 0.05 },
                          ],
                          zIndex: 10 - offset,
                        },
                      ]}
                    >
                      <View style={[styles.stageCardArchetype, { backgroundColor: colors.background }]}>
                        <View style={styles.cardContent}>
                          {/* Corner Banner */}
                          <View style={[styles.cornerLabel, { backgroundColor: colors.ribbon }]}>
                            <Text style={[styles.cornerLabelText, { color: colors.ribbonText }]}>
                              STAGE {stage.id}
                            </Text>
                          </View>

                          {/* Type Icon */}
                          <View style={styles.typeIconContainer}>
                            <MaterialCommunityIcons
                              name="school"
                              size={32}
                              color={colors.text}
                            />
                          </View>

                          {/* Title */}
                          <View style={styles.nameContainer}>
                            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
                              {stage.title}
                            </Text>
                          </View>

                          {/* Description badge */}
                          <View style={styles.weekBadge}>
                            <Text style={[styles.weekText, { color: colors.text }]}>
                              {stage.description}
                            </Text>
                          </View>

                          {/* Progress section */}
                          <View style={styles.progressSection}>
                            <View style={styles.progressRow}>
                              <Text style={[styles.progressText, { color: colors.text }]}>
                                {Math.round(progress)}% Complete
                              </Text>
                              <Text style={[styles.progressText, { color: colors.text }]}>
                                {completedCount} of {stage.lessons.length} lessons
                              </Text>
                            </View>
                            <View style={[styles.progressBar, { backgroundColor: colors.stats }]}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { 
                                    width: `${progress}%`,
                                    backgroundColor: colors.ribbon
                                  }
                                ]} 
                              />
                            </View>
                          </View>

                          {/* Stats container */}
                          <View style={[styles.statsContainer, { backgroundColor: colors.stats }]}>
                            <View style={styles.stageInfo}>
                              <MaterialCommunityIcons name="clock" size={20} color={colors.text} />
                              <Text style={[styles.stageStats, { color: colors.text }]}>
                                {totalDuration} min total
                              </Text>
                              <MaterialCommunityIcons name="cards" size={20} color={colors.text} />
                              <Text style={[styles.stageStats, { color: colors.text }]}>
                                {stage.lessons.length} lessons
                              </Text>
                              <MaterialCommunityIcons name="star" size={20} color="#fbbf24" />
                              <Text style={[styles.stageStats, { color: colors.text }]}>
                                {totalXP} XP
                              </Text>
                              <MaterialCommunityIcons name="headphones" size={20} color={colors.text} />
                              <Text style={[styles.stageStats, { color: colors.text }]}>
                                {audioLessons} with audio
                              </Text>
                            </View>
                          </View>

                          {/* Action Button */}
                          <TouchableOpacity 
                            style={[styles.startButton, { backgroundColor: colors.ribbon }]}
                            onPress={() => {
                              router.push({
                                pathname: '/StageDeckScreen',
                                params: { stageId: stage.id.toString() }
                              });
                            }}
                          >
                            <MaterialCommunityIcons name="play" size={20} color={colors.ribbonText} />
                            <Text style={[styles.startButtonText, { color: colors.ribbonText }]}>
                              Start Learning Deck
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </TouchableOpacity>

                {/* Stage Info Below Pile */}
                <View style={styles.stageInfoContainer}>
                  <Text style={[styles.stageInfoTitle, { color: colors.text }]}>
                    {stage.title}
                  </Text>
                  <Text style={[styles.stageInfoDescription, { color: colors.text }]}>
                    {stage.description}
                  </Text>
                  <View style={styles.stageInfoStats}>
                    <View style={styles.stageInfoStat}>
                      <MaterialCommunityIcons name="cards" size={16} color={colors.text} />
                      <Text style={[styles.stageInfoStatText, { color: colors.text }]}>
                        {stage.lessons.length} lessons
                      </Text>
                    </View>
                    <View style={styles.stageInfoStat}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color={colors.text} />
                      <Text style={[styles.stageInfoStatText, { color: colors.text }]}>
                        {totalDuration} min total
                      </Text>
                    </View>
                    <View style={styles.stageInfoStat}>
                      <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
                      <Text style={[styles.stageInfoStatText, { color: colors.text }]}>
                        {totalXP} XP
                      </Text>
                    </View>
                    <View style={styles.stageInfoStat}>
                      <MaterialCommunityIcons name="headphones" size={16} color={colors.text} />
                      <Text style={[styles.stageInfoStatText, { color: colors.text }]}>
                        {audioLessons} with audio
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    fontFamily: 'Graphik-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#536B31',
    fontFamily: 'AustinNewsDeck-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'Graphik-Regular',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#536B31',
    marginLeft: 6,
    fontFamily: 'Graphik-Semibold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#536B31',
    marginBottom: 12,
    fontFamily: 'Graphik-Semibold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Graphik-Regular',
  },
  currentStageCard: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    fontFamily: 'Graphik-Semibold',
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#536B31',
    marginBottom: 8,
    fontFamily: 'AustinNewsDeck-Bold',
  },
  stageDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 24,
    fontFamily: 'Graphik-Regular',
  },
  continueButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'Graphik-Semibold',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#536B31',
    marginTop: 8,
    fontFamily: 'AustinNewsDeck-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Graphik-Regular',
  },
  stagesContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#536B31',
    marginBottom: 16,
    fontFamily: 'AustinNewsDeck-Bold',
  },
  stageContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stageHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stageInfo: {
    marginBottom: 12,
  },
  stageCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#536B31',
    marginBottom: 4,
    fontFamily: 'AustinNewsDeck-Bold',
  },
  stageCardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontFamily: 'Graphik-Regular',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginLeft: 8,
  },
  stageProgressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  lessonsContainer: {
    padding: 16,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  lessonCardCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  lessonIcon: {
    marginRight: 16,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#536B31',
    marginBottom: 4,
    fontFamily: 'Graphik-Semibold',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: 'Graphik-Regular',
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontFamily: 'Graphik-Regular',
  },
  lessonCardsSection: {
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    fontFamily: 'Graphik-Regular',
  },
  lessonCardsLoading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  lessonCardsContainer: {
    gap: 12,
  },
  lessonCardWrapper: {
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginRight: 8,
    fontFamily: 'Graphik-Semibold',
  },
  noLessonCards: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noLessonCardsText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    fontFamily: 'Graphik-Regular',
  },
  // Archetype Stage Card Styles - matches podcast/newsletter exactly
  stageCardArchetype: {
    width: Math.min(width * 0.9, 380),
    height: Math.min(Math.min(width * 0.9, 380) * 1.5, Dimensions.get('window').height * 0.65),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 20,
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
  // Name container - matches archetype
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
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
    top: 120,
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
    textAlign: 'center',
  },
  // Progress section
  progressSection: {
    position: 'absolute',
    top: 160,
    left: 20,
    right: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  // Stats container - matches archetype
  statsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 16,
  },
  stageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  stageStats: {
    fontFamily: 'Graphik-Medium',
    fontSize: 12,
    fontWeight: '500',
  },
  // Start button
  startButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
    fontWeight: '600',
  },
  // Card Pile Container Styles
  cardPileContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  cardPileWrapper: {
    position: 'relative',
    height: Math.min(Math.min(width * 0.9, 380) * 1.5, Dimensions.get('window').height * 0.65) + 20,
    width: Math.min(width * 0.9, 380) + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackground: {
    position: 'absolute',
    width: Math.min(width * 0.9, 380),
    height: Math.min(Math.min(width * 0.9, 380) * 1.5, Dimensions.get('window').height * 0.65),
  },
  // Stage Info Below Pile
  stageInfoContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  stageInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'AustinNewsDeck-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stageInfoDescription: {
    fontSize: 14,
    fontFamily: 'Graphik-Regular',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  stageInfoStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  stageInfoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stageInfoStatText: {
    fontSize: 12,
    fontFamily: 'Graphik-Medium',
  },
});
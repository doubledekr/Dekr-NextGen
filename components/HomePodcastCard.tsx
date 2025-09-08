import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, TouchableOpacity, Image, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Icon, useTheme } from 'react-native-paper';
import { safeHapticImpact } from '../utils/haptics';
import Animated, { interpolate, useAnimatedStyle, withTiming, useSharedValue, withSpring } from 'react-native-reanimated';
import { VectorBadge } from './VectorBadge';
import { useRouter } from 'expo-router';
import { logEvent, AnalyticsEvents } from '../services/analytics';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { homePodcastService, PodcastData } from '../services/HomePodcastService';
import ReactNativeAudioPlayer from './ReactNativeAudioPlayer';
import WebAudioPlayer from './WebAudioPlayer';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.9, 380);
const CARD_HEIGHT = Math.min(CARD_WIDTH * 1.5, height * 0.65);

interface HomePodcastCardProps {
  onPlay?: (audioUrl: string) => void;
  onGenerate?: () => void;
  onSwipeAway?: () => void;
}

export function HomePodcastCard({ onPlay, onGenerate, onSwipeAway }: HomePodcastCardProps) {
  const spin = useSharedValue(0);
  const [weeklyPodcast, setWeeklyPodcast] = useState<PodcastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const theme = useTheme();
  const router = useRouter();

  // Podcast card colors
  const colors = {
    background: '#E8F5E8',
    ribbon: '#388E3C',
    ribbonText: '#FFFFFF',
    text: '#1B5E20',
    stats: '#C8E6C9',
  };

  useEffect(() => {
    loadWeeklyPodcast();
  }, []);

  const loadWeeklyPodcast = async () => {
    try {
      setIsLoading(true);
      const podcast = await homePodcastService.getOrGenerateWeeklyPodcast();
      
      // Use the provided podcast file (no generation needed)
      setWeeklyPodcast(podcast);
      console.log('✅ Loaded provided weekly podcast for home card:', podcast.title, 'Audio URL:', podcast.audioUrl);
    } catch (error) {
      console.error('Error loading weekly podcast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyPodcast = async () => {
    try {
      setIsGenerating(true);
      console.log('🎙️ Reloading provided weekly podcast...');
      
      // Just reload the provided podcast (no generation)
      await loadWeeklyPodcast();
      
      console.log('✅ Reloaded provided weekly podcast');
      
      // Log reload event
      logEvent(AnalyticsEvents.CREATE_PODCAST, {
        type: 'weekly',
        timestamp: new Date().toISOString(),
      });
      
      onGenerate?.();
    } catch (error) {
      console.error('Error reloading weekly podcast:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playPodcast = async () => {
    try {
      if (isPlaying && sound) {
        // Pause if playing
        await sound.pauseAsync();
        setIsPlaying(false);
        console.log('⏸️ Podcast paused');
      } else if (sound) {
        // Resume if paused
        await sound.playAsync();
        setIsPlaying(true);
        console.log('▶️ Podcast resumed');
      } else {
        // Load and play for the first time
        console.log('🎵 Loading podcast audio...');
        
        // Get the audio asset
        const audioAsset = require('../assets/podcast/weekly-podcast.mp3');
        console.log('🔊 Audio asset loaded:', typeof audioAsset, audioAsset);
        
        // Create sound object
        const { sound: newSound } = await Audio.Sound.createAsync(audioAsset, {
          shouldPlay: true,
        });
        
        // Set up status listener
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setSound(null);
            }
          }
        });
        
        setSound(newSound);
        setIsPlaying(true);
        console.log('✅ Podcast started playing');
      }
    } catch (error) {
      console.error('❌ Error playing podcast:', error);
      setIsPlaying(false);
    }
  };

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${spinVal}deg` },
      ],
      backgroundColor: spinVal < 90 ? colors.background : 'transparent',
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${spinVal}deg` },
      ],
      backgroundColor: spinVal > 270 ? colors.background : 'transparent',
      backfaceVisibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  const handlePress = () => {
    safeHapticImpact();
    spin.value = withTiming(spin.value ? 0 : 1, { duration: 500 });
    
    // Log card view event
    logEvent(AnalyticsEvents.VIEW_CARD, {
      card_id: 'weekly-podcast',
      card_type: 'podcast',
      symbol: 'PODCAST',
    });
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderFront = () => (
    <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
      <View style={styles.cardContent}>
        <View style={[styles.cornerLabel, { backgroundColor: colors.ribbon }]}>
          <Text style={[styles.cornerLabelText, { color: colors.ribbonText }]}>
            PODCAST
          </Text>
        </View>

        {/* Podcast icon */}
        <View style={styles.typeIconContainer}>
          <MaterialCommunityIcons
            name="podcast"
            size={32}
            color={colors.text}
          />
        </View>

        {/* Title */}
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={3}>
            {weeklyPodcast ? weeklyPodcast.title : 'Weekly Community Podcast'}
          </Text>
        </View>

        {/* Week badge */}
        <View style={styles.weekBadge}>
          <Text style={[styles.weekText, { color: colors.text }]}>
            {weeklyPodcast ? `Week of ${weeklyPodcast.weekOf}` : 'Fridays'}
          </Text>
        </View>

        {/* Stats container */}
        <View style={[styles.statsContainer, { backgroundColor: colors.stats }]}>
          <View style={styles.podcastInfo}>
            {weeklyPodcast ? (
              <>
                <MaterialCommunityIcons name="clock" size={20} color={colors.text} />
                <Text style={[styles.podcastWeek, { color: colors.text }]}>
                  {formatDuration(weeklyPodcast.duration)}
                </Text>
                <MaterialCommunityIcons name="newspaper" size={20} color={colors.text} />
                <Text style={[styles.podcastWeek, { color: colors.text }]}>
                  {weeklyPodcast.dataSources.newsCount} news
                </Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="play-circle" size={24} color={colors.text} />
                <Text style={[styles.podcastWeek, { color: colors.text }]}>
                  Community Highlights
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderBack = () => (
    <Animated.View style={[styles.cardFace, backAnimatedStyle]}>
      <ScrollView 
        style={styles.cardContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.scrollableCardContent}
      >
        <View style={[styles.backHeader, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.backTitle, { color: colors.text }]}>
            {weeklyPodcast ? weeklyPodcast.title : 'Weekly Community Podcast'}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading weekly podcast...
            </Text>
          </View>
        ) : weeklyPodcast ? (
          <>
            <View style={[styles.backDescription, { backgroundColor: colors.stats }]}>
              <Text style={[styles.descriptionText, { color: colors.text }]}>
                {weeklyPodcast.description || `This week's community podcast features ${weeklyPodcast.dataSources.topPerformers} top performers, analysis of ${weeklyPodcast.dataSources.stockCount} stocks and ${weeklyPodcast.dataSources.cryptoCount} crypto assets, and insights from ${weeklyPodcast.dataSources.newsCount} news articles.`}
              </Text>
            </View>

            <View style={[styles.podcastBackContent, { backgroundColor: colors.background }]}>
              <View style={styles.podcastMetadata}>
                <View style={styles.metadataRow}>
                  <Text style={[styles.metadataLabel, { color: colors.text }]}>Week</Text>
                  <Text style={[styles.metadataValue, { color: colors.text }]}>
                    {weeklyPodcast.weekOf}
                  </Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={[styles.metadataLabel, { color: colors.text }]}>Duration</Text>
                  <Text style={[styles.metadataValue, { color: colors.text }]}>
                    {formatDuration(weeklyPodcast.duration)}
                  </Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={[styles.metadataLabel, { color: colors.text }]}>Created</Text>
                  <Text style={[styles.metadataValue, { color: colors.text }]}>
                    {formatDate(weeklyPodcast.createdAt)}
                  </Text>
                </View>
              </View>
              
              {weeklyPodcast.audioUrl && (
                <TouchableOpacity 
                  style={[styles.playButton, { backgroundColor: colors.ribbon }]}
                  onPress={() => {
                    playPodcast();
                    logEvent(AnalyticsEvents.PLAY_PODCAST, {
                      podcast_id: weeklyPodcast.id,
                      type: 'weekly',
                    });
                  }}
                >
                  <MaterialCommunityIcons 
                    name={isPlaying ? "pause" : "play"} 
                    size={20} 
                    color={colors.ribbonText} 
                  />
                  <Text style={[styles.playButtonText, { color: colors.ribbonText }]}>
                    {isPlaying ? "Pause Podcast" : "Play Podcast"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={[styles.backDescription, { backgroundColor: colors.stats }]}>
              <Text style={[styles.descriptionText, { color: colors.text }]}>
                Join us every Friday for the Dekr Weekly Community Podcast! We'll cover the week's top news, 
                celebrate community achievements, and share smart investing insights.
              </Text>
            </View>

            <View style={[styles.podcastBackContent, { backgroundColor: colors.background }]}>
              <View style={styles.features}>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons name="newspaper" size={16} color={colors.text} />
                  <Text style={[styles.featureText, { color: colors.text }]}>
                    Top News & Market Events
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons name="account-group" size={16} color={colors.text} />
                  <Text style={[styles.featureText, { color: colors.text }]}>
                    Community Highlights
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons name="school" size={16} color={colors.text} />
                  <Text style={[styles.featureText, { color: colors.text }]}>
                    Smart Investing Tips
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.generateButton, { backgroundColor: colors.ribbon }]}
                onPress={generateWeeklyPodcast}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color={colors.ribbonText} />
                ) : (
                  <MaterialCommunityIcons name="refresh" size={20} color={colors.ribbonText} />
                )}
                <Text style={[styles.generateButtonText, { color: colors.ribbonText }]}>
                  {isGenerating ? 'Generating...' : 'Generate Podcast'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Created date */}
        <View style={styles.createdDateContainer}>
          <Text style={[styles.createdDate, { color: colors.text }]}>
            {weeklyPodcast ? `Created: ${formatDate(weeklyPodcast.createdAt)}` : 'Tap to generate your first podcast'}
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );

  return (
    <View style={styles.cardWrapper}>
      <Pressable 
        style={[
          styles.container,
          {
            backgroundColor: colors.background + '00',
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }
        ]} 
        onPress={handlePress}
      >
        {renderFront()}
        {renderBack()}
      </Pressable>
      
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
  },
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative',
  },
  audioPlayerContainer: {
    position: 'absolute',
    top: CARD_HEIGHT + 10,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  audioPlayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  audioPlayerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  cardFace: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    position: 'relative',
  },
  scrollableCardContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  cornerLabel: {
    position: 'absolute',
    top: 25,
    left: -48,
    backgroundColor: '#388E3C',
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
  },
  cornerLabelText: {
    color: '#FFFFFF',
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
    letterSpacing: 1,
  },
  typeIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  name: {
    fontFamily: 'AustinNewsDeck-Bold',
    fontSize: 24,
    color: '#1B5E20',
    textAlign: 'center',
  },
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
  statsContainer: {
    backgroundColor: '#C8E6C9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
  },
  podcastInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  podcastWeek: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
  },
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
  podcastBackContent: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  podcastMetadata: {
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
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  playButtonText: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
  },
  features: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
  },
  createdDateContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  createdDate: {
    fontFamily: 'Graphik-Regular',
    fontSize: 12,
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

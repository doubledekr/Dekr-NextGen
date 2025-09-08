import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import { UnifiedCard } from '../../services/CardService';
import { safeHapticImpact } from '../../utils/haptics';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { engagementTracker, CardType, InteractionAction } from '../../services/EngagementTracker';
import { useAuth } from '../../src/hooks/useAuth';

interface LessonCardProps {
  data: UnifiedCard;
  onPlay?: () => void;
  onComplete?: () => void;
  position?: number; // Position in feed for tracking
}

export function LessonCard({ data, onPlay, onComplete, position = 0 }: LessonCardProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Engagement tracking
  const viewStartTime = useRef<number | null>(null);
  const hasTrackedView = useRef(false);

  // Track card view start
  useEffect(() => {
    if (user && !hasTrackedView.current) {
      viewStartTime.current = Date.now();
      engagementTracker.trackCardViewStart(data.id);
      
      // Track view interaction
      engagementTracker.trackCardInteraction(
        user.uid,
        data.id,
        'lesson',
        'view',
        {
          position,
          timeSpent: 0,
          sessionId: engagementTracker.getSessionContext().sessionId
        }
      );
      
      hasTrackedView.current = true;
    }

    // Cleanup: track view end when component unmounts
    return () => {
      if (user && viewStartTime.current) {
        const timeSpent = engagementTracker.trackCardViewEnd(data.id);
        
        // Update the view interaction with actual time spent
        engagementTracker.trackCardInteraction(
          user.uid,
          data.id,
          'lesson',
          'view',
          {
            position,
            timeSpent,
            sessionId: engagementTracker.getSessionContext().sessionId
          }
        );
      }
    };
  }, [user, data.id, position]);

  const handlePlay = () => {
    safeHapticImpact();
    setIsPlaying(!isPlaying);
    
    // Track play interaction
    if (user) {
      engagementTracker.trackCardInteraction(
        user.uid,
        data.id,
        'lesson',
        'play',
        {
          position,
          timeSpent: viewStartTime.current ? Date.now() - viewStartTime.current : 0,
          sessionId: engagementTracker.getSessionContext().sessionId
        }
      );
    }
    
    onPlay?.();
  };

  const handleComplete = () => {
    safeHapticImpact();
    setIsCompleted(true);
    
    // Track completion interaction
    if (user) {
      engagementTracker.trackCardInteraction(
        user.uid,
        data.id,
        'lesson',
        'complete',
        {
          position,
          timeSpent: viewStartTime.current ? Date.now() - viewStartTime.current : 0,
          sessionId: engagementTracker.getSessionContext().sessionId
        }
      );
    }
    
    onComplete?.();
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'star-outline';
      case 'intermediate':
        return 'star-half-full';
      case 'advanced':
        return 'star';
      default:
        return 'star-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeIndicator}>
          <MaterialCommunityIcons name="school" size={20} color="#1976D2" />
          <Text style={styles.typeText}>LESSON</Text>
        </View>
        <View style={styles.stageBadge}>
          <Text style={styles.stageText}>Stage {data.metadata.stage}</Text>
        </View>
      </View>

      {/* Image */}
      {data.imageUrl && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: data.imageUrl }} style={styles.image} resizeMode="cover" />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {data.title}
        </Text>
        <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]} numberOfLines={3}>
          {data.description}
        </Text>

        {/* Difficulty and Stage */}
        <View style={styles.metadata}>
          <View style={styles.difficultyContainer}>
            <MaterialCommunityIcons
              name={getDifficultyIcon(data.metadata.difficulty) as any}
              size={16}
              color={getDifficultyColor(data.metadata.difficulty)}
            />
            <Text style={[styles.difficultyText, { color: getDifficultyColor(data.metadata.difficulty) }]}>
              {data.metadata.difficulty?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
        </View>

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {data.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={[styles.tagText, { color: theme.colors.onPrimaryContainer }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {data.contentUrl && (
          <TouchableOpacity
            style={[
              styles.playButton,
              { backgroundColor: isPlaying ? theme.colors.error : theme.colors.primary }
            ]}
            onPress={handlePlay}
          >
            <MaterialCommunityIcons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="white"
            />
            <Text style={styles.playButtonText}>
              {isPlaying ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>
        )}

        {!isCompleted && (
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: theme.colors.secondary }]}
            onPress={handleComplete}
          >
            <MaterialCommunityIcons name="check" size={20} color="white" />
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <View style={[styles.completedBadge, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="check-circle" size={20} color="white" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>

      {/* Engagement Stats */}
      <View style={styles.engagement}>
        <View style={styles.engagementItem}>
          <MaterialCommunityIcons name="eye" size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.engagementText, { color: theme.colors.onSurfaceVariant }]}>
            {data.engagement.views}
          </Text>
        </View>
        <View style={styles.engagementItem}>
          <MaterialCommunityIcons name="bookmark" size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.engagementText, { color: theme.colors.onSurfaceVariant }]}>
            {data.engagement.saves}
          </Text>
        </View>
        <View style={styles.engagementItem}>
          <MaterialCommunityIcons name="share" size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.engagementText, { color: theme.colors.onSurfaceVariant }]}>
            {data.engagement.shares}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976D2',
    letterSpacing: 0.5,
  },
  stageBadge: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    height: 120,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    marginBottom: 12,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  completedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  engagement: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    fontSize: 12,
  },
});
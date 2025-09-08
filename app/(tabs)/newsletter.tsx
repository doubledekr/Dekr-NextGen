import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Title,
  Paragraph,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Newsletter, newsletterService } from '../../services/NewsletterService';
import { useAppSelector } from '../../store/hooks';
import { safeHapticImpact } from '../../utils/haptics';
import { NewsletterCardStack } from '../../components/newsletter/NewsletterCardStack';

export default function NewsletterScreen() {
  const theme = useTheme();
  const { user } = useAppSelector((state: any) => state.auth);
  
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNewsletters();
  }, [user]);

  const loadNewsletters = async () => {
    try {
      setIsLoading(true);
      const recentNewsletters = await newsletterService.getRecentNewsletters();
      setNewsletters(recentNewsletters);
    } catch (error) {
      console.error('Error loading newsletters:', error);
      Alert.alert('Error', 'Failed to load newsletters');
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

  if (newsletters.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
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
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Newsletter Card Stack */}
        <NewsletterCardStack 
          newsletters={newsletters}
          onNewsletterAction={handleNewsletterAction}
        />
      </ScrollView>
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
});

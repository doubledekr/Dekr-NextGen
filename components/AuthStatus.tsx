import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { router } from 'expo-router';
import { checkAuthStatus } from '../utils/authUtils';

export function AuthStatus() {
  const theme = useTheme();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium">Checking authentication...</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>Authentication Status</Text>
        
        <View style={styles.statusRow}>
          <Text variant="bodyMedium">Status: </Text>
          <Text 
            variant="bodyMedium" 
            style={[
              styles.statusText, 
              { color: isAuthenticated ? theme.colors.primary : theme.colors.error }
            ]}
          >
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Text>
        </View>

        {user && (
          <>
            <View style={styles.statusRow}>
              <Text variant="bodyMedium">User ID: </Text>
              <Text variant="bodySmall" style={styles.userId}>{user.uid}</Text>
            </View>
            
            <View style={styles.statusRow}>
              <Text variant="bodyMedium">Email: </Text>
              <Text variant="bodySmall">{user.email}</Text>
            </View>
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button 
            mode="text" 
            onPress={checkAuthStatus}
            style={styles.button}
            icon="information"
          >
            Check Auth Status
          </Button>
          
          {!isAuthenticated ? (
            <Button 
              mode="contained" 
              onPress={() => router.push('/auth/sign-in')}
              style={styles.button}
            >
              Sign In
            </Button>
          ) : (
            <Button 
              mode="outlined" 
              onPress={() => router.push('/(tabs)/settings')}
              style={styles.button}
            >
              Go to Settings
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  statusText: {
    fontWeight: 'bold',
  },
  userId: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginTop: 8,
  },
});

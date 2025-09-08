// Minimal Firebase Configuration for MVP
// This keeps essential Firebase functionality while disabling complex features

import { Platform } from 'react-native';

// Platform-aware imports
let auth: any;
let firestore: any;
let GoogleSignin: any;
let statusCodes: any;
let FirebaseAuthTypes: any;

// Check if we're running in Expo Go (which doesn't support native Firebase modules)
const isExpoGo = typeof global.__expo !== 'undefined' && global.__expo?.modules?.ExpoGo;

if (Platform.OS === 'web' || isExpoGo) {
  // Use Firebase Web SDK for web platform
  const { getAuth, connectAuthEmulator } = require('firebase/auth');
  const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
  const { initializeApp, getApps, getApp } = require('firebase/app');
  
  // Firebase configuration for dekr-nextgen project
  const firebaseConfig = {
    apiKey: "AIzaSyBsOes01Lnp2leFMN_qJbk-_X6nZIlHvBU",
    authDomain: "dekr-nextgen.firebaseapp.com",
    projectId: "dekr-nextgen",
    storageBucket: "dekr-nextgen.appspot.com",
    messagingSenderId: "152969284019",
    appId: "1:152969284019:web:8c2a1d6a7d6a48c52623c6",
    measurementId: "G-4TB90WRQ97"
  };

  // Initialize Firebase
  let app;
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  firestore = getFirestore(app);
  
  // Simplified Google Sign-In for web (disabled for MVP)
  GoogleSignin = {
    configure: () => {},
    signIn: () => Promise.reject(new Error('Google Sign-In disabled for MVP')),
    getCurrentUser: () => Promise.resolve(null),
    getTokens: () => Promise.resolve({ idToken: null }),
    revokeAccess: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    hasPlayServices: () => Promise.resolve(true)
  };
  
  statusCodes = {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE'
  };
  
  FirebaseAuthTypes = {
    User: class MockUser {
      uid: string;
      email: string | null;
      displayName: string | null;
      photoURL: string | null;
      emailVerified: boolean;
      isAnonymous: boolean;
      metadata: any;
      
      constructor(userData: any) {
        this.uid = userData.uid;
        this.email = userData.email;
        this.displayName = userData.displayName;
        this.photoURL = userData.photoURL;
        this.emailVerified = userData.emailVerified;
        this.isAnonymous = userData.isAnonymous;
        this.metadata = userData.metadata;
      }
    }
  };
} else {
  // Use React Native Firebase for native platforms
  try {
    const authModule = require('@react-native-firebase/auth');
    const firestoreModule = require('@react-native-firebase/firestore');
    const googleSigninModule = require('@react-native-google-signin/google-signin');
    
    auth = authModule.default();
    firestore = firestoreModule.default();
    GoogleSignin = googleSigninModule.default;
    statusCodes = googleSigninModule.statusCodes;
    FirebaseAuthTypes = authModule.FirebaseAuthTypes;
  } catch (error) {
    console.warn('Native Firebase modules not available, using web fallback');
    // Fallback to web SDK
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { initializeApp } = require('firebase/app');
    
    const firebaseConfig = {
      apiKey: "AIzaSyBsOes01Lnp2leFMN_qJbk-_X6nZIlHvBU",
      authDomain: "dekr-nextgen.firebaseapp.com",
      projectId: "dekr-nextgen",
      storageBucket: "dekr-nextgen.appspot.com",
      messagingSenderId: "152969284019",
      appId: "1:152969284019:web:8c2a1d6a7d6a48c52623c6",
      measurementId: "G-4TB90WRQ97"
    };
    
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
    
    GoogleSignin = {
      configure: () => {},
      signIn: () => Promise.reject(new Error('Google Sign-In disabled for MVP')),
      getCurrentUser: () => Promise.resolve(null),
      getTokens: () => Promise.resolve({ idToken: null }),
      revokeAccess: () => Promise.resolve(),
      signOut: () => Promise.resolve(),
      hasPlayServices: () => Promise.resolve(true)
    };
    
    statusCodes = {
      SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
      IN_PROGRESS: 'IN_PROGRESS',
      PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE'
    };
    
    FirebaseAuthTypes = {
      User: class MockUser {
        uid: string;
        email: string | null;
        displayName: string | null;
        photoURL: string | null;
        emailVerified: boolean;
        isAnonymous: boolean;
        metadata: any;
        
        constructor(userData: any) {
          this.uid = userData.uid;
          this.email = userData.email;
          this.displayName = userData.displayName;
          this.photoURL = userData.photoURL;
          this.emailVerified = userData.emailVerified;
          this.isAnonymous = userData.isAnonymous;
          this.metadata = userData.metadata;
        }
      }
    };
  }
}

// Essential Firebase Functions for MVP
export const signInWithEmail = async (email: string, password: string) => {
  try {
    if (Platform.OS === 'web' || isExpoGo) {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      return await signInWithEmailAndPassword(auth, email, password);
    } else {
      return await auth.signInWithEmailAndPassword(email, password);
    }
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    if (Platform.OS === 'web' || isExpoGo) {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      return await createUserWithEmailAndPassword(auth, email, password);
    } else {
      return await auth.createUserWithEmailAndPassword(email, password);
    }
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    if (Platform.OS === 'web' || isExpoGo) {
      const { signOut: webSignOut } = require('firebase/auth');
      return await webSignOut(auth);
    } else {
      return await auth.signOut();
    }
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Simplified Google Sign-In (disabled for MVP)
export const signInWithGoogle = async () => {
  throw new Error('Google Sign-In is disabled for MVP. Please use email/password authentication.');
};

export const signInWithGoogleFallback = async () => {
  throw new Error('Google Sign-In is disabled for MVP. Please use email/password authentication.');
};

export const checkGooglePlayServices = async () => {
  return Promise.resolve(true);
};

export const clearGoogleSignInData = async () => {
  return Promise.resolve();
};

export const checkIOSGoogleSignInConfig = async () => {
  return Promise.resolve(true);
};

// Demo user sign-in for testing
export const signInAsDemoUser = async () => {
  try {
    return await signInWithEmail('demo@dekr.app', 'demo123');
  } catch (error) {
    // If demo user doesn't exist, create it
    try {
      await signUpWithEmail('demo@dekr.app', 'demo123');
      return await signInWithEmail('demo@dekr.app', 'demo123');
    } catch (createError) {
      console.error('Error creating demo user:', createError);
      throw createError;
    }
  }
};

// Watchlist functions (simplified for MVP)
export const saveToWatchlist = async (userId: string, item: any) => {
  try {
    if (Platform.OS === 'web' || isExpoGo) {
      const { doc, setDoc, collection } = require('firebase/firestore');
      const watchlistRef = doc(firestore, 'users', userId, 'watchlist', item.id);
      await setDoc(watchlistRef, {
        ...item,
        addedAt: new Date().toISOString()
      });
    } else {
      await firestore.collection('users').doc(userId).collection('watchlist').doc(item.id).set({
        ...item,
        addedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error saving to watchlist:', error);
    throw error;
  }
};

export const loadWatchlist = async (userId: string) => {
  try {
    if (Platform.OS === 'web' || isExpoGo) {
      const { collection, getDocs, query, orderBy } = require('firebase/firestore');
      const watchlistRef = collection(firestore, 'users', userId, 'watchlist');
      const q = query(watchlistRef, orderBy('addedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const snapshot = await firestore.collection('users').doc(userId).collection('watchlist')
        .orderBy('addedAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.error('Error loading watchlist:', error);
    return [];
  }
};

export const removeFromWatchlist = async (itemId: string) => {
  try {
    // This would need the userId, but for MVP we'll handle it in the component
    console.log('Remove from watchlist:', itemId);
    return Promise.resolve();
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    if (Platform.OS === 'web' || isExpoGo) {
      const { sendPasswordResetEmail } = require('firebase/auth');
      return await sendPasswordResetEmail(auth, email);
    } else {
      return await auth.sendPasswordResetEmail(email);
    }
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Export Firebase services
export { auth, firestore, GoogleSignin, statusCodes, FirebaseAuthTypes };

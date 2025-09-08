// Minimal Firebase Platform Service for MVP
// This provides essential Firebase functionality while keeping the same interface

import { Platform } from 'react-native';
import { auth, firestore } from './firebase-mvp';

export let auth: any;
export let firestore: any;

if (Platform.OS === 'web') {
  // Use web Firebase SDK for web platform
  try {
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    
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
    auth = () => getAuth(app);
    firestore = () => getFirestore(app);
    console.log('✅ Using web Firebase services for MVP');
  } catch (error) {
    console.log('⚠️ Web Firebase not available, using fallback services');
    // Fallback to basic auth/firestore from firebase-mvp
    auth = () => require('./firebase-mvp').auth;
    firestore = () => require('./firebase-mvp').firestore;
  }
} else {
  // Use native Firebase for mobile platforms
  try {
    const authModule = require('@react-native-firebase/auth');
    const firestoreModule = require('@react-native-firebase/firestore');
    
    auth = () => authModule.default();
    firestore = () => firestoreModule.default();
    console.log('✅ Using native Firebase services for MVP');
  } catch (error) {
    console.log('⚠️ Native Firebase not available, using fallback services');
    // Fallback to basic auth/firestore from firebase-mvp
    auth = () => require('./firebase-mvp').auth;
    firestore = () => require('./firebase-mvp').firestore;
  }
}

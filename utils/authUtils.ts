import { auth } from '../services/firebase-platform';

/**
 * Check if the current user is authenticated
 */
export const isUserAuthenticated = (): boolean => {
  const currentUser = auth().currentUser;
  return currentUser !== null;
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Get user authentication info
 */
export const getUserAuthInfo = () => {
  const user = auth().currentUser;
  
  if (!user) {
    return {
      isAuthenticated: false,
      userId: null,
      email: null,
      displayName: null,
      emailVerified: false,
    };
  }

  return {
    isAuthenticated: true,
    userId: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    providerId: user.providerId,
    creationTime: user.metadata?.creationTime,
    lastSignInTime: user.metadata?.lastSignInTime,
  };
};

/**
 * Check authentication status and log details
 */
export const checkAuthStatus = () => {
  const authInfo = getUserAuthInfo();
  
  console.log('🔍 Authentication Status Check:');
  console.log('  - Authenticated:', authInfo.isAuthenticated);
  
  if (authInfo.isAuthenticated) {
    console.log('  - User ID:', authInfo.userId);
    console.log('  - Email:', authInfo.email);
    console.log('  - Display Name:', authInfo.displayName);
    console.log('  - Email Verified:', authInfo.emailVerified);
    console.log('  - Provider:', authInfo.providerId);
    console.log('  - Created:', authInfo.creationTime);
    console.log('  - Last Sign In:', authInfo.lastSignInTime);
  } else {
    console.log('  - No authenticated user found');
  }
  
  return authInfo;
};

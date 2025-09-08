# Permission Denied Errors - Solution Guide

## Problem Identified

You're experiencing permission denied errors because:

1. **User Document Missing**: Your authenticated user doesn't have a corresponding document in the `users` collection in Firestore
2. **Security Rules**: The Firestore security rules require users to have documents to access most features
3. **Authentication vs Authorization**: While authentication works, authorization fails due to missing user profile

## Root Cause

The app's security rules are designed to:
- Allow users to read/write their own user documents
- Require authentication for most operations
- Fall back to mock data when permission is denied

However, if your user document doesn't exist in Firestore, you'll get permission denied errors even though you're properly authenticated.

## Solutions

### Option 1: Run the Fix Script (Recommended)

```bash
node scripts/fix-user-permissions.js
```

This script will:
- Sign you in with your credentials
- Create your user document if it doesn't exist
- Test all permissions
- Provide a detailed report

### Option 2: Manual Fix via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/dekr-nextgen/firestore)
2. Navigate to Firestore Database
3. Create a new document in the `users` collection
4. Use your user ID as the document ID
5. Add the following fields:

```json
{
  "email": "your-email@example.com",
  "displayName": "Your Name",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "isAdmin": false,
  "isPublic": false,
  "preferences": {
    "theme": "light",
    "notifications": true,
    "audioEnabled": true,
    "autoPlay": false
  },
  "profile": {
    "bio": "",
    "avatar": null,
    "location": null,
    "website": null
  },
  "stats": {
    "totalLessonsCompleted": 0,
    "totalDecksCreated": 0,
    "totalCardsStudied": 0,
    "streak": 0,
    "lastActive": "2024-01-01T00:00:00.000Z"
  }
}
```

### Option 3: Check Your User ID

If you're unsure of your user ID:

1. Open the app and sign in
2. Check the console logs for your user ID
3. Or run: `node scripts/check-user-permissions.js`

## What Was Fixed

### 1. Security Rules Updated
- Added explicit `create` permission for user documents
- Deployed updated rules to Firebase
- Rules now properly handle user document creation

### 2. Diagnostic Tools Created
- `scripts/debug-permissions.js` - General permission diagnostics
- `scripts/check-user-permissions.js` - User-specific permission checking
- `scripts/fix-user-permissions.js` - Automated fix for user permissions

### 3. Error Handling Improved
- App gracefully falls back to mock data when permissions fail
- Better error logging for debugging
- Clear error messages for common issues

## Testing Your Fix

After running the fix script or manually creating your user document:

1. **Restart your app** (if running)
2. **Sign in again** to refresh authentication
3. **Check console logs** for permission errors
4. **Test key features**:
   - Loading cards/lessons
   - Creating decks
   - Accessing user profile

## Common Permission Issues

### 1. User Document Missing
**Error**: `permission-denied Missing or insufficient permissions`
**Solution**: Create user document in Firestore

### 2. Authentication Expired
**Error**: `unauthenticated`
**Solution**: Sign in again

### 3. Security Rules Not Deployed
**Error**: `permission-denied`
**Solution**: Run `firebase deploy --only firestore:rules`

### 4. Network Issues
**Error**: `unavailable`
**Solution**: Check internet connection

## Prevention

To prevent future permission issues:

1. **Always create user documents** when users sign up
2. **Test permissions** after deploying security rules
3. **Monitor Firebase Console** for error logs
4. **Use the diagnostic scripts** regularly

## Next Steps

1. Run the fix script: `node scripts/fix-user-permissions.js`
2. Test your app functionality
3. Check console logs for any remaining errors
4. Report any persistent issues

## Support

If you continue to experience permission errors:

1. Check Firebase Console for error logs
2. Run the diagnostic scripts
3. Verify your user document exists
4. Ensure security rules are deployed
5. Check network connectivity

The permission denied errors should be resolved once your user document exists in Firestore and the security rules are properly deployed.

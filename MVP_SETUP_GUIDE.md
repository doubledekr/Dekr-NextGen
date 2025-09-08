# MVP Setup Guide - Minimal Firebase Configuration

## Overview

This guide helps you run your Dekr app in MVP mode with minimal Firebase functionality, perfect for getting to production-ready development quickly.

## Quick Start

### Switch to MVP Mode
```bash
node scripts/switch-to-mvp.js
```

### Switch Back to Full Mode
```bash
node scripts/switch-to-full.js
```

## MVP Features

### ✅ Enabled Features
- **Basic Authentication** - Email/password sign-in and sign-up
- **Firestore Database** - Basic CRUD operations for user data
- **User Profiles** - Simple user profile management
- **Watchlist** - Save and manage watchlist items
- **Basic Analytics** - Core user engagement tracking
- **Market Data** - Your existing market data service
- **Lesson Content** - Static lessons from JSON files
- **Content Discovery** - Basic card-based content system

### ❌ Disabled Features (for MVP)
- **Google Sign-In** - Temporarily disabled to simplify setup
- **Cloud Functions** - Complex backend processing
- **Advanced Analytics** - Detailed engagement tracking
- **Podcast Generation** - Weekly automated content
- **Community Features** - Social interactions and sharing
- **Advanced Personalization** - AI-powered recommendations
- **Storage** - File uploads and media storage

## Firebase Configuration

### MVP Firebase Setup
The MVP mode uses a simplified `firebase-mvp.json` configuration that includes:
- Firestore database
- Basic hosting
- Open security rules for development

### Security Rules
MVP mode uses open Firestore rules for development:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Development Workflow

### 1. Start in MVP Mode
```bash
# Switch to MVP mode
node scripts/switch-to-mvp.js

# Start the app
npm start
# or
expo start
```

### 2. Test Core Features
- User registration and login
- Basic app navigation
- Market data feed
- Lesson content
- Watchlist functionality

### 3. Add Features Gradually
As you're ready for production, you can:
- Switch back to full mode: `node scripts/switch-to-full.js`
- Enable specific features one by one
- Test each feature thoroughly

## Demo User

For testing, you can use the demo user:
- **Email**: `demo@dekr.app`
- **Password**: `demo123`

The app will automatically create this user if it doesn't exist.

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Ensure your Firebase project is properly configured
   - Check that the API keys in `firebase-mvp.ts` are correct
   - Verify Firestore is enabled in your Firebase console

2. **Authentication Issues**
   - Make sure Authentication is enabled in Firebase Console
   - Check that Email/Password provider is enabled
   - Verify the auth domain is configured correctly

3. **Firestore Permission Errors**
   - MVP mode uses open rules for development
   - Ensure Firestore is enabled in your Firebase project
   - Check that your project ID matches the configuration

### Getting Help

If you encounter issues:
1. Check the console logs for specific error messages
2. Verify your Firebase project configuration
3. Ensure all required Firebase services are enabled
4. Test with the demo user first

## Production Readiness

When you're ready for production:

1. **Switch to Full Mode**
   ```bash
   node scripts/switch-to-full.js
   ```

2. **Update Security Rules**
   - Replace open rules with proper security rules
   - Test all user permissions thoroughly

3. **Enable Advanced Features**
   - Google Sign-In
   - Cloud Functions
   - Advanced Analytics
   - Community Features

4. **Deploy**
   ```bash
   firebase deploy
   ```

## Benefits of MVP Mode

- **Faster Development** - Focus on core features without complexity
- **Easier Testing** - Simplified setup for testing and debugging
- **Reduced Dependencies** - Fewer external services to manage
- **Quick Iteration** - Rapid prototyping and feature development
- **Cost Effective** - Lower Firebase usage during development

## Next Steps

1. Run the MVP setup script
2. Test the core functionality
3. Identify which features you need for your production MVP
4. Gradually add features as needed
5. Switch to full mode when ready for production

This approach allows you to get your app running quickly while maintaining the ability to scale up to full Firebase functionality when needed.

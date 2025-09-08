# Manual User Document Creation

Since the automated scripts are having authentication issues, let's create the user document manually through the Firebase Console.

## Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/project/dekr-nextgen/firestore
2. Make sure you're logged in as the project owner

## Step 2: Create User Document
1. Click "Start collection" (if no collections exist) or navigate to existing collections
2. Collection ID: `users`
3. Click "Next"
4. Document ID: `jlCeTPWN9aPjX1HX1FJeAmHScA33`
5. Add the following fields:

### Field 1: uid
- Field: `uid`
- Type: `string`
- Value: `jlCeTPWN9aPjX1HX1FJeAmHScA33`

### Field 2: email
- Field: `email`
- Type: `string`
- Value: `trackstack@gmail.com`

### Field 3: displayName
- Field: `displayName`
- Type: `string`
- Value: `trackstack`

### Field 4: isPublic
- Field: `isPublic`
- Type: `boolean`
- Value: `false`

### Field 5: createdAt
- Field: `createdAt`
- Type: `timestamp`
- Value: (current timestamp)

### Field 6: currentStage
- Field: `currentStage`
- Type: `number`
- Value: `1`

### Field 7: xp
- Field: `xp`
- Type: `number`
- Value: `0`

### Field 8: stats (Map)
- Field: `stats`
- Type: `map`
- Add sub-fields:
  - `weeklyGainPercent`: `number`, `0`
  - `competitionsWon`: `number`, `0`
  - `lessonsCompleted`: `number`, `0`

### Field 9: preferences (Map)
- Field: `preferences`
- Type: `map`
- Add sub-fields:
  - `theme`: `string`, `light`
  - `notifications`: `boolean`, `true`
  - `audioEnabled`: `boolean`, `true`
  - `autoPlay`: `boolean`, `false`

### Field 10: profile (Map)
- Field: `profile`
- Type: `map`
- Add sub-fields:
  - `bio`: `string`, `` (empty)
  - `avatar`: `string`, `null`
  - `location`: `string`, `null`
  - `website`: `string`, `null`

## Step 3: Save Document
Click "Save" to create the document.

## Step 4: Verify
After creating the document, you should be able to:
1. Sign in to your app without permission errors
2. Access all Firebase features
3. See your user profile in the app

## Alternative: Use Firebase CLI
If you prefer command line, you can also use:

```bash
# Set up Firebase CLI with your project
firebase use dekr-nextgen

# Create the document using Firebase CLI (if available)
# This might require additional setup
```

## Next Steps
After creating the user document:
1. Switch back to secure rules: `cp firestore.rules.fixed firestore.rules && firebase deploy --only firestore:rules`
2. Test your app to ensure permissions work
3. The permission denied errors should be resolved

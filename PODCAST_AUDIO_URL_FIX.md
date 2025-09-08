# Podcast Audio URL Fix

## Issue Identified
The ReactNativeAudioPlayer was receiving a numeric ID (`33`) instead of a proper audio file path, causing the error:
```
ERROR ❌ ReactNativeAudioPlayer: Error loading audio source: [TypeError: audioUrl.startsWith is not a function (it is undefined)]
```

## Root Cause
The `require('../assets/podcast/weekly-podcast.mp3')` statement in React Native returns a numeric asset ID (like `33`) rather than a file path string. This numeric ID was being passed directly to the audio player, which expected a string URL.

## Solution Implemented

### 1. Updated Audio Assets Mapping
**File**: `utils/audioAssets.ts`
- Added `'weekly-podcast.mp3': require('../assets/podcast/weekly-podcast.mp3')` to the audio assets mapping
- This allows the `getAudioAsset()` function to properly resolve the filename to the correct asset

### 2. Fixed HomePodcastService Audio URLs
**File**: `services/HomePodcastService.ts`
- Changed `audioUrl: require('../assets/podcast/weekly-podcast.mp3')` to `audioUrl: 'weekly-podcast.mp3'`
- Updated all three methods:
  - `getProvidedPodcastData()`
  - `getFallbackPodcastData()`
  - `generatePodcastAudio()`

## How It Works Now

1. **Podcast Service**: Returns `'weekly-podcast.mp3'` as the audioUrl
2. **Audio Player**: Receives the filename string
3. **Audio Assets System**: Maps `'weekly-podcast.mp3'` to the actual asset using `require('../assets/podcast/weekly-podcast.mp3')`
4. **React Native**: Uses the numeric asset ID internally for audio playback

## Benefits

- ✅ **Proper String Handling**: Audio player receives a string instead of a number
- ✅ **Asset Resolution**: Audio assets system properly maps filenames to assets
- ✅ **Error Prevention**: No more `startsWith is not a function` errors
- ✅ **Consistent Pattern**: Follows the same pattern as other audio files in the app

## Files Modified

1. `utils/audioAssets.ts` - Added weekly-podcast.mp3 mapping
2. `services/HomePodcastService.ts` - Fixed audioUrl to use filename instead of require() result

## Testing

The fix should resolve the audio playback issues. The podcast should now:
- Load without errors
- Play correctly in the in-app audio player
- Use the local MP3 file from assets/podcast/

## Technical Details

### Before (Broken)
```typescript
audioUrl: require('../assets/podcast/weekly-podcast.mp3') // Returns: 33
```

### After (Fixed)
```typescript
audioUrl: 'weekly-podcast.mp3' // Returns: "weekly-podcast.mp3"
```

The audio assets system then maps this to the actual asset:
```typescript
'weekly-podcast.mp3': require('../assets/podcast/weekly-podcast.mp3')
```

# Commit Message

```
feat: UI/UX improvements and lesson cards migration to learn section

## Major Changes:
- Remove floating menu from index screen for cleaner interface
- Remove generate buttons from newsletter section
- Migrate all lesson cards to dedicated learn section with real audio
- Create full-screen lesson cards swiper with audio playback

## Files Modified:
- app/(tabs)/index.tsx: Remove DeckScrollView floating menu
- app/(tabs)/newsletter.tsx: Remove generate FAB buttons
- app/(tabs)/education.tsx: Add lesson cards preview section
- components/WeeklyPodcastCard.tsx: Remove generate buttons
- services/CardService.ts: Separate lesson cards from main feed

## Files Added:
- app/lesson-cards.tsx: Full-screen lesson cards swiper
- services/LessonCardService.ts: Lesson card management service
- scripts/generate-lesson-cards.js: Lesson card generation script
- Various demo and testing scripts

## Impact:
- Cleaner, more focused main screen
- Better organized educational content
- Dedicated audio learning experience
- Improved code quality and maintainability

## Testing:
- Lesson cards load with real audio content
- Swipe gestures work correctly
- Audio playback functions properly
- Navigation between screens works smoothly
```

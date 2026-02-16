# MomConnect Brooklyn

## Overview
A hyper-local social networking app for moms with young children in Brooklyn. Built with Expo (React Native) and Express backend.

## Architecture
- **Frontend**: Expo Router with file-based routing, React Native
- **Backend**: Express server on port 5000 (landing page + API)
- **State Management**: React Context + AsyncStorage for persistence
- **Fonts**: Nunito (Google Fonts)
- **Data**: Local mock data with AsyncStorage persistence (no database needed for MVP)

## Project Structure
```
app/
  _layout.tsx          - Root layout with providers (fonts, context, query client)
  (tabs)/
    _layout.tsx        - 5-tab layout (Discover, Meet, Explore, Chat, Profile)
    index.tsx          - Discover screen (swipe cards + Feed access button)
    meet.tsx           - Meet screen (check-in broadcasts with audience control)
    feed.tsx           - Community feed with posts (hidden tab, accessible from Discover)
    map.tsx            - Location explorer with check-ins
    messages.tsx       - Messages/matches list
    profile.tsx        - User profile with badges & settings
  chat.tsx             - Chat conversation screen
  mom-detail.tsx       - Mom profile detail screen
components/
  Avatar.tsx           - Avatar with initials, verified badge, hang-now ring
  InterestTag.tsx      - Interest chip component
  PostCard.tsx         - Feed post card
  LocationCard.tsx     - Location card with check-in button
  ErrorBoundary.tsx    - Error boundary wrapper
  ErrorFallback.tsx    - Error UI fallback
contexts/
  AppContext.tsx        - Main app state (user, matches, posts, messages, check-ins, broadcasts)
lib/
  types.ts             - TypeScript interfaces
  mock-data.ts         - Mock data for development
  query-client.ts      - React Query setup
constants/
  colors.ts            - App color palette (coral, sage, gold theme)
```

## Key Features
1. **Discover** - Swipe-style card matching (like Hinge), Feed access via top bar
2. **Meet** - Check-in & broadcast location to friends, nearby moms, or everyone
3. **Community Feed** - Posts, check-ins, meetup planning (accessed from Discover)
4. **Explore** - Kid-friendly locations with check-in system
5. **Chat** - Messaging between matched moms
6. **Profile** - Bio, kids, interests, badges, privacy settings

## Design
- Warm color palette: coral (#E8836B), sage (#6BB8A8), gold (#F5C469)
- Nunito font family
- Liquid glass tabs on iOS 26+, blur tabs on older iOS
- Cream background (#FFF8F4)

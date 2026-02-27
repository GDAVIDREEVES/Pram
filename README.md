# Wriggle

**Build your Village** — A mobile-first community app for moms in Brooklyn to connect, discover baby classes, schedule playdates, and broadcast real-time get-togethers at local cafes, parks, and playgrounds.

Built with Expo (React Native) and designed for iOS, Android, and Web.

---

## Features

### Discover
Swipe-based matching to find nearby moms with similar interests and kids of similar ages. Animated card interface with like/skip gestures. Tap a card to view a full profile with bio, interests, kids, and conversation prompts.

### Meet
Real-time broadcast system — check in at any location and let nearby moms know you're available to hang out. Choose your audience (friends, nearby, or everyone), write a message, and broadcast. Other moms can respond with "I'm in" to join.

### Explore
Interactive Mapbox map centered on Brooklyn showing kid-friendly locations: cafes, parks, playgrounds, restaurants, libraries, and baby classes. Filter by type, tap pins for details, and check in. Baby classes scraped from external sources are plotted as distinct purple pins with venue, schedule, and age range info.

### Chat
Messaging system for matched moms. Send text, GIFs (GIPHY integration), stickers (54 custom baby/NYC-themed stickers across 6 categories), and meetup invitations with location and time.

### Profile
View and edit your profile — neighborhood, bio, kids, interests. Track stats (matches, check-ins, badges). Toggle "Available to Hang" status. Earned badges for community engagement. Sign out via Settings.

### Feed
Community post feed with check-ins, meetup announcements, and general posts. Like and comment on posts. Filterable by post type.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo](https://expo.dev) SDK 54 with [Expo Router](https://docs.expo.dev/router/introduction/) v6 (file-based routing) |
| Language | TypeScript 5.9 |
| UI | React Native 0.81 + React 19 |
| Auth | [Supabase Auth](https://supabase.com/docs/guides/auth) (email/password) |
| Maps | [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) (web) + [react-native-maps](https://github.com/react-native-maps/react-native-maps) (native) |
| State | React Context + [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) persistence |
| Server State | [TanStack React Query](https://tanstack.com/query) v5 |
| Animations | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) + Gesture Handler |
| Backend | Express 5 (class scraping, GIF proxy) |
| Fonts | Nunito (UI) + Pacifico (logo branding) |
| Deployment | Vercel (web) / EAS Build (native) |

---

## Project Structure

```
Pram/
├── app/                        # Expo Router screens
│   ├── (auth)/                 # Auth route group (login, signup)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                 # Main tab navigation
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── index.tsx           # Discover (swipe cards)
│   │   ├── meet.tsx            # Meet (broadcasts)
│   │   ├── map.tsx             # Explore (map + classes)
│   │   ├── messages.tsx        # Chat (conversations)
│   │   ├── profile.tsx         # Profile + settings
│   │   └── feed.tsx            # Community feed (hidden tab)
│   ├── _layout.tsx             # Root layout (auth gate, providers)
│   ├── mom-detail.tsx          # Mom profile detail screen
│   └── chat.tsx                # Chat conversation screen
├── components/                 # Reusable UI components
│   ├── Avatar.tsx              # User avatar with verified badge
│   ├── LocationCard.tsx        # Location detail card
│   ├── PostCard.tsx            # Feed post card
│   ├── InterestTag.tsx         # Interest chip/tag
│   ├── NativeMapView.tsx       # Map (web stub)
│   ├── NativeMapView.native.tsx# Map (native implementation)
│   ├── ErrorBoundary.tsx       # Error boundary
│   └── ErrorFallback.tsx       # Error fallback UI
├── contexts/                   # React Context providers
│   ├── AuthContext.tsx          # Supabase auth state
│   └── AppContext.tsx           # App data state (user, matches, posts, etc.)
├── lib/                        # Utilities and types
│   ├── types.ts                # All TypeScript interfaces
│   ├── mock-data.ts            # Mock data for development
│   ├── supabase.ts             # Supabase client (lazy init)
│   ├── use-classes.ts          # Classes data hook (React Query)
│   ├── query-client.ts         # React Query client config
│   └── baby-emojis.ts          # Sticker categories and assets
├── constants/
│   └── colors.ts               # Design system color palette
├── assets/
│   ├── fonts/                  # Custom fonts (Pacifico)
│   ├── images/                 # App icons, splash screen
│   └── stickers/               # 54 custom sticker PNGs
├── server/                     # Express backend
│   ├── index.ts                # Server entry point
│   ├── routes.ts               # API routes (GIFs, classes)
│   ├── scraper.ts              # Baby class web scraper
│   ├── storage.ts              # Data persistence
│   └── venue-coords.ts         # Brooklyn venue coordinates
├── shared/
│   └── schema.ts               # Drizzle ORM database schema
└── scripts/
    └── build.js                # Static build script
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- Expo CLI: `npx expo`

### Installation

```bash
git clone https://github.com/GDAVIDREEVES/Pram.git
cd Pram
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Required for map
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Required for authentication
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional — for GIF search in chat
GIPHY_API_KEY=your_giphy_api_key

# Optional — for class scraper backend
DATABASE_URL=postgresql://...
```

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_MAPBOX_TOKEN` | Yes | Mapbox GL JS access token for the Explore map |
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL for authentication |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public API key |
| `GIPHY_API_KEY` | No | GIPHY API key for GIF search in chat |
| `DATABASE_URL` | No | PostgreSQL connection string for Drizzle migrations |

> **Note:** The app runs without Supabase credentials — auth screens will display a configuration message. All other features work with mock data.

### Running the App

**Web (development):**

```bash
npx expo start --web
```

**With backend server** (for class scraping and GIF search):

```bash
# Terminal 1 — Express backend
npm run server:dev

# Terminal 2 — Expo web
EXPO_PUBLIC_DOMAIN=localhost:5000 npx expo start --web --localhost
```

**iOS / Android:**

```bash
npx expo start
# Then press 'i' for iOS simulator or 'a' for Android emulator
```

---

## Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Coral | `#E8836B` | Primary actions, branding, active tabs |
| Peach | `#F2A898` | Highlights, secondary accents |
| Sage | `#6BB8A8` | Success states, "available" indicators |
| Gold | `#F5C469` | Warnings, secondary elements |
| Cream | `#FFF8F4` | Page backgrounds |
| Blush | `#FDE8E0` | Card accents, badge backgrounds |

### Typography

- **Nunito** (400, 500, 600, 700) — All UI text
- **Pacifico** (400) — "wriggle" logo branding on auth screens

### Design Principles

- Mobile-first — optimized for phones, responsive on web (max 430px card width)
- Warm and approachable — coral tones, rounded corners (14–24px), soft shadows
- Platform-adaptive — blur tab bar on iOS, standard on Android, bordered on web

---

## Architecture

### Auth Flow

```
App Launch
    │
    ├── AuthProvider checks Supabase session
    │
    ├── No session → /(auth)/login
    │   ├── Sign In → Supabase signInWithPassword
    │   └── Sign Up → Supabase signUp (stores name in user_metadata)
    │
    └── Session exists → /(tabs) (main app)
        └── Sign Out (Profile > Settings) → back to /(auth)/login
```

### Data Flow

- **AuthContext** — Supabase session/user, sign in/up/out methods
- **AppContext** — All app data (user profile, discovery queue, matches, posts, messages, broadcasts, check-ins, badges). Persisted to AsyncStorage with `wriggle_*` keys. Initialized from mock data.
- **React Query** — Server-fetched data (baby classes) with 6-hour cache

### Platform-Specific Code

- `NativeMapView.native.tsx` — uses `react-native-maps` (Apple/Google Maps)
- `NativeMapView.tsx` — web stub (Mapbox GL JS rendered in `map.tsx`)
- `Platform.OS === 'web'` checks for web-specific layout adjustments

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/classes` | GET | Fetch baby classes (scraped, 6-hour cache) |
| `/api/gifs/search?q=` | GET | Search GIFs via GIPHY |
| `/api/gifs/trending` | GET | Get trending GIFs |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npx expo start` | Start Expo dev server |
| `npx expo start --web` | Start web preview |
| `npm run server:dev` | Start Express backend (dev) |
| `npm run server:build` | Bundle server with esbuild |
| `npm run server:prod` | Run production server |
| `npm run db:push` | Push Drizzle schema migrations |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |

---

## Sticker Library

54 custom stickers across 6 categories:

- **Baby Emotions** — happy, sleepy, crying, laughing, surprised, crawling
- **Mom Life** — coffee, superhero, hug
- **Baby Stuff** — bottle, stroller, rubber duck, pacifier, teddy bear, onesie
- **Reactions** — love heart, thumbs up, party, high five, wave, LOL
- **Fun** — playground, cupcake, ice cream, nap time, Brooklyn Bridge
- **New York** — Statue of Liberty, taxi, pizza, subway, bagel, I Love NY, Prospect Park, brownstone, pigeon, pretzel, Coney Island, and more

---

## Deployment

### Web (Vercel)

Set environment variables in Vercel dashboard:
- `EXPO_PUBLIC_MAPBOX_TOKEN`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Native (EAS Build)

```bash
npx eas build --platform ios
npx eas build --platform android
```

---

## License

Private project. All rights reserved.

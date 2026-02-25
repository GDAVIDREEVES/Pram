# AGENTS.md

## Cursor Cloud specific instructions

### Overview

MomConnect Brooklyn is a React Native (Expo SDK 54) social networking app for moms, with an Express 5 backend. It is a single-product monorepo. The app uses mock data and in-memory storage at runtime — no database is required.

### Running the app

Two processes must run concurrently:

1. **Express backend** (port 5000): `npm run server:dev`
2. **Expo web dev server** (port 8081): `EXPO_PUBLIC_DOMAIN=localhost:5000 npx expo start --web --localhost`

Set `EXPO_PUBLIC_DOMAIN=localhost:5000` so the frontend can reach the backend API. The `CI=1` env var can be used instead of `--non-interactive` (which is unsupported by this Expo version).

### Lint / Test / Build

- **Lint**: `npm run lint` (runs `npx expo lint`; pre-existing warnings/errors exist in the repo)
- **Build server**: `npm run server:build` (esbuild to `server_dist/`)
- **Build Expo static**: `npm run expo:static:build`
- No automated test suite is configured.

### Gotchas

- The `postinstall` script runs `patch-package` which applies `patches/expo-asset+12.0.12.patch`. If `npm install` is interrupted, re-run it to ensure patches are applied.
- Expo may warn about package version mismatches (e.g. `expo`, `expo-router`). These are informational and do not block development.
- The `GIPHY_API_KEY` env var is optional; without it the GIF search feature in chat returns errors but the rest of the app works fine.
- `DATABASE_URL` is only used by `npm run db:push` (Drizzle migrations) and is not needed for runtime.

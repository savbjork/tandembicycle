# Tandem Bicycle - CLAUDE.md

## Project Overview

Tandem is a mobile app for household task management (Fair Play methodology). It helps couples/households assign and balance household responsibilities using a card-based system.

**Monorepo structure:**
```
tandembicycle/
├── tandem-mobile/    # React Native (Expo) app — primary codebase
├── tandem-api/       # Spring Boot backend (Java 21)
├── supabase/         # Supabase config
└── docs/plans/       # Design docs and implementation plans
```

---

## Mobile App (tandem-mobile)

### Tech Stack

- **Framework**: React Native 0.81.4 + Expo ~54
- **Language**: TypeScript (strict mode)
- **Styling**: NativeWind (Tailwind CSS)
- **State**: Zustand (global) + TanStack Query (server/cache)
- **Backend**: Supabase (auth, database, real-time)
- **Navigation**: React Navigation 6 (native stack + bottom tabs)
- **Forms**: React Hook Form + Zod
- **Animations**: React Native Reanimated

### Running the App

```bash
cd tandem-mobile
npm install
npm start          # Start Metro bundler
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run lint       # ESLint
npm run format     # Prettier
```

### Environment Setup

Copy `.env.example` to `.env` and fill in:
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Folder Structure

```
tandem-mobile/src/
├── app/                  # Entry point, navigation, providers
│   ├── navigation/       # RootNavigator
│   └── providers/        # AppProviders, AuthInitializer, DataInitializer
├── features/             # Feature modules (self-contained)
│   ├── auth/screens/
│   ├── cards/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── screens/
│   ├── tasks/screens/
│   ├── profile/screens/
│   └── inbox/screens/
├── shared/               # Reusable across features
│   ├── components/       # UI primitives (Button, Input, etc.)
│   ├── hooks/            # Shared custom hooks
│   ├── utils/
│   └── constants/
├── lib/
│   └── supabase.ts       # Supabase client
└── store/slices/         # Zustand stores (authStore, dataStore)
```

**When adding a new feature:** create `src/features/<name>/` with screens, components, hooks subdirectories as needed.

---

## Architecture Patterns

### State Management
- **Local UI state**: `useState` / `useReducer`
- **Server/cached data**: TanStack Query (5-min staleTime, 2 retries)
- **Global app state**: Zustand (`store/slices/`)

### Data Flow
- Supabase client in `lib/supabase.ts`
- Repository pattern abstracts data access behind interfaces
- Auth state initialized in `AuthInitializer`, data in `DataInitializer`

### Type Safety
- Strict TypeScript — no `any`
- Branded types for IDs (prevents mixing ID types at compile time)
- Zod schemas for runtime validation at system boundaries

### Error Handling
- Result pattern: `{ success: true; data: T } | { success: false; error: E }`
- Never use non-null assertions (`!`) without a comment explaining why it's safe

---

## Coding Conventions

### Naming
- Files: PascalCase for components/screens, camelCase for hooks/utils
- Hooks: `useXxx` prefix
- Components: one component per file, named export matching filename

### Imports
Use path aliases (configured in `tsconfig.json` and `babel.config.js`):
- `@app/` → `src/app/`
- `@features/` → `src/features/`
- `@shared/` → `src/shared/`
- `@store/` → `src/store/`
- `@lib/` → `src/lib/`

### Styling
- Use NativeWind (Tailwind) classes for all styling
- Custom color palette: `primary` (red), `secondary` (purple), `surface`, `border`, `text`
- Custom font: NanumMyeongjo

### Formatting
- Prettier: single quotes, trailing commas (ES5), 100-char line width, 2-space indent
- Run `npm run format` before committing

---

## Backend (tandem-api)

### Tech Stack
- Spring Boot 4.0.0-M3, Java 21
- PostgreSQL (via Docker), Spring Data JPA + JOOQ
- Gradle 8+

### Running the API

```bash
cd tandem-api
docker compose up -d   # Start PostgreSQL + pgAdmin
./gradlew bootRun      # Run API
./gradlew test         # Run tests
```

Environment: copy `.env.example` to `.env` (Postgres credentials, pgAdmin config).

---

## Git Workflow

- **Main branch**: `main` (production-ready)
- **Feature branches**: descriptive names (e.g., `taskScreen`, `feature/supabase-migration`)
- Write conventional commits: `feat:`, `fix:`, `perf:`, `docs:`, `refactor:`
- Never commit directly to `main`

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/providers/AppProviders.tsx` | Root provider setup |
| `src/app/providers/AuthInitializer.tsx` | Supabase auth state init |
| `src/app/navigation/RootNavigator.tsx` | Navigation structure |
| `src/lib/supabase.ts` | Supabase client config |
| `src/store/slices/authStore.ts` | Auth global state |
| `src/store/slices/dataStore.ts` | Household/cards global state |
| `src/shared/hooks/useCurrentUser.ts` | Current user hook |

# Fair Play - Household Task Management

A mobile application built with React Native that helps couples achieve equitable distribution of household responsibilities using the Fair Play methodology.

## 🎯 Overview

Fair Play is a household management app that makes invisible labor visible and distributes it equitably between partners. The app features a simplified digital card deck representing household responsibilities, with clear ownership and assignment tracking.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with a feature-based modular structure:

```
src/
├── app/                    # App entry, navigation, providers
├── features/               # Feature modules (auth, cards, household, profile)
├── shared/                 # Shared UI components, hooks, utils
├── core/                   # Core business logic, models, repositories
├── infrastructure/         # External services (Firebase)
└── store/                  # Global state management (Zustand)
```

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript (strict mode)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Firebase (Authentication, Firestore)
- **State Management**: Zustand
- **Navigation**: React Navigation v6
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd fairplay
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your Firebase configuration to `.env`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm run start
```

6. Run on iOS or Android:
```bash
npm run ios
npm run android
```

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#0284c7) - Actions, links, active states
- **Secondary**: Purple (#c026d3) - Accents, highlights
- **Category Colors**: Subtle pastels for card categories
  - Home Care: Light blue
  - Food & Meals: Light amber
  - Childcare: Light purple
  - Financial: Light green
  - Social & Family: Light pink
  - Personal Care: Light indigo

### Components

All UI components are built with NativeWind and follow consistent patterns:
- `Button`: Primary, secondary, outline, ghost variants
- `Input`: With labels, errors, and helper text
- `Card`: Container with header, content, footer sections
- `Avatar`: User avatars with fallback to initials
- `Badge`: Status and category indicators
- `Screen`: Safe area wrapper with keyboard handling

## 📱 Features

### MVP Features

- **Authentication**: Email/password sign-up and sign-in
- **Household Management**: Create/join households, invite members
- **Card Library**: Browse 36 simplified Fair Play cards
- **Card Assignment**: Assign cards to household members
- **Balance View**: Visualize workload distribution
- **Dashboard**: Overview of responsibilities and recent changes

### Future Enhancements

- Task completion tracking
- Notifications and reminders
- In-app messaging per card
- Calendar integration
- Analytics and insights
- Custom card creation

## 🗂️ Project Structure

### Core Domain Models

- **User**: User account and profile information
- **Household**: Household entity with members
- **CardTemplate**: Master card definitions (36 cards)
- **HouseholdCard**: Card instances in a household
- **Invitation**: Household invitation system

### Repository Pattern

Each domain model has a corresponding repository interface and Firebase implementation:
- `IUserRepository` → `UserRepository`
- `IHouseholdRepository` → `HouseholdRepository`
- `ICardRepository` → `CardRepository`
- `IHouseholdCardRepository` → `HouseholdCardRepository`
- `IInvitationRepository` → `InvitationRepository`

### State Management

- **Auth Store**: User authentication state
- **Household Store**: Current household and members
- **UI Store**: Modal states, loading, toasts

## 🔥 Firebase Configuration

### Firestore Collections

- `users`: User profiles
- `households`: Household data
- `card_templates`: Master card definitions
- `household_cards`: Card instances per household
- `invitations`: Household invitations

### Security Rules

Security rules should be configured in Firebase Console to ensure:
- Users can only read/write their own data
- Household members can read/write household data
- Card templates are read-only
- Proper validation of all writes

## 🧪 Development

### Code Quality

- **ESLint**: Configured with TypeScript and React rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict mode enabled, no `any` types
- **Husky**: Pre-commit hooks (future enhancement)

### Path Aliases

The project uses path aliases for clean imports:
- `@app/*`: App-level code
- `@features/*`: Feature modules
- `@shared/*`: Shared components and utilities
- `@core/*`: Core business logic
- `@infrastructure/*`: External services
- `@store/*`: Global state

### Scripts

```bash
npm run start          # Start Metro bundler
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run in web browser
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

## 👥 Contributing

This project follows strict architectural principles:

1. **Separation of Concerns**: Keep UI, business logic, and data access separate
2. **Dependency Injection**: Use repository interfaces, not implementations
3. **Type Safety**: Leverage TypeScript's type system fully
4. **Component Reusability**: Build generic, reusable components
5. **Clean Code**: Descriptive names, small functions, clear responsibilities

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Inspired by Eve Rodsky's Fair Play methodology
- Built with modern React Native best practices
- Follows Clean Architecture principles by Robert C. Martin


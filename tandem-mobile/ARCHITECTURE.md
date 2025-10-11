# Fair Play - Architecture Documentation

## Overview

Fair Play is built using **Clean Architecture** principles, ensuring a maintainable, testable, and scalable codebase. The architecture separates concerns into distinct layers, with dependencies pointing inward toward the domain layer.

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                     │
│  (React Components, Screens, Navigation)            │
├─────────────────────────────────────────────────────┤
│              Application Layer                      │
│  (Hooks, Services, State Management)                │
├─────────────────────────────────────────────────────┤
│               Domain Layer                          │
│  (Models, Interfaces, Business Rules)               │
├─────────────────────────────────────────────────────┤
│            Infrastructure Layer                     │
│  (Firebase, API, External Services)                 │
└─────────────────────────────────────────────────────┘
```

## Directory Structure

### `/src/app` - Application Entry & Configuration
- **Navigation**: All navigation configuration (Stack, Tab, Auth navigators)
- **Providers**: Context providers (QueryClient, etc.)
- **Entry Point**: App initialization and setup

### `/src/features` - Feature Modules
Each feature is self-contained with:
- **components/**: Feature-specific UI components
- **screens/**: Screen components
- **hooks/**: Feature-specific custom hooks
- **services/**: Business logic and use cases
- **types.ts**: Feature-specific TypeScript types

#### Features:
- `auth/`: Authentication (sign in, sign up, password reset)
- `household/`: Household management (create, join, members)
- `cards/`: Card library and assignment
- `profile/`: User profile and settings
- `home/`: Dashboard and overview

### `/src/shared` - Shared Resources
Reusable code across features:
- **components/ui**: Base UI components (Button, Input, Card, etc.)
- **components/layout**: Layout components (Screen, Container, etc.)
- **hooks/**: Shared custom hooks
- **utils/**: Utility functions (validation, date, errors)
- **constants/**: App-wide constants
- **types/**: Shared TypeScript types

### `/src/core` - Core Domain Layer
Pure business logic with no external dependencies:
- **models/**: Domain models (User, Household, Card, etc.)
- **repositories/**: Repository interfaces (abstractions)
- **services/**: Core business services
- **config/**: App configuration

### `/src/infrastructure` - Infrastructure Layer
External service implementations:
- **firebase/**: Firebase configuration and implementations
  - `config.ts`: Firebase initialization
  - `converters.ts`: Firestore data converters
  - `repositories/`: Repository implementations
- **api/**: HTTP API clients (if needed)
- **storage/**: Local storage adapters

### `/src/store` - Global State
Zustand stores for global state:
- **slices/**: Store slices (authStore, householdStore, uiStore)

## Design Patterns

### 1. Repository Pattern
All data access goes through repository interfaces, abstracting the data source:

```typescript
// Interface (in core/repositories/)
interface IUserRepository {
  getById(userId: UserId): AsyncResult<User>;
  create(data: CreateUserDTO): AsyncResult<User>;
}

// Implementation (in infrastructure/firebase/repositories/)
class UserRepository implements IUserRepository {
  // Firebase-specific implementation
}
```

**Benefits**:
- Testable (can mock repositories)
- Swappable data sources
- Centralized data access logic

### 2. Dependency Injection
Components and hooks receive dependencies (repositories, services) rather than importing them directly:

```typescript
// Service depends on repository interface
class AuthService {
  constructor(private userRepository: IUserRepository) {}
}

// Hook uses service
const useAuth = () => {
  const authService = new AuthService(userRepository);
  // ...
};
```

### 3. Branded Types
Use TypeScript branded types for type-safe IDs:

```typescript
type UserId = string & { readonly brand: unique symbol };
type HouseholdId = string & { readonly brand: unique symbol };

// Prevents mixing different ID types at compile time
function getUser(userId: UserId) { }
getUser(householdId); // ❌ TypeScript error
```

### 4. Result Pattern
Operations that can fail return a `Result<T, E>` type:

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
const result = await userRepository.getById(userId);
if (result.success) {
  console.log(result.data); // User
} else {
  console.error(result.error); // AppError
}
```

## Data Flow

### Read Flow (Query)
1. **Screen/Component** → triggers data fetch
2. **Custom Hook** → uses TanStack Query
3. **Service Layer** → business logic
4. **Repository** → data access
5. **Firebase** → database query
6. ← **Data flows back through layers**
7. **Component** → renders data

### Write Flow (Command)
1. **Screen/Component** → triggers action (form submit)
2. **Custom Hook** → validation
3. **Service Layer** → business rules
4. **Repository** → data mutation
5. **Firebase** → database write
6. **Zustand Store** → update global state (if needed)
7. **Component** → re-renders with new state

## State Management Strategy

### Local State (useState, useReducer)
- Component-specific UI state
- Form input values
- Modal open/closed
- Local loading states

### Server State (TanStack Query)
- Data from Firebase
- Cached and synchronized
- Automatic refetching
- Optimistic updates

### Global State (Zustand)
- Authentication state
- Current household selection
- UI preferences (theme, etc.)
- Global loading/error states

## Type Safety

### Strict TypeScript Configuration
- `strict: true`
- `noImplicitAny: true`
- `noUnusedLocals: true`
- No `any` types allowed

### Domain Models
All models are strongly typed with interfaces:
- Branded IDs prevent mixing types
- DTOs for creation/updates
- Enums for constants

### Navigation Type Safety
React Navigation provides full type safety:
```typescript
type RootStackParamList = {
  Dashboard: undefined;
  CardDetail: { cardId: string };
};

// Type-safe navigation
navigation.navigate('CardDetail', { cardId: '123' });
```

## Testing Strategy

### Unit Tests
- Test utilities and helper functions
- Test business logic in services
- Test data transformations
- Target: 80%+ coverage on core logic

### Integration Tests
- Test repository implementations
- Test service layer with mocked repositories
- Test hooks with mocked services

### Component Tests
- React Native Testing Library
- Test user interactions
- Test rendering logic
- Mock navigation and stores

### E2E Tests (Future)
- Detox for critical user flows
- Test authentication flow
- Test card assignment flow

## Performance Considerations

### Code Splitting
- Lazy load screens with React.lazy
- Feature-based code splitting
- Reduce initial bundle size

### Memoization
- React.memo for expensive components
- useMemo for expensive computations
- useCallback for event handlers

### Optimization
- FlatList for long lists
- Image optimization
- Firestore query optimization
- Debounced inputs

## Security

### Authentication
- Firebase Authentication
- Secure token storage (Expo SecureStore)
- Session management

### Authorization
- Firestore Security Rules
- Role-based access control
- Household membership verification

### Data Validation
- Client-side with Zod schemas
- Server-side with Firestore rules
- Input sanitization

## Scalability

### Feature Modules
- Self-contained features
- Easy to add new features
- Clear boundaries

### Repository Pattern
- Easy to add new data sources
- Can switch from Firebase to another backend
- Centralized data access

### Clean Architecture
- Business logic independent of frameworks
- Easy to test
- Easy to maintain

## Best Practices

### Code Organization
- One component per file
- Colocate related files
- Barrel exports (index.ts files)

### Naming Conventions
- PascalCase for components
- camelCase for functions
- UPPER_SNAKE_CASE for constants
- Descriptive, meaningful names

### Component Structure
```typescript
// 1. Imports
import React from 'react';

// 2. Types
interface Props { }

// 3. Component
export const Component: React.FC<Props> = () => {
  // 4. State
  // 5. Effects
  // 6. Handlers
  // 7. Render
};
```

### Error Handling
- Custom error classes
- Error boundaries
- User-friendly messages
- Logging service

## Documentation

### JSDoc Comments
- Document all public APIs
- Include parameter descriptions
- Include return value descriptions
- Include examples for complex functions

### README Files
- Each major directory has a README
- Explains purpose and usage
- Includes examples

## Future Enhancements

### Planned Features
- Offline-first support
- Push notifications
- Real-time updates
- Analytics integration
- A/B testing

### Technical Debt
- Add comprehensive test coverage
- Implement CI/CD pipeline
- Add performance monitoring
- Implement error tracking (Sentry)
- Add feature flags

## Resources

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Fair Play Book](https://www.fairplaylife.com/)


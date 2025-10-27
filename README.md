# Tandem (Fair Play)

A full-stack household task management application that helps couples achieve equitable distribution of household responsibilities using the Fair Play methodology.

## 📁 Repository Structure

This is a monorepo containing two main components:

```
tandem/
├── tandem-mobile/          # React Native mobile application
└── tandem-api/             # Spring Boot backend API
```

### tandem-mobile

A modern React Native mobile app built with Expo, featuring:
- Clean Architecture with feature-based modules
- TypeScript (strict mode)
- NativeWind (Tailwind CSS for React Native)
- Firebase Authentication & Firestore
- Zustand for state management
- React Navigation v6

[📱 View Mobile App Documentation →](./tandem-mobile/README.md)

### tandem-api

A robust Spring Boot backend providing:
- RESTful API endpoints
- Spring Security for authentication
- jOOQ for type-safe SQL queries
- Flyway database migrations
- Data validation
- PostgreSQL database support (Docker)

[🔧 View API Documentation →](./tandem-api/HELP.md)  
[🐳 View Docker Setup Guide →](./tandem-api/DOCKER.md)  
[🗄️ View Database & jOOQ Guide →](./tandem-api/DATABASE.md)

## 🚀 Quick Start

### Prerequisites

**For Mobile App:**
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

**For Backend API:**
- Java 17+
- Gradle 8+
- PostgreSQL (optional for local development)

### Setup Instructions

#### 1. Clone the Repository

```bash
git clone https://github.com/savbjork/tandembicycle.git
cd tandem
```

#### 2. Set Up the Mobile App

```bash
cd tandem-mobile
npm install

# Configure Firebase (see tandem-mobile/README.md)
cp .env.example .env
# Edit .env with your Firebase credentials

# Start the development server
npm start

# Run on iOS or Android
npm run ios     # or
npm run android
```

#### 3. Set Up the Backend API

```bash
cd tandem-api

# Start PostgreSQL and pgAdmin (Docker)
docker compose up -d

# Run the application
./gradlew bootRun

# Or build and run
./gradlew build
java -jar build/libs/tandem-api-*.jar
```

The API will connect to PostgreSQL running in Docker on `localhost:5432`.

[📘 View Docker Setup Guide →](./tandem-api/DOCKER.md)

## 🏗️ Architecture Overview

### Mobile App Architecture

The mobile app follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── app/                 # Navigation, providers, entry point
├── features/            # Feature modules (auth, cards, household, profile)
├── shared/              # Shared UI components, hooks, utilities
├── core/                # Domain models, business logic, interfaces
├── infrastructure/      # Firebase implementation, external services
└── store/               # Global state management (Zustand)
```

**Key Patterns:**
- Repository Pattern for data access
- Dependency Injection
- Branded Types for type safety
- Result Pattern for error handling

[🏛️ View Detailed Architecture →](./tandem-mobile/ARCHITECTURE.md)

### Backend API Architecture

Standard Spring Boot layered architecture:
- **Controllers**: REST endpoints
- **Services**: Business logic
- **Repositories**: Data access layer
- **Models/Entities**: Domain models
- **Security**: Authentication & authorization

## 🎯 Core Features

### Current Features (MVP)

- ✅ User authentication (email/password)
- ✅ Household creation and management
- ✅ Member invitations
- ✅ Card library (36 Fair Play cards)
- ✅ Card assignment to household members
- ✅ Workload balance visualization
- ✅ Dashboard overview

### Planned Features

- 🔲 Task completion tracking
- 🔲 Push notifications & reminders
- 🔲 In-app messaging per card
- 🔲 Calendar integration
- 🔲 Analytics and insights
- 🔲 Custom card creation
- 🔲 Offline-first support

## 🛠️ Tech Stack

### Frontend (tandem-mobile)
- React Native (Expo)
- TypeScript
- NativeWind (Tailwind CSS)
- Firebase (Auth + Firestore)
- Zustand
- React Navigation
- TanStack Query
- React Hook Form + Zod

### Backend (tandem-api)
- Spring Boot 4.0.0-M3
- Java 21
- Spring Security
- jOOQ (type-safe SQL)
- Flyway (database migrations)
- Gradle
- PostgreSQL 16

## 📚 Documentation

### Mobile App
- [Mobile App README](./tandem-mobile/README.md) - Setup and features
- [Architecture Guide](./tandem-mobile/ARCHITECTURE.md) - Detailed architecture
- [Implementation Summary](./tandem-mobile/IMPLEMENTATION_SUMMARY.md) - Implementation details
- [Frontend Demo](./tandem-mobile/FRONTEND_DEMO.md) - UI/UX guide
- [Quick Start Guide](./tandem-mobile/QUICKSTART.md) - Getting started quickly

### Backend API
- [API Documentation](./tandem-api/HELP.md) - Spring Boot resources
- [Database Guide](./tandem-api/DATABASE.md) - Migrations & jOOQ setup
- [Docker Setup](./tandem-api/DOCKER.md) - PostgreSQL with Docker
- [Secrets Management](./tandem-api/SECRETS.md) - Jasypt encryption

## 🧪 Development

### Mobile Development

```bash
cd tandem-mobile

# Start dev server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web

# Linting and formatting
npm run lint
npm run format
```

### API Development

```bash
cd tandem-api

# Run application
./gradlew bootRun

# Run tests
./gradlew test

# Build
./gradlew build

# Clean build
./gradlew clean build
```

## 🤝 Contributing

### Code Standards

**TypeScript/JavaScript:**
- Strict TypeScript mode
- No `any` types
- ESLint + Prettier
- Feature-based organization

**Java:**
- Follow Spring Boot conventions
- Use constructor injection
- Write meaningful tests
- Document public APIs

### Commit Guidelines

Follow conventional commits:
```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add/update tests
chore: maintenance tasks
```

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

## 🐛 Known Issues

- [ ] Mobile app: Fix submodule issue in git (tandem-mobile staged as submodule)
- [x] Backend: Database configured with Docker PostgreSQL
- [ ] Setup CI/CD pipeline

## 📝 License

This project is private and proprietary.

## 👥 Team

Built with ❤️ by the Tandem team

## 🙏 Acknowledgments

- Inspired by [Eve Rodsky's Fair Play](https://www.fairplaylife.com/) methodology
- Built with modern best practices for React Native and Spring Boot
- Follows Clean Architecture principles by Robert C. Martin

---

## 📞 Support

For questions or issues:
1. Check the documentation in each subdirectory
2. Review the architecture guide
3. Open an issue on GitHub

## 🔗 Quick Links

- [Mobile App Setup Guide](./tandem-mobile/README.md#-installation)
- [Architecture Documentation](./tandem-mobile/ARCHITECTURE.md)
- [Spring Boot Guides](https://spring.io/guides)
- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)


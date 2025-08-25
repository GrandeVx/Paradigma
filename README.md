# Paradigma FullStack Boilerplate

![Hero](docs/public/header.png)

A clean, production-ready boilerplate for building modern fullstack applications with Next.js, Expo, and powerful monorepo architecture.

## 🚀 Features

- **Cross-Platform**: Next.js web frontend and Expo/React Native mobile app
- **Type-Safe**: End-to-end type safety with tRPC and TypeScript
- **Authentication**: Secure authentication with BetterAuth
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: TanStack React Query for server state
- **Internationalization**: Multi-language support with i18next
- **Modern UI**: Tailwind CSS with NativeWind for cross-platform styling
- **Template Patterns**: Pre-built UI patterns (lists, forms, tabs, bottom sheets)
- **Docker Ready**: Optimized Docker setup for development and production
- **Monorepo**: Efficient development with Turbo and pnpm workspaces

## 🚀 Quick Start

### Docker Setup (Recommended)

For better build performance, you can enable Docker Bake delegation in Compose:

```bash
# Enable Docker Bake for improved build performance
export COMPOSE_BAKE=true

# Build and run the application
docker-compose up --build
```

### Development Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

## 🐳 Docker Configuration

The Dockerfile has been optimized for monorepo builds with proper workspace structure:

- **Multi-stage build** for optimized production images
- **Workspace structure preservation** in production stage
- **Dependency caching** for faster rebuilds
- **Production-only dependencies** in final image

### Docker Bake Benefits

When `COMPOSE_BAKE=true` is set, Docker Compose delegates the build process to Docker Bake, which provides:

- **Parallel builds** for better performance
- **Advanced caching strategies**
- **Better resource utilization**
- **Improved build consistency**

## 📁 Project Structure

```
Paradigma/
├── apps/
│   ├── web/                # Next.js web application
│   │   ├── src/app/       # App router pages
│   │   ├── src/components/ # React components
│   │   └── src/lib/       # Utilities and configurations
│   └── mobile/            # Expo/React Native app
│       ├── app/           # Expo router screens
│       ├── components/    # React Native components
│       └── lib/           # Mobile-specific utilities
├── packages/
│   ├── api/               # tRPC API routes and schemas
│   ├── auth/              # Authentication configuration
│   ├── db/                # Prisma schema and database client
│   └── styles/            # Shared design system and Tailwind config
├── docs/                  # Project documentation
├── scripts/               # Build and deployment scripts
└── docker-compose*.yml    # Docker configuration
```

## 🐳 Docker Quick Start

The project includes optimized Docker configurations for both development and production:

### Development with Hot Reload

```bash
# Quick start (recommended)
./scripts/docker-setup.sh start-dev

# Manual start
docker-compose -f docker-compose.dev.yml up -d
```

### Production Build

```bash
# Production deployment
./scripts/docker-setup.sh start-prod

# Manual production start
docker-compose up -d
```

**📚 For complete Docker documentation, see [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md)**

## ⚡ Local Development (Non-Docker)

### Prerequisites

- **Node.js** 20+ with corepack enabled
- **pnpm** 9.7+ (via corepack)
- **PostgreSQL** 16+ (local or remote)

### Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database URL and other configurations
   ```

3. **Setup database**

   ```bash
   pnpm --filter @paradigma/db exec prisma generate
   pnpm --filter @paradigma/db exec prisma db push
   ```

4. **Start development servers**

   ```bash
   # Start all apps in development mode
   pnpm dev

   # Or start individual apps
   pnpm --filter @paradigma/web dev    # Web app on http://localhost:3000
   pnpm --filter @paradigma/mobile dev # Mobile app with Expo
   ```

## 🏗️ Build & Deploy

### Web Application

```bash
# Build web app for production
pnpm --filter @paradigma/web build

# Start production server
pnpm --filter @paradigma/web start
```

### Mobile Application

```bash
# Start mobile development
pnpm --filter @paradigma/mobile expo start

# Production builds (requires EAS account)
pnpm --filter @paradigma/mobile eas build --platform ios
pnpm --filter @paradigma/mobile eas build --platform android
```

## 🛠️ Development Tools

### Code Generation

```bash
# Generate new components
pnpm turbo gen react-component
pnpm turbo gen react-native-component

# Generate tRPC routers
pnpm turbo gen trpc-router

# Generate new screen (mobile)
pnpm turbo gen rn-screen
```

### Database Management

```bash
# Generate Prisma client
pnpm --filter @paradigma/db exec prisma generate

# Database migrations
pnpm --filter @paradigma/db exec prisma migrate dev

# Database seeding
pnpm --filter @paradigma/db exec prisma db seed

# Database studio
pnpm --filter @paradigma/db exec prisma studio
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @paradigma/web test
pnpm --filter @paradigma/api test
```

### Linting & Formatting

```bash
# Lint all packages
pnpm lint

# Format code
pnpm format

# Type checking
pnpm type-check
```

## 📱 Mobile Development

### Expo Configuration

The mobile app uses Expo with custom development builds for advanced features:

```bash
# Install Expo CLI
npm install -g @expo/cli

# Start development server
cd apps/mobile
pnpm expo start

# Run on specific platform
pnpm expo start --ios
pnpm expo start --android
```

### Building for Production

```bash
# Configure EAS
cd apps/mobile
eas login
eas build:configure

# Build for stores
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## 🗄️ Database Schema

The boilerplate includes a clean PostgreSQL schema with Prisma ORM:

- **User**: Authentication and user profiles
- **Session**: Session management for BetterAuth
- **Account**: OAuth account linking
- **Verification**: Email/phone verification tokens
- **Whitelist**: User access control

_Additional tables can be easily added for your specific application needs._

## 🌍 Internationalization

Supports multiple languages through i18next:

- **Web**: react-i18next with SSR support
- **Mobile**: i18next with expo-localization
- **Supported Languages**: English, Italian (extensible)

## 🔐 Authentication

Authentication powered by BetterAuth with support for:

- **Email/Password**: Traditional sign-up and sign-in
- **OAuth Providers**: Google, GitHub, Apple
- **Session Management**: Secure session handling
- **Role-Based Access**: User roles and permissions

## 🎨 Design System

Built with a cohesive design system:

- **Tokens**: Shared design tokens (colors, typography, spacing)
- **Components**: Reusable UI components
- **Themes**: Dark/light mode support
- **Responsive**: Mobile-first responsive design

## 📊 API Documentation

The API layer includes essential tRPC routers:

- **User Router**: Profile management and user operations
- **Util Router**: Common utilities and health checks
- **Type Safety**: End-to-end type safety with TypeScript
- **Validation**: Zod schema validation
- **Extensible**: Easy to add new routers for your features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: Check the `docs/` directory
- **Issues**: Create issues in your project repository
- **Discussions**: Start discussions for feature requests and improvements

---

**A clean foundation for building your next modern fullstack application**

## 🎯 Template Patterns Included

This boilerplate includes several common UI patterns ready to customize:

### Mobile App Patterns

- **List Pattern**: Date-based list view (`/(protected)/(home)/(daily-transactions)/[date]`)
- **Category Grid**: Category selection with icons (`CategoryBottomSheet`)
- **Tab Navigation**: Multi-tab interface with smooth transitions
- **Form Flow**: Multi-step form pattern (`/(protected)/(creation-flow)/`)
- **Numeric Input**: Specialized numeric keyboard (`NumericKeyboard`)
- **Settings**: Profile management with toggles and selections

### Bottom Sheets Included

- **CategoryBottomSheet**: Category selection with subcategories
- **NotificationsBottomSheet**: Notification settings with time picker
- **Money Account Bottom Sheet**: Mock account selection (customizable)

All patterns use placeholder data and can be easily adapted for your specific use case.

---

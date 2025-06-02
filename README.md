# Balance - Personal Finance Management App

A modern fullstack personal finance application built with Next.js, Expo, and a powerful monorepo architecture.

## 🚀 Features

- **Cross-Platform**: Next.js web frontend and Expo/React Native mobile app
- **Type-Safe**: End-to-end type safety with tRPC and TypeScript
- **Authentication**: Secure authentication with BetterAuth
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: TanStack React Query for server state
- **Internationalization**: Multi-language support with i18next
- **Modern UI**: Tailwind CSS with Shadcn UI components
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
Balance/
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
# Build for production
pnpm --filter @paradigma/web build

# Start production server
pnpm --filter @paradigma/web start
```

### Mobile Application
```bash
# Development build
pnpm --filter @paradigma/mobile expo start

# Production builds
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

The application uses PostgreSQL with Prisma ORM:

- **Users**: Authentication and user profiles
- **Accounts**: Bank accounts and financial institutions
- **Transactions**: Income and expense tracking
- **Categories**: Transaction categorization
- **Budgets**: Budget planning and tracking
- **Goals**: Financial goal setting and monitoring

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

The API is built with tRPC for type-safe, full-stack TypeScript:

- **Type Safety**: End-to-end type safety
- **Real-time**: WebSocket support for live updates
- **Validation**: Zod schema validation
- **Documentation**: Auto-generated API docs

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
- **Issues**: [GitHub Issues](https://github.com/yourusername/balance/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/balance/discussions)

---

**Made with ❤️ using Next.js, Expo, and modern web technologies**

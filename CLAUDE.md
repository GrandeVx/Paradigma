# Global Development Principles

## FUNDAMENTAL RULE: VERIFY EVERYTHING, ASSUME NOTHING

Before taking ANY action in ANY language or framework:
- **VERIFY** the actual state of the codebase - read it, don't assume it
- **CHECK** that files, functions, modules, and dependencies actually exist
- **READ** the source code to understand actual implementations
- **CONFIRM** exports, imports, and APIs match what you're trying to use
- **TEST** your understanding with small verification steps

## Core Principles

### 1. Source of Truth is the Code
- Always check the source documentation and repo before installing dependencies
- The codebase is the only truth - not your memory, not common patterns, not "standard" practices
- Read actual function signatures, type definitions, and implementations
- Verify module exports before importing (whether it's Python, JavaScript, Rust, Go, etc.)
- Check that build commands and scripts exist before running them

### 2. Think Before Acting
- When faced with an error, consider whether the cause of the error is actually the problem before blindly resolving it
- Analyze root causes, not symptoms
- Understand WHY something doesn't work before changing it
- Every fix should be intentional and well-understood

### 3. Maintain Code Integrity
- Prioritize keeping the codebase clean and consistent
- Always aim to keep naming, access conventions, initialization methods, etc., all consistent
- Keep the codebase homogenous - follow existing patterns
- Match the style and conventions already present in each project
- Never introduce inconsistencies for convenience

### 4. Professional Development Practices
- DO NOT COMMIT AND PUSH WITHOUT MY EXPRESS INSTRUCTIONS
- WE ONLY COMMIT VERIFIED, TESTED, WORKING CODE
- DO NOT RUN MY PROJECTS WITHOUT MY EXPRESS INSTRUCTION
- Never use temp directories, or temporary working copies
- We fix things in place and rely on git history if we need to refer to old implementations
- No hacky workarounds, no "temporary" fixes that become permanent

### 5. Safety and Security
- Never do `killall node` or similar broad process termination commands
- Be extremely careful with destructive operations
- Always verify command effects before execution
- Consider security implications of all changes
- Never expose secrets, keys, or sensitive data

### 6. Language-Agnostic Verification Steps
Before using ANY code construct:
1. **File Operations**: Verify paths exist (`ls`, `dir`, `os.path.exists`, etc.)
2. **Imports/Includes**: Check the module/package is installed and exports what you need
3. **Function Calls**: Verify the function exists and understand its signature
4. **Type Usage**: Confirm types/classes/interfaces are defined and accessible
5. **Build Commands**: Check build scripts exist and understand what they do
6. **Dependencies**: Verify packages are in package.json/requirements.txt/Cargo.toml/go.mod/etc.

### 7. Universal Best Practices
- No `any` types, `void*`, or bypassing type systems
- No suppressing warnings or errors without fixing root causes
- No commenting out code to "fix" problems
- Always handle errors properly for the language/framework
- Follow security best practices for each platform
- Respect the idioms of each language while maintaining consistency

## Remember
Every language has its package manager, type system, and conventions, but the principle remains:
**NEVER ASSUME - ALWAYS VERIFY**

Whether it's `npm`, `pip`, `cargo`, `go get`, `gem`, `composer`, `gradle`, or any other tool - check first, act second.

---

## AI Development Team Configuration
*Updated by team-configurator on 2025-07-30*

Your Balance project uses: **Expo SDK 53, Next.js 15, tRPC v10, Prisma ORM v5, BetterAuth v1.2, Tailwind CSS**

### Specialist Assignments

- **Mobile Development** → @expo-app-architect
  - Universal native apps with React Native and Expo SDK 53
  - Expo Router file-based routing, managed workflows
  - Cross-platform optimization and performance
  - iOS/Android specific implementations

- **Web Frontend** → @react-nextjs-expert
  - Next.js 15 with App Router and React 19
  - Server/Client Components architecture
  - SSR/SSG patterns and streaming
  - SEO optimization and metadata management

- **Type-Safe APIs** → @trpc-type-safety-expert
  - tRPC v10 router setup and procedures
  - End-to-end type safety with TypeScript
  - Real-time subscriptions and caching
  - TanStack Query v4 integration

- **Database Layer** → @prisma-orm-specialist
  - PostgreSQL schema design and migrations
  - Advanced queries, relations, and aggregations
  - Performance optimization and caching
  - Type-safe database access patterns

- **Authentication** → @betterauth-security-architect
  - BetterAuth v1.2 configuration and setup
  - OAuth providers (Google, Apple) integration
  - Session management and security
  - Cross-platform auth state handling

- **Mobile Navigation** → @expo-navigation-expert
  - Expo Router v5 implementation
  - Deep linking and authentication flows
  - Tab and stack navigation patterns
  - Platform-specific navigation behaviors

- **Native Features** → @expo-native-modules-expert
  - iOS/Android native module integration
  - Biometric authentication and secure storage
  - Push notifications and background tasks
  - Hardware feature access

- **Build & Deploy** → @expo-build-deploy-expert
  - EAS Build and Submit workflows
  - iOS App Store and Google Play deployment
  - OTA updates with Expo Updates
  - CI/CD pipeline optimization

- **UI Components** → @react-component-architect
  - Reusable component library architecture
  - Cross-platform component consistency
  - Performance optimization patterns
  - Design system implementation

- **Styling** → @tailwind-css-expert
  - Tailwind CSS with NativeWind integration
  - Cross-platform styling strategies
  - Design token management
  - Responsive design patterns

- **State Management** → @react-state-manager
  - TanStack Query v4 patterns
  - Client-side state architecture
  - Cache invalidation strategies
  - Optimistic updates implementation

- **Code Quality** → @code-reviewer  
  - TypeScript best practices enforcement
  - Cross-platform code review
  - Performance and security audits
  - Architectural consistency checks

- **Performance** → @performance-optimizer
  - React Native performance optimization
  - Bundle size analysis and optimization
  - Memory management and profiling
  - Network request optimization

- **Project Coordination** → @tech-lead-orchestrator
  - Monorepo workspace management
  - Cross-platform feature coordination
  - Architecture decision guidance
  - Team workflow optimization

### How to Use Your Team

**For Mobile Development:**
- "Build the transaction entry screen with form validation"
- "Implement biometric authentication for app unlock"
- "Optimize the transaction list performance"

**For Web Development:**
- "Create the dashboard with server-side rendering"
- "Build the authentication pages with BetterAuth"
- "Implement the analytics charts with Next.js"

**For API Development:**
- "Design the transaction management API endpoints"
- "Add real-time budget updates with subscriptions"
- "Optimize database queries for the reports"

**For Authentication:**
- "Configure Google and Apple sign-in flows"
- "Implement session persistence across platforms"
- "Add two-factor authentication support"

**For Database:**
- "Design the budget tracking schema"
- "Optimize transaction aggregation queries"
- "Implement data migration strategies"

**For Reviews & Quality:**
- "Review my transaction processing logic"
- "Analyze the app performance bottlenecks"
- "Audit the authentication security"

Your specialized AI development team is configured and ready to help with your Balance personal finance app!

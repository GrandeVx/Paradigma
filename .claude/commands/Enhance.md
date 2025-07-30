---
allowed-tools: Bash, Read, Grep, Glob, WebFetch
description: Intelligently enhance user prompts by gathering relevant context from the codebase and project documentation
---

# Enhance

This command takes a user prompt and intelligently enhances it by gathering relevant context from the codebase, documentation, and project structure to make it as effective and specific as possible.

## Instructions

1. **Analyze the user prompt** to identify:
   - Technical domains involved (frontend, backend, mobile, database, etc.)
   - Specific technologies mentioned (React, Expo, tRPC, Prisma, etc.)
   - File types or areas of interest
   - Intent (debugging, feature development, refactoring, etc.)

2. **Gather relevant context** based on the analysis:
   - Search for relevant files using patterns from the prompt
   - Read configuration files and documentation
   - Examine existing implementations for similar features
   - Check project structure and conventions

3. **Enhance the prompt** by:
   - Adding specific file paths and code references
   - Including relevant configuration details
   - Providing context about existing patterns and conventions
   - Adding technical constraints and requirements from the project
   - Including relevant documentation snippets

4. **Present the enhanced prompt** with:
   - The original prompt clearly marked
   - Added context sections clearly labeled
   - Specific file references with line numbers when relevant
   - Technical specifications and constraints

## Context Sources

### Project Structure
- Codebase files: `git ls-files`
- Project overview: @README.md
- Development guidelines: @CLAUDE.md

### Configuration & Setup
- Package manifests: @package.json, @apps/*/package.json
- Environment configs: @.env.example, @apps/*/.env.example
- Build configs: @turbo.json, @docker-compose*.yml
- Linting rules: @.cursorrules, @.eslintrc.cjs

### Documentation
- API documentation: @docs/*.md
- Architecture docs: @.claude/docs/*.md
- Agent specifications: @.claude/agents/**/*.md

### Code Patterns
- Component patterns: apps/web/src/components/**, apps/mobile/components/**
- API routes: packages/api/**
- Database schemas: packages/db/**
- Authentication: packages/auth/**

### Technology-Specific Context
- **React/Next.js**: apps/web/, .cursor/rules/nextjs-rules.mdc
- **React Native/Expo**: apps/mobile/, .cursor/rules/expo-react-native-typescript-cursor-rules.mdc
- **tRPC**: packages/api/, .cursor/rules/trpc-api-rules.mdc
- **Tailwind**: packages/styles/, .cursor/rules/tailwindcss-style.mdc
- **Database**: packages/db/, Prisma schema files
- **Authentication**: packages/auth/, BetterAuth configuration

## Enhancement Patterns

### For Feature Development
- Include existing similar components/features
- Add relevant design system components
- Include API route patterns and database schema
- Add testing patterns and examples

### For Bug Fixes
- Include relevant error logs and stack traces
- Add similar issue resolutions from codebase
- Include configuration that might affect the issue
- Add debugging tools and commands

### For Refactoring
- Include current implementation to be refactored
- Add coding standards and conventions from the project
- Include similar refactoring examples
- Add impact analysis (dependent files, tests)

### For Architecture Questions
- Include relevant architectural documentation
- Add current patterns and conventions
- Include similar architectural decisions in the codebase
- Add technical constraints and requirements

## Example Enhancement

**Original Prompt:**
"Add a dark mode toggle to the settings"

**Enhanced Prompt:**
"Add a dark mode toggle to the settings screen in the Balance personal finance app.

**Context:**
- **Project**: Next.js + Expo monorepo with shared design system
- **Current theme system**: packages/styles/ with Tailwind CSS configuration
- **Settings location**: apps/mobile/app/(tabs)/settings.tsx and apps/web/src/app/settings/
- **Existing theme patterns**: Check apps/web/src/components/theme-provider.tsx
- **Design system**: packages/styles/src/components/ with Shadcn UI components
- **State management**: TanStack React Query for server state, local state for UI preferences

**Requirements:**
- Follow existing component patterns in both web and mobile apps
- Use shared design tokens from packages/styles/
- Implement consistent behavior across web and mobile platforms
- Store preference in local storage/async storage
- Respect system preference as default
- Follow accessibility guidelines for theme switching

**Reference files to examine:**
- apps/web/src/components/theme-provider.tsx
- apps/mobile/components/ui/ (for mobile UI components)
- packages/styles/src/tokens/ (for theme tokens)
- Similar toggle components in the codebase"
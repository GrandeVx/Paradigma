FROM node:20-alpine AS builder
RUN npm install -g pnpm

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl libc6-compat

# Define build arguments for environment variables needed during build
ARG DATABASE_URL
ARG DIRECT_URL
ARG NEXT_PUBLIC_WEBSITE_URL

# Set environment variables from build args
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV NEXT_PUBLIC_WEBSITE_URL=$NEXT_PUBLIC_WEBSITE_URL
# Keep NODE_ENV as development during build to install devDependencies
ENV NODE_ENV=development

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN mkdir -p apps/web packages/api packages/styles packages/db packages/auth
COPY apps/web/package.json apps/web/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/styles/package.json packages/styles/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/db/package.json packages/db/package.json

# Install dependencies but ignore scripts initially
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY apps ./apps
COPY packages ./packages

# Run install again to execute scripts and ensure proper linking
RUN pnpm install --frozen-lockfile

# Set NODE_ENV to production for the build
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true

RUN pnpm turbo run build --filter=@paradigma/web

FROM node:20-alpine
RUN npm install -g pnpm

# Install OpenSSL for Prisma compatibility in production
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

# Maintain workspace structure in production stage
WORKDIR /app

# Copy workspace configuration files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy the built web app
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/src ./apps/web/src
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

# Copy packages to maintain workspace structure
COPY --from=builder /app/packages ./packages

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

EXPOSE 3000

# Run from the web app directory
WORKDIR /app/apps/web
CMD ["pnpm", "start", "-p", "3000"]
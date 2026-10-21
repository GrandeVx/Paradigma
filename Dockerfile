FROM node:24.22.0-bookworm-slim AS node-security-base
ARG TARGETARCH
RUN set -eu; \
    case "$TARGETARCH" in \
      amd64) node_arch=x64; node_sha=6c172a9ab6718f7b801fb5a7bd486af2ee5e32758086a04b84fcce2aa77095e6 ;; \
      arm64) node_arch=arm64; node_sha=dbabf7a1cbf947e6059ffad2c27b80041db97dea1e553b62afdee7f13fca336e ;; \
      *) echo "Unsupported architecture: $TARGETARCH" >&2; exit 1 ;; \
    esac; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl xz-utils; \
    curl -fsSLo /tmp/node.tar.xz "https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-${node_arch}.tar.xz"; \
    echo "$node_sha  /tmp/node.tar.xz" | sha256sum -c -; \
    tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1; \
    rm /tmp/node.tar.xz; \
    rm -rf /var/lib/apt/lists/*; \
    test "$(node --version)" = "v24.22.1"

FROM node-security-base AS builder
RUN npm install -g pnpm

# Install OpenSSL for Prisma compatibility
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Define build arguments for environment variables needed during build
ARG DATABASE_URL
ARG DIRECT_URL
ARG NEXT_PUBLIC_WEBSITE_URL
ARG EMAIL_HOST
ARG EMAIL_USER
ARG EMAIL_PASSWORD
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG REDIS_HOST
ARG REDIS_USERNAME
ARG REDIS_PASSWORD
ARG REDIS_DB
ARG REDIS_PORT

# Set environment variables from build args
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV NEXT_PUBLIC_WEBSITE_URL=$NEXT_PUBLIC_WEBSITE_URL
ENV EMAIL_HOST=$EMAIL_HOST
ENV EMAIL_USER=$EMAIL_USER
ENV EMAIL_PASSWORD=$EMAIL_PASSWORD
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_USERNAME=$REDIS_USERNAME
ENV REDIS_PASSWORD=$REDIS_PASSWORD
ENV REDIS_DB=$REDIS_DB
ENV REDIS_PORT=$REDIS_PORT
# Keep NODE_ENV as development during build to install devDependencies
ENV NODE_ENV=development

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY tsconfig.json ./

# Create package structure and copy package.json files
RUN mkdir -p apps/web packages/api packages/styles packages/db packages/auth
COPY apps/web/package.json apps/web/package.json
COPY apps/web/tsconfig.json apps/web/tsconfig.json
COPY apps/web/next.config.mjs apps/web/next.config.mjs
COPY apps/web/tailwind.config.ts apps/web/tailwind.config.ts
COPY apps/web/postcss.config.cjs apps/web/postcss.config.cjs
COPY packages/api/package.json packages/api/package.json
COPY packages/api/tsconfig.json packages/api/tsconfig.json
COPY packages/styles/package.json packages/styles/package.json
COPY packages/styles/tsconfig.json packages/styles/tsconfig.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/auth/tsconfig.json packages/auth/tsconfig.json
COPY packages/db/package.json packages/db/package.json
COPY packages/db/tsconfig.json packages/db/tsconfig.json

# Install dependencies but ignore scripts initially
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy all source files
COPY apps ./apps
COPY packages ./packages

# Run install again to execute scripts and ensure proper linking
RUN pnpm install --frozen-lockfile

# Set NODE_ENV to production for the build
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true

# Build the web application
RUN pnpm turbo run build --filter=@paradigma/web

FROM node-security-base
RUN npm install -g pnpm

# Install OpenSSL for Prisma compatibility in production
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Define build arguments for environment variables needed at runtime
ARG DATABASE_URL
ARG DIRECT_URL
ARG NEXT_PUBLIC_WEBSITE_URL
ARG EMAIL_HOST
ARG EMAIL_USER
ARG EMAIL_PASSWORD
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG REDIS_HOST
ARG REDIS_USERNAME
ARG REDIS_PASSWORD
ARG REDIS_DB
ARG REDIS_PORT

# Set environment variables from build args
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV NEXT_PUBLIC_WEBSITE_URL=$NEXT_PUBLIC_WEBSITE_URL
ENV EMAIL_HOST=$EMAIL_HOST
ENV EMAIL_USER=$EMAIL_USER
ENV EMAIL_PASSWORD=$EMAIL_PASSWORD
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_USERNAME=$REDIS_USERNAME
ENV REDIS_PASSWORD=$REDIS_PASSWORD
ENV REDIS_DB=$REDIS_DB
ENV REDIS_PORT=$REDIS_PORT
ENV NODE_ENV=production

# Maintain workspace structure in production stage
WORKDIR /app

# Copy workspace configuration files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy the built web app with all necessary files
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/tsconfig.json ./apps/web/tsconfig.json
COPY --from=builder /app/apps/web/src ./apps/web/src
COPY --from=builder /app/apps/web/tailwind.config.ts ./apps/web/tailwind.config.ts
COPY --from=builder /app/apps/web/postcss.config.cjs ./apps/web/postcss.config.cjs

# Copy packages to maintain workspace structure and dependencies
COPY --from=builder /app/packages ./packages

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3030

# Run from the web app directory
WORKDIR /app/apps/web
CMD ["pnpm", "start", "-p", "3030"]
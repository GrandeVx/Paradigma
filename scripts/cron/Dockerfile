# Use the official Node.js runtime as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy workspace configuration and package files first
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./

# Copy database package (dependency)
COPY packages/db ./packages/db

# Copy cron service package.json only
COPY scripts/cron/package.json ./scripts/cron/

# Set placeholder DATABASE_URL for Prisma client generation during build
ENV DATABASE_URL="postgresql://postgres:BonOVErBLeyeogElVeSTASaRATzENCt@89.168.16.211:5432/Balance"

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy cron service source (excluding node_modules)
COPY scripts/cron/src ./scripts/cron/src
COPY scripts/cron/tsconfig.json ./scripts/cron/
COPY scripts/cron/.eslintrc.js ./scripts/cron/
COPY scripts/cron/README.md ./scripts/cron/

# Create logs directory
RUN mkdir -p /app/scripts/cron/logs

# Set working directory to cron service
WORKDIR /app/scripts/cron

# Expose health check port
EXPOSE 3001

# Set timezone
ENV TZ=Europe/Rome

# Clear the placeholder DATABASE_URL (will be provided at runtime)
ENV DATABASE_URL=""

# Run the cron service
CMD ["pnpm", "start"] 
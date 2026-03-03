########################################
# Stage 1 — Install & Build
########################################
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json turbo.json ./

# Copy only what the API service needs from the monorepo
COPY services/api/package.json ./services/api/
COPY packages/database/package.json ./packages/database/
COPY packages/common/package.json ./packages/common/

# Install all deps (monorepo-aware)
RUN npm ci --workspace=services/api --workspace=packages/database --workspace=packages/common --include-workspace-root

# Copy source for packages the API depends on
COPY packages/database/ ./packages/database/
COPY packages/common/ ./packages/common/

# Generate Prisma Client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Copy API source
COPY services/api/ ./services/api/

# Build the API
RUN npm run build --workspace=services/api

########################################
# Stage 2 — Production Image
########################################
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy built output and required files
COPY --from=builder /app/services/api/dist ./services/api/dist
COPY --from=builder /app/services/api/package.json ./services/api/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/common ./packages/common
COPY --from=builder /app/package.json ./

# Prisma needs the schema at runtime for migrations
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Start the API: push schema then run
CMD sh -c "npx prisma db push --schema=packages/database/prisma/schema.prisma --skip-generate && node services/api/dist/main.js"

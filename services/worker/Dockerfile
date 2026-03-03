########################################
# Stage 1 — Install & Build
########################################
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json turbo.json ./

# Copy only what the worker needs from the monorepo
COPY services/worker/package.json ./services/worker/
COPY packages/database/package.json ./packages/database/
COPY packages/common/package.json ./packages/common/

# Install all deps (monorepo-aware)
RUN npm ci --workspace=services/worker --workspace=packages/database --workspace=packages/common --include-workspace-root

# Copy source for packages the worker depends on
COPY packages/database/ ./packages/database/
COPY packages/common/ ./packages/common/

# Generate Prisma Client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Copy worker source
COPY services/worker/ ./services/worker/

# Build the worker
RUN npm run build --workspace=services/worker

########################################
# Stage 2 — Production Image
########################################
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy built output and required files
COPY --from=builder /app/services/worker/dist ./services/worker/dist
COPY --from=builder /app/services/worker/package.json ./services/worker/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/common ./packages/common
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV WORKER_PORT=3002
EXPOSE 3002

CMD ["node", "services/worker/dist/main.js"]

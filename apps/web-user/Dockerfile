########################################
# Stage 1 — Install Dependencies
########################################
FROM node:20-alpine AS deps

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./

# Copy only this app's package.json
COPY apps/web-user/package.json ./apps/web-user/

# Install dependencies
RUN npm ci --workspace=apps/web-user --include-workspace-root

########################################
# Stage 2 — Build
########################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web-user/node_modules ./apps/web-user/node_modules
COPY package.json turbo.json ./
COPY apps/web-user/ ./apps/web-user/
COPY packages/ ./packages/

# Set build-time env for API URL (will be overridden at runtime)
ENV INTERNAL_API_URL=http://api:3001

WORKDIR /app/apps/web-user
RUN npm run build

########################################
# Stage 3 — Production Runner
########################################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy standalone output
COPY --from=builder /app/apps/web-user/.next/standalone ./
COPY --from=builder /app/apps/web-user/.next/static ./apps/web-user/.next/static
COPY --from=builder /app/apps/web-user/public ./apps/web-user/public

EXPOSE 3000

CMD ["node", "apps/web-user/server.js"]

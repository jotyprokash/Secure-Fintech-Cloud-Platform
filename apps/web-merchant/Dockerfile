########################################
# Stage 1 — Install Dependencies
########################################
FROM node:20-alpine AS deps

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./

# Copy only this app's package.json
COPY apps/web-merchant/package.json ./apps/web-merchant/

# Install dependencies
RUN npm ci --workspace=apps/web-merchant --include-workspace-root

########################################
# Stage 2 — Build
########################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web-merchant/node_modules ./apps/web-merchant/node_modules
COPY package.json turbo.json ./
COPY apps/web-merchant/ ./apps/web-merchant/
COPY packages/ ./packages/

# Set build-time env for API URL (will be overridden at runtime)
ENV INTERNAL_API_URL=http://api:3001

WORKDIR /app/apps/web-merchant
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
COPY --from=builder /app/apps/web-merchant/.next/standalone ./
COPY --from=builder /app/apps/web-merchant/.next/static ./apps/web-merchant/.next/static
COPY --from=builder /app/apps/web-merchant/public ./apps/web-merchant/public

EXPOSE 3000

CMD ["node", "apps/web-merchant/server.js"]

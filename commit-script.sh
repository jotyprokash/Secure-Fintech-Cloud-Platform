#!/bin/bash

# Commit 1: Initial project setup
git add package.json turbo.json .gitignore
git commit -m "Initial project setup with Turborepo monorepo structure"

# Commit 2: Docker infrastructure
git add docker-compose.yml
git commit -m "Add Docker Compose for PostgreSQL, Redis, and MinIO"

# Commit 3: Database schema
git add packages/database/
git commit -m "Create Prisma schema with double-entry ledger system"

# Commit 4: Common utilities
git add packages/common/
git commit -m "Add shared utilities and types package"

# Commit 5: Backend foundation
git add services/api/package.json services/api/tsconfig.json services/api/nest-cli.json
git commit -m "Set up NestJS backend API service"

# Commit 6: Prisma module
git add services/api/src/prisma/
git commit -m "Implement Prisma database module for backend"

# Commit 7: System module
git add services/api/src/system/
git commit -m "Create system module for bank accounts initialization"

# Commit 8: Ledger module
git add services/api/src/ledger/
git commit -m "Implement double-entry ledger accounting system"

# Commit 9: Users module
git add services/api/src/users/
git commit -m "Add users module with wallet creation logic"

# Commit 10: Authentication
git add services/api/src/auth/
git commit -m "Implement JWT authentication with bcrypt password hashing"

# Commit 11: Wallets module
git add services/api/src/wallets/
git commit -m "Create wallets module to fetch user balances"

# Commit 12: Transfers module
git add services/api/src/transfers/
git commit -m "Build transfers module with P2P and deposit functionality"

# Commit 13: Merchants module
git add services/api/src/merchants/
git commit -m "Add merchants module for business onboarding and invoicing"

# Commit 14: App module integration
git add services/api/src/app.module.ts services/api/src/app.controller.ts services/api/src/app.service.ts
git commit -m "Wire up all modules in main application"

# Commit 15: Main entry point
git add services/api/src/main.ts
git commit -m "Configure NestJS bootstrap with BigInt serialization"

# Commit 16: E2E tests
git add services/api/test/
git commit -m "Add end-to-end tests for core user flows"

# Commit 17: User portal setup
git add apps/web-user/package.json apps/web-user/tsconfig.json apps/web-user/next.config.ts apps/web-user/tailwind.config.ts apps/web-user/postcss.config.mjs
git commit -m "Initialize Next.js user portal with Tailwind CSS"

# Commit 18: User portal styles
git add apps/web-user/src/app/globals.css
git commit -m "Add glassmorphism design system with dark theme"

# Commit 19: User portal layout
git add apps/web-user/src/app/layout.tsx apps/web-user/src/app/page.tsx
git commit -m "Create user portal root layout and home redirect"

# Commit 20: API utilities
git add apps/web-user/src/lib/
git commit -m "Build API request utility with JWT token handling"

# Commit 21: User registration
git add apps/web-user/src/app/register/
git commit -m "Implement user registration page with form validation"

# Commit 22: User login
git add apps/web-user/src/app/login/
git commit -m "Create login page with authentication flow"

# Commit 23: User dashboard
git add apps/web-user/app/dashboard/
git commit -m "Build user dashboard with wallet, transfers, and history"

# Commit 24: Merchant portal setup
git add apps/web-merchant/package.json apps/web-merchant/tsconfig.json apps/web-merchant/next.config.ts apps/web-merchant/tailwind.config.ts apps/web-merchant/postcss.config.mjs
git commit -m "Initialize Next.js merchant portal application"

# Commit 25: Merchant portal styles
git add apps/web-merchant/src/app/globals.css
git commit -m "Add emerald-themed glassmorphism styles for merchants"

# Commit 26: Merchant portal layout
git add apps/web-merchant/src/app/layout.tsx apps/web-merchant/src/app/page.tsx
git commit -m "Set up merchant portal layout and routing"

# Commit 27: Merchant API utilities
git add apps/web-merchant/src/lib/
git commit -m "Create merchant-specific API utilities"

# Commit 28: Merchant registration
git add apps/web-merchant/src/app/register/
git commit -m "Implement merchant registration with business name"

# Commit 29: Merchant login
git add apps/web-merchant/src/app/login/
git commit -m "Add merchant login page"

# Commit 30: Merchant dashboard
git add apps/web-merchant/src/app/dashboard/
git commit -m "Build merchant dashboard with invoice management"

# Commit 31: Test scripts
git add test-all.sh test-scripts/
git commit -m "Add comprehensive E2E test suite"

# Commit 32: README
git add README.md
git commit -m "Create detailed README with setup instructions and demos"

# Commit 33: Walkthrough
git add WALKTHROUGH.md
git commit -m "Document development journey and architecture decisions"

# Commit 34: Final touches
git add .
git commit -m "Polish UI components and fix remaining issues"

echo "✅ Created 34 commits successfully!"

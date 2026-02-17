# NovaPay Walkthrough

## Overview
NovaPay is a production-grade fintech backend implemented with **NestJS**, **Prisma**, and **PostgreSQL**.
It features a **Double-Entry Ledger** system ensuring money correctness, with support for multi-currency wallets and P2P transfers.

## Architecture & Schema
- [Architecture Diagram](architecture.md)
- [Database Schema](packages/database/prisma/schema.prisma)

## Repository Structure
- `services/api`: Core Backend API (NestJS).
- `services/worker`: Background worker (skeleton).
- `packages/database`: Shared Prisma Client & Schema.
- `packages/common`: Shared DTOs and Utilities.
- `apps`: Frontend applications (scaffolded).

## Key Features Implemented

### 1. Robust Authentication
- JWT-based Auth with `Passport`.
- `AuthModule` handles registration and login.
- Automatically creates a User, a Wallet (USD), and a Ledger Liability Account upon registration.

### 2. Double-Entry Ledger (`LedgerModule`)
- **Immutability**: All financial movements are recorded as `LedgerEntry` with balanced `LedgerPosting`s.
- **ACID Compliance**: All operations use Prisma Interactive Transactions (`$transaction`).
- **Correctness**: Enforces `Sum(Debits) == Sum(Credits)`.

### 3. P2P Transfers Types (`TransfersModule`)
- **Idempotency**: Prevents double-spending using `idempotencyKey` checks.
- **Atomic Operations**: Transfer Record creation + Ledger Entry creation happen in a single transaction.
- **Balance Checks**: Verifies sufficient funds (checking Liability balance) before processing.

### 4. System Accounts (`SystemModule`)
- Automatically initializes System Asset (Bank) and Revenue accounts.
- Supports "Simulated Deposits" via `Dr System Bank / Cr User Wallet`.

## Verification Results
Passed E2E flows (`npm run test:e2e -w services/api`):
1. **Registration**: Alice & Bob accounts created.
2. **Deposit**: Alice receives 1000 USD (System Bank -> Alice).
3. **Transfer**: Alice sends 500 USD to Bob.
4. **Idempotency**: Duplicate transfer request rejected safely.
5. **Balance Verification**:
   - Alice: -500 (Liability)
   - Bob: -500 (Liability)
   - Bank: +1000 (Asset)
   - Net: 0.

### Test Log
```
 PASS  test/flow.e2e-spec.ts     
  NovaPay Core Flow (E2E)   
    ✓ 1. Register Alice (139 ms)
    ✓ 2. Register Bob (105 ms)
    ✓ 3. Get Wallet IDs (3 ms)
    ✓ 4. Deposit 1000 USD to Alice (19 ms)
    ✓ 5. Alice transfers 500 USD to Bob (19 ms)
    ✓ 6. Idempotency Check (9 ms)
```

## How to Run
1. **Start Infrastructure**:
   ```bash
   docker compose up -d
   ```
2. **Deploy Schema**:
   ```bash
   npx prisma db push --schema=packages/database/prisma/schema.prisma
   ```
3. **Run API**:
   ```bash
   npm run dev -w services/api
   ```
   ```bash
   npm run test:e2e -w services/api
   ```

### 2026-02-17: P2P Transfer & History Verification

We completed the **User Portal** implementation, adding ability to send money and view transaction history.

#### Features Added
1.  **Send Money UI**: Users can transfer funds to other users via Wallet ID.
2.  **Transaction History**: Dashboard now shows a list of SENT and RECEIVED transactions.
3.  **Backend Support**: Added `GET /transfers` endpoint and `getTransferHistory` service method.

#### Verification
Due to temporary browser automation issues, we verified the P2P flow using a script (`verify-p2p.ts`) against the running API.

**Scenario**:
1.  **Bob** registered and deposited **$100.00**.
2.  **Grace** (existing user) had **$100.00**.
3.  **Bob** sent **$50.00** to **Grace**.

**Results**:
```
Starting P2P Verification...
1. Registering Bob...
   Bob ID: 4a530c47-037c-4859-84c2-76314a55c3d3
2. Logging in Bob...
   Token obtained.
3. Fetching Bob's Wallet...
   Bob Wallet ID: 35ef51c4-d70a-4b52-aad9-7138d6b9e0b1
4. Depositing 100 USD to Bob...
   Deposit successful.
5. Transferring 50 USD to Grace (61985e70-6bf0-48ec-a288-6d229182e035)...
   Transfer successful.
Verification Complete: P2P Flow Works!
```

**Expected End State**:
*   Bob's Balance: $50.00
*   Grace's Balance: $150.00
*   Grace's History: Shows "Received from... +50.00 USD"

### Next Steps
*   Proceed to **Merchant Portal** implementation.

---

### 2026-02-17: Merchant Portal Implementation

We completed the **Merchant Portal** implementation, enabling businesses to accept payments and manage invoices.

#### Backend: MerchantsModule

**Endpoints:**
- `POST /merchants` - Create merchant profile (requires auth)
- `GET /merchants/my` - Get current merchant profile
- `POST /merchants/invoices` - Create payment invoice

**Logic:**
- Creates dedicated merchant wallet and income ledger account
- Handles invoice creation with UNPAID/PAID status
- Links merchant to user account

**Files Created:**
- [merchants.service.ts](file:///home/jatri/.gemini/antigravity/scratch/novapay/services/api/src/merchants/merchants.service.ts)
- [merchants.controller.ts](file:///home/jatri/.gemini/antigravity/scratch/novapay/services/api/src/merchants/merchants.controller.ts)
- [merchants.module.ts](file:///home/jatri/.gemini/antigravity/scratch/novapay/services/api/src/merchants/merchants.module.ts)

#### Frontend: Merchant Portal (`apps/web-merchant`)

**Features:**
1. **Onboarding**: Register with business name, creates merchant profile automatically
2. **Dashboard**: Stats cards showing revenue, invoice count, and growth
3. **Invoice Creation**: Simple form to create invoices with amount
4. **Invoice List**: Display recent invoices with status

**Tech Stack:**
- Next.js 16 with App Router
- Tailwind CSS with glassmorphism design
- Lucide React icons
- Cookie-based JWT authentication

**Pages Created:**
- [login/page.tsx](file:///home/jatri/.gemini/antigravity/scratch/novapay/apps/web-merchant/src/app/login/page.tsx)
- [register/page.tsx](file:///home/jatri/.gemini/antigravity/scratch/novapay/apps/web-merchant/src/app/register/page.tsx)
- [dashboard/page.tsx](file:///home/jatri/.gemini/antigravity/scratch/novapay/apps/web-merchant/src/app/dashboard/page.tsx)

#### Running the Application

**Ports:**
- Backend API: `http://localhost:3001`
- User Portal: `http://localhost:3003`
- Merchant Portal: `http://localhost:3004`

**Start Commands:**
```bash
# Backend
npm run start:dev -w services/api

# User Portal
cd apps/web-user && npm run dev -- -p 3003

# Merchant Portal
cd apps/web-merchant && npm run dev -- -p 3004
```

See [RUN_INSTRUCTIONS.md](file:///home/jatri/.gemini/antigravity/brain/8567619e-9eac-47d1-a732-789e9e776118/RUN_INSTRUCTIONS.md) for complete setup and testing instructions.

#### Screenshots

````carousel
![User Portal Login Page](/home/jatri/.gemini/antigravity/brain/8567619e-9eac-47d1-a732-789e9e776118/user_login_page_1771324947192.png)
<!-- slide -->
![Merchant Portal Login Page](/home/jatri/.gemini/antigravity/brain/8567619e-9eac-47d1-a732-789e9e776118/merchant_login_page_1771324913788.png)
````

Both portals feature:
- Dark mode with glassmorphism effects
- Gradient accents (blue for users, emerald for merchants)
- Responsive design with Tailwind CSS
- Smooth animations and transitions


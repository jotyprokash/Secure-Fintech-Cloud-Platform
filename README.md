<p align="center">
  <h1 align="center">💸 NovaPay</h1>
  <p align="center">
    <strong>A cloud-native Fintech platform for digital wallets, P2P transfers, and merchant payments</strong>
  </p>
  <p align="center">
    Built with NestJS · Next.js · Prisma · PostgreSQL · Docker
  </p>
</p>



## 📋 Overview

**NovaPay** is a full-stack digital wallet platform that demonstrates core fintech patterns:

- **User Wallets** — Register, deposit funds, check balance
- **P2P Transfers** — Send money to other users with idempotency protection
- **Merchant System** — Create merchant profiles, generate invoices
- **Double-Entry Ledger** — Every transaction is recorded with balanced debit/credit postings
- **Multi-Portal** — Separate User and Merchant web dashboards



## 🏗️ Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| **API**      | NestJS (Node.js)                    |
| **Database** | PostgreSQL 15 + Prisma ORM          |
| **Frontend** | Next.js 16 (React 19, TailwindCSS)  |
| **Auth**     | JWT + Passport.js                    |
| **Queue**    | Redis (for future worker tasks)      |
| **Storage**  | MinIO (S3-compatible, for KYC docs)  |
| **Email**    | MailHog (dev SMTP testing)           |
| **DevOps**   | Docker, Docker Compose               |



## 🧭 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Network                         │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌───────────┐                │
│  │ web-user │   │web-merch │   │    API    │                │
│  │ :3000    │──▶│ :3003    │──▶│  :3001   │                 │
│  │ Next.js  │   │ Next.js  │   │  NestJS  │                 │
│  └──────────┘   └──────────┘   └────┬──────┘                │
│                                      │                      │
│               ┌──────────────────────┼──────────┐           │
│               │                      │          │           │
│         ┌─────▼─────┐         ┌──────▼───┐ ┌───▼────┐       │
│         │ PostgreSQL │         │  Redis   │ │ Worker │      │
│         │   :5432    │         │  :6379   │ │ :3002  │      │
│         └────────────┘         └──────────┘ └────────┘      │
│                                                             │
│         ┌────────────┐         ┌──────────┐                 │
│         │   MinIO     │         │ MailHog  │                │
│         │ :9000/:9001 │         │ :8025    │                │
│         └────────────┘         └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```



## 📁 Project Structure

```
novapay/
├── apps/
│   ├── web-user/          # User-facing wallet dashboard (Next.js)
│   └── web-merchant/      # Merchant payment portal (Next.js)
├── services/
│   ├── api/               # Core REST API (NestJS)
│   │   └── src/
│   │       ├── auth/      # JWT authentication
│   │       ├── users/     # User management
│   │       ├── wallets/   # Wallet queries
│   │       ├── transfers/ # Deposits & P2P transfers
│   │       ├── ledger/    # Double-entry ledger engine
│   │       ├── merchants/ # Merchant profiles & invoices
│   │       ├── system/    # System account bootstrapping
│   │       └── prisma/    # Database connection
│   └── worker/            # Background job processor (NestJS)
├── packages/
│   ├── database/          # Prisma schema & client
│   ├── common/            # Shared DTOs & utilities
│   ├── ui/                # Shared React components
│   ├── eslint-config/     # Shared ESLint config
│   └── typescript-config/ # Shared TypeScript config
├── docker-compose.yml     # Full orchestration
├── .env.example           # Environment template
└── turbo.json             # Turborepo configuration
```



## ⚙️ Prerequisites

- **Docker** (v20.10+) — [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2+) — Included with Docker Desktop

That's it. No Node.js, npm, or PostgreSQL installation required on your machine.

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/jotyprokash/Secure-Fintech-Cloud-Platform.git
cd Secure-Fintech-Cloud-Platform
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

> The default `.env.example` values are ready for local development. No changes needed.

### 3. Build and start all services

```bash
docker compose up -d --build
```

This will:
- Pull PostgreSQL, Redis, MinIO, and MailHog images
- Build the API, Worker, and both frontend apps
- Run Prisma migrations automatically
- Start everything on a shared network

### 4. Verify containers are running

```bash
docker compose ps
```

You should see all 7 containers (`novapay-api`, `novapay-worker`, `novapay-web-user`, `novapay-web-merchant`, `novapay-postgres`, `novapay-redis`, `novapay-minio`) with status `Up`.

### 5. Open in browser

| Service           | URL                          |
|-------------------|------------------------------|
| **User Portal**   | http://localhost:3000         |
| **Merchant Portal** | http://localhost:3003       |
| **API**           | http://localhost:3001         |
| **MinIO Console** | http://localhost:9001         |
| **MailHog UI**    | http://localhost:8025         |



## 🔧 Environment Variables

| Variable        | Description                | Default                     |
|----------------|----------------------------|-----------------------------|
| `DATABASE_URL`  | PostgreSQL connection URL  | `postgresql://novapay:password@localhost:5432/novapay` |
| `REDIS_HOST`    | Redis hostname             | `localhost`                 |
| `REDIS_PORT`    | Redis port                 | `6379`                      |
| `JWT_SECRET`    | JWT signing secret         | `super-secret-dev-key`      |
| `PORT`          | API server port            | `3001`                      |
| `WORKER_PORT`   | Worker server port         | `3002`                      |

> ⚠️ In Docker Compose, these are overridden with container-aware values (e.g., `postgres` instead of `localhost`).



## 📦 Docker Commands

### Build
```bash
docker compose build
```

### Start (detached)
```bash
docker compose up -d
```

### Stop
```bash
docker compose down
```

### Rebuild after code changes
```bash
docker compose up -d --build
```

### View logs (all services)
```bash
docker compose logs -f
```

### View logs (specific service)
```bash
docker compose logs -f api
docker compose logs -f web-user
```

### Restart a single service
```bash
docker compose restart api
```

### Full cleanup (including volumes)
```bash
docker compose down -v
```



## 🔌 API Endpoints

| Method | Endpoint              | Auth     | Description                |
|--------|-----------------------|----------|----------------------------|
| GET    | `/`                   | No       | Health check               |
| POST   | `/auth/register`      | No       | Register new user          |
| POST   | `/auth/login`         | No       | Login (returns JWT)        |
| GET    | `/auth/profile`       | JWT      | Get current user profile   |
| GET    | `/wallets`            | JWT      | Get user wallets + balance |
| POST   | `/transfers/deposit`  | JWT      | Deposit funds to wallet    |
| POST   | `/transfers`          | JWT      | P2P transfer               |
| GET    | `/transfers`          | JWT      | Transfer history           |
| POST   | `/merchants`          | JWT      | Create merchant profile    |
| GET    | `/merchants/my`       | JWT      | Get your merchant profile  |
| POST   | `/merchants/invoices` | JWT      | Create an invoice          |



## 🧪 Test the API

```bash
# Register a user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use the returned token for authenticated requests
curl http://localhost:3001/wallets \
  -H "Authorization: Bearer <your-token>"
```



## 🛠️ Troubleshooting

### Container won't start
```bash
# Check logs for the failing container
docker compose logs api

# Restart from scratch
docker compose down -v
docker compose up -d --build
```

### Database connection errors
```bash
# Verify PostgreSQL is healthy
docker compose ps postgres

# Check if migrations ran
docker compose logs api | grep -i prisma
```

### Port already in use
```bash
# Find what's using the port
lsof -i :3001

# Kill the process or change the port in docker-compose.yml
```

### Frontend shows API errors
- Ensure the API container is running: `docker compose ps api`
- Check API health: `curl http://localhost:3001/`
- The frontend proxies `/api/*` to the API service inside Docker network

### Rebuild everything fresh
```bash
docker compose down -v
docker system prune -af
docker compose up -d --build
```



<p align="center">
  Built with ❤️ by <a href="https://github.com/jotyprokash">Joty</a>
</p>

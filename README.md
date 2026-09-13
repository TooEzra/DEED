# THE DEED HOSTELS

**Smart Hostel Management Platform**

A production-ready, single-property rental/hostel management web application built for **THE DEED HOSTELS**.

## Features

- **Three roles**: Admin, Caretaker, Tenant with strict server-side RBAC
- **House management** — create, edit, assign, vacate, status tracking
- **Tenant management** — profiles, assignment, balances, isolation
- **Rent & payments** — full/partial/advance payments, balance calculation
- **M-Pesa ready** — STK Push architecture with callback verification
- **Maintenance** — request workflow with photos and status tracking
- **Leases** — create, renew, terminate, expiry alerts
- **Expenses** — category tracking and net income calculation
- **Announcements & notifications**
- **Reports** — occupancy, collection, financial summary
- **Audit logs** — full action trail for Admin
- **Responsive UI** — desktop, tablet, mobile

## Tech Stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide
- Backend: Next.js Server Actions / API Routes
- Database: PostgreSQL + Prisma ORM
- Auth: JWT sessions (jose), bcrypt
- Validation: Zod
- Payments: M-Pesa Daraja abstraction

## Requirements

- Node.js 18+
- PostgreSQL 14+
- npm

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and AUTH_SECRET

# 3. Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed development data
npx prisma db seed

# 5. Start development server
npm run dev
```

Open http://localhost:3000

## Development Credentials (FAKE — seed only)

| Role      | Email                          | Password      |
|-----------|--------------------------------|---------------|
| Admin     | admin@thedeedhostels.com       | Password123!  |
| Caretaker | caretaker@thedeedhostels.com   | Password123!  |
| Tenant    | john.doe@example.com           | Password123!  |
| Tenant    | mary.jane@example.com          | Password123!  |

## Environment Variables

See `.env.example` for the full list.

Critical:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/the_deed_hostels"
AUTH_SECRET="long-random-string-at-least-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Key Business Rules

1. Single property only — THE DEED HOSTELS
2. One active house assignment per tenant
3. House cannot have two active tenants
4. Financial records are never silently deleted
5. Tenant data isolation enforced server-side
6. Only Admin can modify system settings / view audit logs

## M-Pesa Flow

Tenant → Pay Rent → STK Push → Customer confirms → Daraja callback → Verify → Record payment → Update balance → Receipt

Payment is never marked completed until the callback is validated.

## License

Private — THE DEED HOSTELS

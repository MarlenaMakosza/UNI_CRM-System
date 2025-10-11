# Quick Start - CRM System

## Prerequisites

Before starting, make sure you have installed (see `docs/minimal-student/INSTALLATION.md`):
- Deno 2.0+
- Docker Desktop
- VS Code (optional but recommended)

## 1. Start PostgreSQL

```powershell
docker-compose up -d
```

Verify it's running:
```powershell
docker ps
```

You should see `crm-postgres` container running.

## 2. Configure environment

Copy the example environment file:
```powershell
cp .env.example .env
```

Generate a secure AUTH_SECRET:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Edit `.env` and paste the generated string as `AUTH_SECRET`.

## 3. Install dependencies

```powershell
deno install
```

## 4. Run database migrations

Generate migration files:
```powershell
deno task db:generate
```

Apply migrations to database:
```powershell
deno task db:migrate
```

## 5. Seed test users

```powershell
deno run --allow-all src/lib/server/db/seed.ts
```

This creates 4 test users:
- `ph.poznan` / `password` (PH - Poznan)
- `ph.wroclaw` / `password` (PH - Wroclaw)
- `ph.szczecin` / `password` (PH - Szczecin)
- `manager` / `password` (Kierownik)

## 6. Start development server

```powershell
deno task dev
```

Open browser at: http://localhost:5173

## 7. Login

Use any of the test accounts from step 5.

---

## Troubleshooting

### Database connection error

Check if PostgreSQL is running:
```powershell
docker ps
```

If not, start it:
```powershell
docker-compose up -d
```

### Port 5173 already in use

Kill the process using the port or change it in `vite.config.ts`.

### Deno installation issues

Verify Deno is in PATH:
```powershell
deno --version
```

If not found, see `docs/minimal-student/INSTALLATION.md` step 1.3.

---

## What's implemented

✅ **Authentication** (Lucia + Argon2)
- Login page with validation
- Session management
- Protected routes
- Logout functionality

✅ **Database Schema** (Drizzle ORM + PostgreSQL)
- Users table (PH + Manager roles)
- Leads table (with territorial assignment)
- Activities table (phone contacts)
- Visits table (scheduled visits)
- Contracts table (optional)
- Sessions table (Lucia auth)

✅ **Dashboard**
- User profile display
- Role-based greeting
- Quick action buttons
- Stats cards (placeholders)

## Next steps

To continue development:

1. **Implement Leads CRUD** (`/leads`)
   - List leads (filtered by assigned_to for PH)
   - Add new lead form
   - Edit lead
   - View lead details with timeline

2. **Implement Phone Contacts** (`/activities`)
   - Main screen for "instrukcja obslugi"
   - 6 outcome types
   - Redirect to visit planning if MEETING_SET

3. **Implement Visits** (`/visits`)
   - Calendar view
   - Add/edit visit form
   - Mark as DONE/CANCELLED/NO_SHOW
   - Competitor prices field

4. **Implement Reports** (`/reports`)
   - Manager-only access
   - Filter by PH, date range, city
   - Stats: visits, calls, contracts per PH

---

**Status**: Basic authentication + database schema complete
**Next commit**: Leads CRUD functionality

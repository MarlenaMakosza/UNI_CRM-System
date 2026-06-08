# CRM System

A university project. A CRM for managing clients, contracts and events for a small sales team.

![Dashboard](dashboard.png)

## Tech stack

| Technology | Role |
|---|---|
| [Deno](https://deno.land/) + [Oak](https://deno.land/x/oak) | Backend REST API |
| [SvelteKit](https://kit.svelte.dev/) | Frontend |
| [PostgreSQL](https://www.postgresql.org/) | Database |
| [Docker Compose](https://docs.docker.com/compose/) | Local environment |
| TypeScript | Everywhere |

## Features

- Client database (companies + decision maker contacts)
- Logging phone calls and scheduling visits
- Post-visit notes (outcome, competitor prices)
- Contract recording
- Follow-up reminders
- Manager reports: visits, contracts, calls, turnover per client

## Requirements

- [Docker](https://www.docker.com/) and Docker Compose

## Quick start

```bash
cp .env.example .env
docker compose up -d --build
```

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api

## Test accounts

| Name | Role | Email | Password |
|------|------|-------|----------|
| Jan Kowalski | Boss | jan.kowalski@firmx.pl | password123 |
| Anna Nowak | Employee | anna.nowak@firmx.pl | password123 |
| Piotr Wiśniewski | Employee | piotr.wisniewski@firmx.pl | password123 |
| Marek Zieliński | Employee | marek.zielinski@firmx.pl | password123 |

## Stopping the system

```bash
docker compose down        # stop
docker compose down -v     # stop + remove database data
```

## Local development

### Backend (Deno)

```bash
docker compose up db -d
deno task dev
```

### Frontend (SvelteKit)

```bash
cd frontend
npm install
npm run dev
```

## Project structure

```
backend/      # Deno REST API (Oak)
frontend/     # SvelteKit app
db/           # SQL schema, seed data, DB client
diagrams/     # architecture and DB diagrams
.postman/     # Postman collection for API testing
```

## Note on AI assistance

The frontend was developed with the assistance of AI tools (Claude by Anthropic). All code was reviewed, understood, and integrated by the author.

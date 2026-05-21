# LoreKeeper

A PWA DM companion app for D&D. Players join campaigns by code — no accounts required. The flagship feature is the **Fate Engine**: the DM sets intent, the app secretly picks a target, and the targeted player gets a push notification before the DM even knows who was chosen.

---

## Prerequisites

### 1. Node.js 18+

Download from [nodejs.org](https://nodejs.org) or install via a version manager:

```bash
# Homebrew (macOS)
brew install node

# nvm (any OS)
nvm install 20
nvm use 20
```

### 2. Docker Desktop

Required to run Supabase locally.

1. Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Install and launch Docker Desktop
3. Verify: `docker --version`

### 3. Supabase CLI

```bash
# Homebrew (macOS/Linux)
brew install supabase/tap/supabase

# npm (any OS)
npm install -g supabase

# Verify
supabase --version
```

---

## Local Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd LoreKeeper
npm install
```

### 2. Start local Supabase

This spins up a full Supabase stack in Docker — Postgres, API, Realtime, Studio — and applies all migrations automatically.

```bash
supabase start
```

First run pulls Docker images (~1 GB) and takes a few minutes. Subsequent starts are fast.

Once running, the local stack is available at:
| Service | URL |
|---|---|
| **Studio (DB browser)** | **http://127.0.0.1:54333** |
| API (use this for `SUPABASE_URL`) | http://127.0.0.1:54331 |
| Database (direct Postgres) | postgresql://postgres:postgres@127.0.0.1:54332/postgres |

Open Studio to browse tables, run SQL, inspect Realtime events, and manage auth — it's the full Supabase dashboard running locally.

> **Note:** This project runs on offset ports (5433x) because another Supabase project may already be using the default 5432x ports. If you have no other projects running, you can revert the ports in `supabase/config.toml`.

### 3. Set up environment variables

The local keys are pre-filled in `.env.local.example` — just copy it:

```bash
cp .env.local.example .env.local
```

The Supabase section is already filled in for local dev. You only need to add VAPID keys for Web Push:

```bash
npx web-push generate-vapid-keys
```

Copy the output into `.env.local`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<paste public key>
VAPID_PRIVATE_KEY=<paste private key>
VAPID_CONTACT_EMAIL=mailto:you@example.com
```

> **Push notifications in local dev:** Web Push requires HTTPS for real devices. For local testing on your own machine it will still work via `localhost`. To test on a phone, use a tunnel:
> ```bash
> npx localtunnel --port 3000
> ```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Stop Supabase when done

```bash
supabase stop
```

Data is preserved between stops. To reset the database to a clean state:

```bash
supabase db reset
```

---

## Database Migrations

Migrations live in `supabase/migrations/`. When you add or change the schema:

```bash
# Create a new migration file
supabase migration new <description>

# Apply all pending migrations locally
supabase db reset

# Push to a hosted Supabase project
supabase db push
```

---

## Project Structure

```
src/
├── managers/        # Orchestration layer — workflow and sequencing
├── engines/         # Business logic — pure functions, no I/O
├── accessors/       # Data access — Supabase, Web Push
├── utilities/       # Cross-cutting helpers — dice, tables, push payloads
├── common/          # Shared base types and HandlerResolver infrastructure
│   └── resolver/
└── container/       # Dependency wiring — all composition happens here

src/app/
├── dm/              # DM-facing pages
├── play/            # Player-facing pages
└── api/             # Next.js API routes

supabase/
├── config.toml      # Local Supabase configuration and port settings
└── migrations/      # SQL migration files (applied in order)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full layer map, data models, and Fate Engine flow.
See [PLANNING.md](PLANNING.md) for the feature roadmap and phase breakdown.

---

## Architecture

This project follows iDesign / volatility-based decomposition. Every component belongs to one layer (Client, Manager, Engine, Accessor, Utility) with strict call rules between them. Read [ARCHITECTURE.md](ARCHITECTURE.md) before writing new code.

The short version:
- **Clients** call Managers only
- **Managers** orchestrate Engines and Accessors
- **Engines** hold pure business logic (no I/O)
- **Accessors** talk to Supabase and Web Push (no logic)
- **Utilities** are stateless helpers anyone can call

All operations use typed `Request` / `Response` objects. Layer implementations are thin shells that delegate to `HandlerResolver`. All logic lives in `handlers/` subdirectories.

---

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Set these environment variables in Vercel → Project → Settings → Environment Variables — use your **hosted Supabase project** values (not the local ones):

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Same keys you generated locally |
| `VAPID_PRIVATE_KEY` | Same keys you generated locally |
| `VAPID_CONTACT_EMAIL` | Your email |

Connect your domain under Vercel → Project → Domains.

Push the schema to your hosted project:

```bash
supabase db push
```

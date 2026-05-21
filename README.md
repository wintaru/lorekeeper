# LoreKeeper

A PWA DM companion app for D&D. Players join campaigns by code — no accounts required. The flagship feature is the **Fate Engine**: the DM sets intent, the app secretly picks a target, and the targeted player gets a push notification before the DM even knows who was chosen.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine)

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd LoreKeeper
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Generate below |
| `VAPID_PRIVATE_KEY` | Generate below |
| `VAPID_CONTACT_EMAIL` | Your email address |

**Generate VAPID keys (one-time setup):**

```bash
npx web-push generate-vapid-keys
```

Copy the output into `.env.local`.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs fully locally — Supabase handles the database and real-time sync, everything else is in-process.

> **Push notifications in local dev:** Web Push requires HTTPS for real devices. For local testing, use the Fate Engine's built-in dev mode which bypasses the push step and logs the target to the console instead. On a real device, use a tunnel like `npx localtunnel --port 3000` or `ngrok`.

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

app/
├── dm/              # DM-facing pages
└── play/            # Player-facing pages

public/
└── sw.js            # Service worker for Web Push notifications
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full layer map, data models, and Fate Engine flow.  
See [PLANNING.md](PLANNING.md) for the feature roadmap and phase breakdown.

## Architecture

This project follows iDesign / volatility-based decomposition. Every component belongs to one layer (Client, Manager, Engine, Accessor, Utility) with strict call rules between them. Read [ARCHITECTURE.md](ARCHITECTURE.md) before writing new code.

The short version:
- **Clients** call Managers only
- **Managers** orchestrate Engines and Accessors
- **Engines** hold pure business logic (no I/O)
- **Accessors** talk to Supabase and Web Push (no logic)
- **Utilities** are stateless helpers anyone can call

All operations use typed `Request` / `Response` objects. Layer implementations are thin shells that delegate to `HandlerResolver`. All logic lives in `handlers/` subdirectories.

## Deployment

Deploy to Vercel (recommended):

```bash
npx vercel
```

Add the same variables from `.env.local` to your Vercel project → Settings → Environment Variables. Connect your domain under Project → Domains.

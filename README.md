# Mustang Terminal

Internal web platform for **Mustang Capital Group** — a student-run investment fund at Cal Poly managing ~$1M of real capital. Five integrated modules: Portfolio Dashboard, Pitch & Voting, DCF Valuation, Analyst Training, and Research Knowledge Base.

## Tech Stack

- **Vite + React + TypeScript** — single-page app
- **Tailwind CSS** — brand tokens (MCG green/cream/brass palette)
- **Zustand** — global state
- **Recharts** — all charts
- **Supabase** — Postgres database, auth (email + Google), row-level security
- **Vercel** — deployment

---

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Start dev server (runs in demo/mock mode — no database required)
npm run dev
```

Open `http://localhost:5173`. The app starts in **demo mode** with seed data. Use the demo accounts below to log in.

### Demo Accounts (mock mode)

| Email | Role | Access |
|-------|------|--------|
| `officer@mustang.test` | Officer | Full admin — edit holdings, approve pitches, manage cards |
| `analyst@mustang.test` | Analyst | Read + submit pitches, vote, create research notes |

Any password works in demo mode. Use the role-switcher widget (bottom-right) to toggle between accounts without logging out.

---

## Environment Variables

Create `.env.local` in the project root:

```bash
# Supabase (optional — app runs in demo mode without these)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Market data — Financial Modeling Prep free tier (optional)
# See: https://financialmodelingprep.com/developer/docs/
# NOTE: This key is visible in the browser bundle. For production,
# proxy it through a Supabase Edge Function.
VITE_MARKET_API_KEY=your_api_key_here
```

The app has three operating modes:
- **Demo/mock mode** — no env vars needed; data lives in localStorage; great for development
- **Prices only** — add `VITE_MARKET_API_KEY`; holdings show real-time prices
- **Full production** — all three vars; real Supabase database + auth + live prices

---

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run `supabase/schema.sql` (creates all tables, RLS policies, and the auto-profile trigger)
3. In Authentication settings, enable Email provider and optionally Google OAuth
4. Copy your Project URL and anon key into `.env.local`

### Promoting to Officer

New signups default to the `analyst` role. To make someone an officer:

```sql
UPDATE profiles SET role = 'officer' WHERE email = 'you@calpoly.edu';
```

---

## Modules

### Portfolio Dashboard
Holdings table (sortable, officer CRUD), AUM metrics, allocation donut, actual-vs-target bar chart, NAV history vs. benchmark. Live prices from Financial Modeling Prep (5-min cache).

### Pitch & Voting
Submit pitches with thesis, target price, and recommendation. Vote Buy/Pass (toggleable). Officers approve/reject with a rationale that's permanently logged. Approved pitches link to the holdings table.

### DCF Valuation Tool
Gordon Growth Model DCF with live-updating inputs (sliders + number fields). Intrinsic value, upside/downside, FCF projection chart, 5×5 sensitivity table (WACC × terminal growth). Save named scenarios per user.

### Analyst Training
Flip-card flashcards with Known/Review marking. Cards ordered unseen → review → known. Per-category progress bars. Officers manage the deck. Ships with 20 seed cards across 5 categories.

### Research Knowledge Base
Markdown notes with title, ticker, tags, and full-text search. Debounced auto-save. Authors and officers can edit/delete. Rendered markdown preview.

---

## Design System

Visit `/design-system` in development to see all color tokens, typography specimens, and UI primitives.

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import into Vercel
3. Set environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MARKET_API_KEY`
4. Deploy — `vercel.json` handles React Router's client-side routing

```bash
npm run build   # produces dist/
```

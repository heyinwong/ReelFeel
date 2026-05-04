# ReelFeel Handoff Notes

Last updated: 2026-05-04

## Current State

ReelFeel is a deployed AI Taste Agent portfolio demo, not a Letterboxd clone.

Live URLs:

- Frontend: https://reel-feel.vercel.app
- Backend health: https://reelfeel-api.onrender.com/health

Deployment stack:

- Frontend: Vercel, root `frontend`, build `npm run build`, output `dist`
- Backend: Render FastAPI service, root `backend`, start `PYTHONPATH=. uvicorn main:app --host 0.0.0.0 --port $PORT`
- Database: Neon Postgres

Core product loop:

1. User logs movies into Reel Log / Watchlist.
2. Reviews create taste snapshots.
3. Taste summary stores a structured profile.
4. Mood recommendation uses TMDB retrieval first, then low-cost LLM reranking/explanation.
5. Title search uses exact TMDB lookup plus a transparent heuristic taste-fit estimate when the user has taste memory.
6. Demo link logs into a read-only curated account for portfolio review.

## Important Recent Changes

- Production readiness is in place: `/health`, production env validation, CORS origins from env, Postgres URL normalization for asyncpg.
- Render is pinned to Python 3.11.11 through `backend/.python-version`.
- Demo Add to Reel Log / Watchlist buttons are visibly disabled in movie details and show `Demo account is read-only`.
- Title-search side panel now shows `Taste fit estimate` for logged-in/demo users instead of overemphasizing a generic lookup pipeline.
- README reflects the deployed Vercel + Render + Neon setup and current smoke coverage.

## Local Dev

Backend:

```bash
cd backend
PYTHONPATH=. ./venv_reelfeel/bin/uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

Frontend:

```bash
cd frontend
VITE_BACKEND_URL=http://127.0.0.1:8001 npm run dev -- --host 127.0.0.1 --port 5173
```

Demo link:

```text
http://127.0.0.1:5173/demo?code=local-demo-code
```

Do not print deployed secret values. The production demo code exists in Render and Vercel env vars.

## Important Files

Backend:

- `backend/config.py`: central config, env loading, CORS, database URL normalization, production safety checks.
- `backend/main.py`: FastAPI app wiring, startup DB init, `/health`, demo seed.
- `backend/auth.py`: JWT auth, `/demo-login`, demo read-only helpers.
- `backend/services/recommendation_service.py`: hybrid TMDB candidate pool + LLM rerank.
- `backend/services/taste_service.py`: snapshots and structured taste profile.
- `backend/services/demo_service.py`: idempotent curated demo account and media refresh.
- `backend/tests/test_foundation.py`: backend foundation coverage.

Frontend:

- `frontend/src/hooks/useAuth.js`: global auth provider.
- `frontend/src/pages/DemoEntryPage.jsx`: magic demo link entry.
- `frontend/src/components/SearchPanel.jsx`: Mood / Title controls and suggestions.
- `frontend/src/components/RecommendBlock.jsx`: carousel + movie detail + side agent panel.
- `frontend/src/components/MovieDetailBlock.jsx`: movie details and demo read-only action buttons.
- `frontend/src/components/TasteAgentConsole.jsx`: compact taste strip, recommendation reasoning, and title-search fit estimate.
- `frontend/src/pages/DashboardPage.jsx`: portfolio proof page for taste profile.

## QA Coverage

Commands passed after the latest UI/doc update:

```bash
PYTHONPATH=backend backend/venv_reelfeel/bin/python -m unittest discover backend/tests
cd frontend && npm run lint
cd frontend && npm run build
```

Production smoke paths tested:

- `GET https://reelfeel-api.onrender.com/health`
- Vercel homepage load
- Demo login through Try Demo
- Mood recommendation for `quiet emotional sci-fi`
- Demo recommendation detail with disabled read-only action buttons
- Dashboard profile/charts/snapshots
- Title search for `Spirited Away`
- Normal temp user registration/login
- Normal user Add to Watchlist

## Known Tradeoffs / Next Work

- Render free tier may cold start.
- No Alembic yet; clean Postgres + automatic table creation is acceptable for this portfolio version.
- Recommendation still relies on prompt-quality JSON; add deterministic tests around invalid LLM output and TMDB edge cases later.
- Demo is read-only but bearer-link based; keep the deployed demo code long and rotate it if needed.
- Next work should be visual polish, not new product scope: recommendation layout balance, homepage rhythm, Login/About/Dashboard consistency, modal polish, screenshots/GIF.

## Suggested Next Chat Prompt

```text
We are continuing ReelFeel at /Users/xixianhuang/Documents/code/ReelFeel.

Please read NEXT_CHAT_HANDOFF.md and inspect the latest code first. The project is a deployed AI Taste Agent portfolio demo: FastAPI backend, React/Vite frontend, TMDB retrieval + low-cost OpenAI reranking for Mood mode, heuristic taste-fit estimate for Title search, and a magic read-only demo account.

First, run git status and the core checks:
- PYTHONPATH=backend backend/venv_reelfeel/bin/python -m unittest discover backend/tests
- cd frontend && npm run lint
- cd frontend && npm run build

Then do a visual/product polish pass for a first-time portfolio reviewer. Do not add major new features. Focus on homepage recommendation layout balance, right-side Taste Agent panel hierarchy, Login/About/Dashboard consistency, modal polish, screenshots/GIF readiness, and any copy that makes the AI reasoning feel vague or fake. Use Playwright to click through the deployed demo and normal-user flows before changing code.
```

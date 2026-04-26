# ReelFeel Handoff Notes

Last updated: 2026-04-27

## Current State

ReelFeel is now positioned as an AI Taste Agent portfolio project, not a Letterboxd clone.

Core product loop:

1. User logs movies into Reel Log / Watchlist.
2. Reviews create taste snapshots.
3. Taste summary stores a structured profile.
4. Recommendation uses TMDB retrieval first, then low-cost LLM reranking/explanation.
5. Demo link logs into a read-only curated account for portfolio review.

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

For deployed demo, set `DEMO_ACCESS_CODE` and `VITE_DEMO_ACCESS_CODE` to a long private value.

## Important Files

Backend:

- `backend/config.py`: central config, env loading, low-cost model names, demo settings.
- `backend/main.py`: FastAPI app wiring, startup DB init, demo seed.
- `backend/auth.py`: JWT auth, `/demo-login`, demo read-only helpers.
- `backend/routers/`: auth-adjacent routes live in `auth.py`; domain routes are split into movies, recommendations, taste, tmdb, usage.
- `backend/services/openai_service.py`: async OpenAI calls, low-cost model routing, usage estimate.
- `backend/services/recommendation_service.py`: hybrid TMDB candidate pool + LLM rerank.
- `backend/services/taste_service.py`: snapshots and structured taste profile.
- `backend/services/demo_service.py`: idempotent curated demo account and media refresh.
- `backend/tests/test_foundation.py`: backend foundation coverage.

Frontend:

- `frontend/src/hooks/useAuth.js`: global auth provider.
- `frontend/src/pages/DemoEntryPage.jsx`: magic demo link entry.
- `frontend/src/components/TasteAgentConsole.jsx`: compact taste strip and recommendation-side reasoning panel.
- `frontend/src/components/SearchPanel.jsx`: Mood / Title search controls.
- `frontend/src/components/RecommendBlock.jsx`: carousel + detail + side agent panel.
- `frontend/src/components/CarouselStrip.jsx`: infinite-feeling 3-card carousel, hides arrows for single result.
- `frontend/src/pages/WatchedListPage.jsx`, `WaitingListPage.jsx`: read-only demo behavior and stable id operations.
- `frontend/src/pages/DashboardPage.jsx`: portfolio proof page for taste profile.

## Recent QA Coverage

Manual Playwright paths tested:

- Demo magic login.
- Home Mood / Title mode switch.
- Title suggestions with `interstell`; suggestions no longer overlap Taste Memory strip.
- Selecting a title suggestion; single-result carousel arrows hidden.
- Mood recommendation for `quiet emotional sci-fi`.
- Carousel next button.
- Demo Add to Watchlist / Reel Log shows read-only toast without hitting backend.
- Reel Log loads, movie modal opens, demo modal is read-only, close button works.
- Watchlist loads, movie modal opens, demo modal is read-only.
- Dashboard loads with Taste Agent Dashboard and Taste Profile.
- Mobile viewport has no horizontal overflow; mobile menu opens.
- Normal temp user registration/login, add to Watchlist, writable modal, delete.
- Broken image scan passed.

Commands passed:

```bash
PYTHONPATH=backend backend/venv_reelfeel/bin/python -m unittest discover backend/tests
cd frontend && npm run lint
cd frontend && npm run build
```

## Known Tradeoffs / Next Work

- No Alembic/Postgres yet; SQLite is still local dev.
- `backend/app.db` is ignored and should not be tracked in git.
- Recommendation still relies on prompt-quality JSON. Add more deterministic tests around invalid LLM output and TMDB edge cases.
- Demo is read-only but bearer-link based; use a strong deployed code and rotate if public.
- UI is much better, but the next front-end polish pass should focus on visual consistency across Login, About, Dashboard, and modal forms.
- Add real production deployment notes and screenshots/GIF walkthrough before sharing with HR.

## Suggested Next Chat Prompt

```text
We are continuing ReelFeel at /Users/xixianhuang/Documents/code/ReelFeel.

Please read NEXT_CHAT_HANDOFF.md and inspect the latest code first. The project is an AI Taste Agent portfolio demo: FastAPI backend, React/Vite frontend, TMDB retrieval + low-cost OpenAI reranking, magic read-only demo account.

First, run git status and the core checks:
- PYTHONPATH=backend backend/venv_reelfeel/bin/python -m unittest discover backend/tests
- cd frontend && npm run lint
- cd frontend && npm run build

Then do a product-quality pass from the perspective of a first-time portfolio reviewer. Focus on frontend UX consistency, unclear copy, broken/awkward interactions, and places where the AI agent reasoning feels vague or fake. Use Playwright to actually click through the demo and normal-user flows before changing code.
```

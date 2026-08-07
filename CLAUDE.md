# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"WhoJoshi Recommendations" (package name `vite_react_shadcn_ts`) — a movie/TV recommendation frontend. Search a title, get similar recommendations, and drill into a details page with cast, trailers, watch providers, and episodes. This repo is the **frontend only**; the recommendation-scraping backend lives in a separate `backend-general` project (not in this repo) and is consumed over HTTP.

## Commands

```bash
npm run dev        # Vite dev server on http://localhost:8080 (see vite.config.ts, not the CRA default 5173 despite README)
npm run build       # production build to dist/
npm run build:dev   # build in development mode (unminified, for debugging build issues)
npm run preview     # serve the production build locally
npm run lint         # ESLint over the whole repo
```

There is no test suite/runner configured in this repo.

### Environment variables

Required in `.env.local` (copy from `.env.example`):
- `VITE_API_BASE_URL` — backend base URL. Defaults to `http://localhost:3001` in dev; empty (relative URLs) in prod if unset.
- `VITE_TMDB_API_KEY` — TMDB API key (https://www.themoviedb.org/settings/api).

## Architecture

### Two parallel data sources, toggled at runtime

The app has an **AI search mode** vs **TMDB search mode** toggle (`aiSearchEnabled` state in [App.tsx](src/App.tsx), persisted to `localStorage` as `whojoshi_ai_search_enabled`, first-run choice via `SearchModeWelcome`). This choice changes which backend answers search-as-you-type and recommendations:

- **AI mode** → calls the custom backend via [lib/api.ts](src/lib/api.ts) (`API_ENDPOINTS.suggestions`, `API_ENDPOINTS.recommendations`). These endpoints proxy/scrape `bestsimilar.com`: `getSimilarFromBestSimilar()` first hits `/api/suggestions?term=` to resolve a BestSimilar URL for the title, then `/api/recommendations?url=` to get the actual similar-titles list. The recommendations response can come back as **JSON or raw HTML** — [pages/Index.tsx](src/pages/Index.tsx) `fetchMovieRecommendations()` detects `content-type` and falls back to scraping `.column-img` elements out of the HTML if it's not JSON.
- **TMDB mode** → calls TMDB directly via [lib/tmdb.ts](src/lib/tmdb.ts) (`getTMDBSuggestions`, `getTrendingContent`, `findTMDBId`, etc.), using `VITE_TMDB_API_KEY` client-side.

Every network call in both [Index.tsx](src/pages/Index.tsx) and [lib/api.ts](src/lib/api.ts) has a **mock-data fallback on failure** (hardcoded Wonder Woman / Fight Club-style sample data + a "Demo Mode" toast) so the UI never fully breaks when the backend or TMDB key is unavailable. Keep this pattern when touching these fetch paths — silent mock fallback, not a hard error state.

### Routing & pages

`react-router-dom` in [App.tsx](src/App.tsx): `/` → [Index.tsx](src/pages/Index.tsx) (search + results grid + trending), `/details/:type/:id` → [Details.tsx](src/pages/Details.tsx) (`:type` is `movie`|`tv`, `:id` is a **TMDB id**, not the backend's own id). Regardless of search mode, clicking a result card in Index always resolves to a TMDB id before navigating to Details (`findTMDBId()` if not already numeric) — Details is TMDB-only and has no notion of AI-mode vs TMDB-mode.

Details page fetches movie/TV metadata, credits, watch providers, videos, and season episodes all directly from TMDB, and gets the "Similar" rail from the AI backend (`getSimilarFromBestSimilar`) unconditionally — this call happens even in TMDB search mode. "Watch Now" links point to third-party streaming mirrors (`cinezo.net`, `hexa.watch`) hardcoded in `getDefaultPlatforms()`/`handleEpisodeWatch()` in [Details.tsx](src/pages/Details.tsx).

### State persistence

Two independent persistence layers, don't confuse them:
- `localStorage` (`whojoshi_*` keys) — cross-session UI preferences: splash cursor enabled, AI search enabled, "have I seen the welcome popup" flags. Read in [App.tsx](src/App.tsx).
- `sessionStorage` (`whojoshi_*` keys defined in `STORAGE_KEYS` inside [Index.tsx](src/pages/Index.tsx)) — search term, selected movies, active tab, scroll position, error flag. Restored when navigating back from Details via `location.state.fromDetails`, so the search results/scroll position survive a details visit.

### UI stack

- shadcn/ui components in `src/components/ui/` (generated via the shadcn CLI — `components.json` configures aliases; treat these as vendored, prefer composing over heavily editing them).
- Decorative/animation components live under `src/blocks/` (`Animations/MetallicPaint`, `TextAnimations/RotatingText`, `TextAnimations/TextPressure`) — these are visual flourishes on the empty-state/hero, not core logic.
- `@/` path alias resolves to `src/` (see [vite.config.ts](vite.config.ts) and `tsconfig`).
- Mobile/Android-specific handling is centralized in [utils/deviceDetection.ts](src/utils/deviceDetection.ts) and wired up once in [App.tsx](src/App.tsx) (`setupAndroidOptimizations`, `setupMobilePerformance`, `setupTouchOptimizations`); splash cursor is disabled on mobile for performance.
- PWA: [main.tsx](src/main.tsx) registers `public/sw.js` as a service worker and prompts the user to reload on update.

### Build quirk

[vite.config.ts](vite.config.ts) forces unique hashed filenames for every asset (`entryFileNames`/`chunkFileNames`/`assetFileNames`) — this project has been bitten by stale-cache deploys before, so don't remove the hashing when touching build config. `lovable-tagger`'s `componentTagger()` plugin only runs in dev mode (this project originated on lovable.dev).

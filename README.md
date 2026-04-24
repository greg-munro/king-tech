# King Tech Challenge

Monorepo - Express + TypeScript backend, React + TypeScript + Vite frontend.

GitHub: https://github.com/greg-munro/king-tech

---

## Docker (recommended)

The fastest way to run the app. Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up --build
```

Then open http://localhost:3000.

Both services start together. The frontend (nginx) proxies `/items` requests to the backend automatically - no configuration needed.

To stop:

```bash
docker compose down
```

---

## Quick start (without Docker)

**Backend** (port 8001):
```bash
cd backend
npm install
npm run dev
```

**Frontend** (port 3000):
```bash
cd frontend
npm install
npm run dev
```

Frontend proxies `/items` to `http://localhost:8001` - no CORS config needed.

---

## Overview

The app fetches a dataset of 500 items from Google Cloud Storage and exposes it through a REST API with server-side filtering, sorting, and pagination. The frontend is a thin React client that renders whatever the backend returns.

---

## Architecture

### Backend

The backend is the core of this solution. All data logic - filtering, sorting, pagination - lives here. The frontend has no knowledge of the dataset shape beyond what it receives in the API response.

The data pipeline runs in a fixed order on every request:

```
GCS fetch → search (name) → filter (status) → sort → paginate
```

Order matters. Filtering before pagination ensures page counts and totals reflect the actual result set, not the full dataset.

Each stage is a pure function in its own service module:

```
src/
  routes/
    items.route.ts        - validates query params, runs the pipeline, returns JSON
  services/
    data.service.ts       - fetches raw data from GCS
    filter.service.ts     - search by name, filter by status
    sort.service.ts       - sort by id / name / createdOn, asc/desc
    pagination.service.ts - slice + compute totals and statusCounts
    query.service.ts      - composes the pipeline
  utils/
    validateQuery.ts      - validates and normalises all query params
```

Pure functions make each stage independently testable and trivially replaceable. If the data source moved from GCS to a database, only `data.service.ts` changes.

### API design

```
GET /items
  ?search=abc        free text, partial case-insensitive match on name
  &status=COMPLETED  exact match (case-insensitive)
  &sortBy=name       id | name | createdOn
  &order=asc         asc | desc
  &page=1
  &limit=20
```

Response shape:

```json
{
  "data": [...],
  "total": 87,
  "page": 1,
  "limit": 20,
  "totalPages": 5,
  "statusCounts": {
    "COMPLETED": 60,
    "CANCELED": 20,
    "ERROR": 7
  }
}
```

`statusCounts` is computed from the filtered result set (after search and status filter, before pagination). This means the KPI cards in the UI always reflect counts within the active filter context - not the full dataset - which is the correct product behaviour.

### Frontend

The frontend state model mirrors the API params directly:

```ts
filters: {
  search, status, sortBy, order, page
}
```

Any change to `filters` triggers a new API call. There is no client-side data manipulation. The frontend renders what the backend returns.

UX details:
- Search is debounced at 300ms to avoid firing a request on every keystroke
- Clearing the search input fires immediately (no debounce delay)
- Subsequent filter/sort/page changes dim the table rather than replacing it with a spinner, so the user retains context while the next page loads
- Status KPI cards double as filter toggles; they are disabled when their count is 0

---

## Trade-offs and decisions

**No database.** The dataset is fetched from GCS on every request. For 500 static records this is acceptable - GCS round-trip latency is the only overhead, and it keeps the solution self-contained with no infrastructure dependencies.

**No caching.** The brief explicitly says caching is not a requirement. A simple in-memory cache with a TTL would be the natural next step (see below), but adding it without it being required would be optimising prematurely for a static test dataset.

**No ORM, no query builder.** Filtering and sorting are plain array operations. For 500 records this is fast enough that introducing a query abstraction would add complexity with no benefit.

**Vite proxy instead of CORS headers.** In development the frontend proxies `/items` to the backend, so no CORS configuration is needed. In production these would be served from the same origin or a reverse proxy would handle routing.

**`statusCounts` in the paginate layer.** The counts are computed before slicing the page, which is the correct place - they need to reflect the full filtered result set, not just the current page.

---

## What I would add with more time

**In-memory cache with TTL.** The GCS dataset is static. Caching it in memory for 60 seconds (or until process restart) would make every request after the first near-instant, since all filtering/sorting/pagination operates on local data. A simple module-level object with a timestamp is all it takes - no Redis, no external dependency.

**Startup prefetch.** The server could fetch and cache the data before accepting connections. This removes any possibility of a slow first request and fails fast on startup if GCS is unreachable, rather than serving an error on the first real user request.

**Database + indexing.** For a larger or dynamic dataset, moving to a database with indexes on `name`, `status`, and `createdOn` would make filtering and sorting O(log n) instead of O(n).

**Input sanitisation.** The `search` and `status` params are passed through as-is after string coercion. For a production API these should be length-limited and stripped of control characters.

**Pagination metadata in response headers.** Some API conventions put pagination metadata (`X-Total-Count`, `X-Total-Pages`) in response headers rather than the body. Either is valid; body was chosen here because it keeps the client code simpler.

---

## Testing

### Backend - Unit tests (Jest)

45 unit tests covering the full data pipeline.

| File | What it tests |
|---|---|
| `data.service.test.ts` | GCS fetch, response parsing, error handling |
| `filter.service.test.ts` | Name search (case-insensitive, partial), status filter, combined |
| `sort.service.test.ts` | Sort by id / name / createdOn, asc/desc, non-mutation |
| `query.service.test.ts` | Pipeline order: search → filter → sort → paginate |
| `validateQuery.test.ts` | Query param validation, invalid values, error accumulation |

```bash
cd backend
npm test
```

---

### Frontend - Unit tests (Vitest)

9 unit tests for the API client (`src/api/client.ts`).

Covers URL construction (all param combinations, falsy param omission) and response handling (success and error).

```bash
cd frontend
npm run test:unit

# Watch mode
npm run test:unit:watch
```

---

### Frontend - E2E tests (Playwright)

10 end-to-end tests covering the main user flows against the running app.

| # | Test |
|---|---|
| 1 | Page loads and displays data |
| 2 | Search filters the table |
| 3 | Clear (X) button restores the full table |
| 4 | KPI card click filters table by status |
| 5 | Clicking active KPI card again deselects the filter |
| 6 | Sort by Name ascending |
| 7 | Sort by Name descending |
| 8 | Next page advances to page 2 |
| 9 | Previous page returns to page 1 |
| 10 | No results state - empty table and correct pagination text |

**Requires both servers to be running before executing.**

```bash
# 1. Start the backend
cd backend && npm run dev

# 2. Start the frontend (separate terminal)
cd frontend && npm run dev

# 3. Run E2E tests (separate terminal)
cd frontend
npm run test:e2e

# UI mode (for debugging/inspecting tests)
npm run test:e2e:ui
```

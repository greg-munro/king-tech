# King Tech Challenge

Monorepo — Express + TypeScript backend, React + TypeScript + Vite frontend.

## Quick start

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

Frontend proxies `/items` to `http://localhost:8001` — no CORS config needed.

---

## Testing

### Backend — Unit tests (Jest)

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

### Frontend — Unit tests (Vitest)

9 unit tests for the API client (`src/api/client.ts`).

Covers URL construction (all param combinations, falsy param omission) and response handling (success and error).

```bash
cd frontend
npm run test:unit

# Watch mode
npm run test:unit:watch
```

---

### Frontend — E2E tests (Playwright, Chromium)

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
| 10 | No results state — empty table and correct pagination text |

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

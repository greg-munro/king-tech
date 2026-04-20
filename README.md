# king-tech

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

## Caching

On startup the backend fetches the dataset from GCS and holds it in memory. Subsequent requests are served directly from the cache with no network overhead.

The cache has a **3-minute TTL**. On the first request after the TTL expires, the backend transparently re-fetches from GCS and refreshes the cache before responding. This means data is never more than 3 minutes stale without requiring a server restart.

**Trade-offs:**
- Cache is in-process memory — it does not persist across restarts
- A re-fetch on TTL expiry adds ~200–500ms latency to that single request
- TTL can be adjusted in `backend/src/services/data.service.ts`

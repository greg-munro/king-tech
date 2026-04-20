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

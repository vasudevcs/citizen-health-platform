# Citizen Health & Social Wellbeing Platform

A full-stack healthcare platform connecting citizens, doctors, ambassadors, researchers, and administrators through digital health records, telemedicine, analytics, disease risk assessment, mental wellbeing tracking, community forums, health education, and platform administration.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod, Recharts, Framer Motion

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT Authentication, Socket.IO, bcrypt

**Architecture:** Modular, role-based REST API. Every module follows the same file set: `models/` → `validations/` → `controllers/` → `routes/` (backend), and `types/` → `services/` → `hooks/` → `pages/` (frontend).

## Local Development

```bash
# Backend
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_ACCESS_SECRET, etc.
npm install
npm run dev             # nodemon, http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev              # vite, http://localhost:5173
```

## Docker

```bash
docker compose up --build
```

Starts MongoDB, the backend API (`:5000`), and the frontend served via nginx (`:8080`, proxies `/api` and `/socket.io` to the backend). Set secrets via a `.env` file at the repo root or export them before running (`JWT_ACCESS_SECRET`, `AI_API_KEY`, SMTP settings).

## Testing

```bash
cd backend
npm test        # jest — validation schemas + risk engine unit tests
```

Test suite currently covers pure logic (zod validation schemas, risk-scoring thresholds). No DB integration tests yet — see "Next Steps" below.

## Role-Based Modules

| Role | Portal | Key Features |
|---|---|---|
| Citizen | `/dashboard`, `/records`, `/analytics`, `/risk-assessment`, `/appointments`, `/mental-wellbeing`, `/community`, `/education`, `/settings` | Health records, telemedicine, disease risk assessment, mood tracking, community forums, health education, account settings |
| Doctor | `/doctor/*` | Appointment lifecycle, patient records, prescriptions, availability, telemedicine |
| Ambassador | `/ambassador/dashboard` | Citizen directory, field-note logging, outreach stats |
| Researcher | `/research/dashboard` | Anonymized risk distribution, demographics, population wellbeing trends |
| Admin | `/admin/dashboard` | Platform stats, user management (activate/deactivate), community moderation queue, CSV reporting |

## API Map (this session's additions)

| Base Path | Access | Purpose |
|---|---|---|
| `/api/wellbeing` | citizen | Mood check-ins, 30-day trend, dashboard summary, curated resource library |
| `/api/community` | any authenticated role | Posts, comments, likes, author-only/admin soft-delete |
| `/api/education` | citizen | Static curated content library, per-citizen completion + bookmark tracking |
| `/api/admin` | admin | Platform stats, user list/search/activation, moderation queue, `reports/users.csv` |
| `/api/ambassador` | ambassador | Citizen directory, field notes, own activity stats |
| `/api/research` | researcher | Anonymized aggregate-only queries — no citizen identifiers ever returned |
| `/api/settings` | any authenticated role | Profile, password change, notification/theme preferences |
| `/api/ai` | any authenticated role | Health-info chat assistant, plain-language risk-assessment explainer. Degrades gracefully (`configured: false`) if `AI_API_KEY` is unset |

Previously completed modules (auth, layout, citizen dashboard, PHR, analytics, risk assessment, telemedicine, doctor portal) are documented in their respective controller/route files.

## Architecture Notes

- **Static vs. DB-backed content:** Wellbeing resources and the Health Education library are static curated arrays in their controllers (no CMS yet). Per-user state (mood entries, completion/bookmarks) is DB-backed. Swap the static arrays for a DB collection once the Admin module needs to manage this content without a deploy.
- **AI layer:** `backend/services/aiService.js` wraps any OpenAI-compatible chat completion endpoint. It is intentionally provider-agnostic and fails soft (friendly fallback message, not a 500) when unconfigured.
- **Privacy:** The Research Portal only ever queries aggregates (`$group`, `countDocuments`, `distinct`) — no endpoint returns a citizen's identity or individual records to a researcher.

## Next Steps / Known Gaps

- Admin/Ambassador/Research/Settings pages are wired into their existing dashboard routes only — no sub-navigation has been added within those portals yet.
- No DB integration tests (would need `mongodb-memory-server` or a test Mongo instance).
- AI layer needs a real `AI_API_KEY` to do anything beyond returning the "not configured" fallback message — no frontend chat UI has been built for it yet, only the backend endpoints.
- CSV export is Admin-only and users-only; no PDF reporting yet.

# TR/ACE Technology Stack

## Frontend Technology

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 14.2.3 |
| Language | TypeScript | 5.x |
| UI Library | React | 18.3.1 |
| Styling | Tailwind CSS | 3.4.1 |
| Charting | Recharts | 2.12.7 |
| Animation | Framer Motion | 12.34.3 |
| QR Code | qrcode | 1.5.4 |
| Data Fetching | @tanstack/react-query | 5.32.0 |
| HTTP Client | axios | 1.6.8 |
| Validation | Zod | 3.23.8 |
| Icons | lucide-react | 0.378.0 |

### Fonts
- **Display**: Cormorant (serif, headings)
- **Sans**: Instrument Sans (body text)
- **Mono**: DM Mono (labels, numbers)

## Backend Technology

| Category | Technology | Version |
|----------|------------|---------|
| Framework | FastAPI | 0.110.0 |
| Runtime | Python | 3.12 |
| ASGI Server | Uvicorn | 0.27.1 |
| ORM | SQLModel | 0.0.16 |
| Validation | Pydantic | 2.6.3 |
| Auth (JWT) | python-jose | 3.3.0 |
| Auth (Password) | passlib + bcrypt | 1.7.4 / 3.2.2 |
| PDF Generation | WeasyPrint | 68.1 |
| HTTP Client | requests | 2.31.0 |
| AI/LLM | OpenAI SDK | >=1.0.0 |

## Database

| Environment | Database | Connection |
|-------------|----------|------------|
| Development | SQLite | `sqlite:///./demo.db` |
| Production | PostgreSQL | via `DATABASE_URL` env var |

**ORM**: SQLModel (SQLAlchemy-based, automatic table creation)

## Development & Build

| Tool | Purpose |
|------|---------|
| pnpm | Package manager (monorepo) |
| concurrently | Parallel frontend/backend execution |
| ESLint | Linting (next/eslint-config) |
| Next.js native | Build process |

## Environment Configuration

### Frontend Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:8001`)
- `NEXT_PUBLIC_BASE_URL` - Frontend URL (default: `http://localhost:3030`)

### Backend Variables
- `DATABASE_URL` - Database connection string
- `CLIMATIQ_API_KEY` - Emission factors API
- `OPENAI_API_KEY` - AI BOM parsing
- `JWT_SECRET` - Authentication secret
- `CORS_ORIGINS` - Allowed frontend origins

### Port Configuration
- Frontend: `3030`
- Backend: `8001`
- Demo flow: `8002`

## Key Files

| Path | Purpose |
|------|---------|
| `app/package.json` | Frontend dependencies |
| `backend/requirements.txt` | Backend dependencies |
| `app/tailwind.config.js` | Design system tokens |
| `app/tsconfig.json` | TypeScript config |
| `packages/shared/factors.json` | Fallback emission factors |

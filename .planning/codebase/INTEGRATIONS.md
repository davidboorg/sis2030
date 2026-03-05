# TR/ACE External Integrations

## External API Integrations

### 1. Climatiq (Emissions Data)

| Property | Value |
|----------|-------|
| Base URL | `https://api.climatiq.io` |
| Auth | Bearer token via `CLIMATIQ_API_KEY` |
| Implementation | `backend/climatiq_service.py` |
| Fallback | Local `packages/shared/factors.json` |
| Status | Optional (graceful degradation) |

**Endpoints Used:**
- `GET /data/v1/search` - Search emission factors
- `POST /custom-activities/v1` - Calculate emissions

**Purpose:** Material emission factors, EEIO-based spend calculations

### 2. OpenAI API (AI/LLM)

| Property | Value |
|----------|-------|
| Auth | `OPENAI_API_KEY` environment variable |
| Models | `gpt-4o-mini` (default), `gpt-4-turbo-preview` (fallback) |
| Temperature | 0.3 (deterministic) |
| Max Tokens | 2000 (configurable via `AI_MAX_TOKENS`) |
| Response Format | JSON mode |
| Implementation | `backend/ai_service.py` |
| Fallback | Mock parsers with hardcoded responses |

**Functions:**
- BOM parsing from natural language (Swedish)
- Material matching with confidence scores
- Improvement suggestions (ISO 14040-based)
- Transport route generation
- Chat assistant for user support

### 3. Google Fonts API

| Property | Value |
|----------|-------|
| Fonts | Cormorant, Instrument Sans, DM Mono |
| Method | Preconnect + stylesheet CDN loads |
| Auth | Not required |

## Internal API Endpoints

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | User authentication with JWT |
| GET | `/me` | Current user profile + org info |

### Products & BOM
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/products` | Create new product |
| GET | `/products` | List org products |
| GET | `/products/{id}` | Get product BOM |
| POST | `/products/{id}/components` | Add components |
| POST | `/components/{id}/materials` | Add material (triggers Climatiq) |
| POST | `/components/{id}/processes` | Add manufacturing processes |
| POST | `/components/{id}/transports` | Add transport routes |

### Calculations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/runs` | Execute LCA calculation |
| GET | `/runs/{id}` | Get results (8 indicators + hotspots) |
| GET | `/runs/{id}/scopes` | Scope 1/2/3 breakdown |

### Demo & Templates
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/demo/{template_id}` | Demo calculation |
| POST | `/demo/wizard` | Wizard-based demo flow |
| POST | `/demo/spend` | Spend-based calculation (EEIO) |
| GET | `/templates` | List industry templates |
| GET | `/templates/{id}` | Get template with components |
| GET | `/benchmark/{template_id}` | Industry benchmarks |

### Export & Sharing
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/certificate/{id}/pdf` | PDF certificate export |
| GET | `/badge/{run_id}` | SVG sustainability badge |
| POST | `/runs/{id}/export` | Export to CSV/JSON |

### AI Services
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/ai/parse-bom` | AI BOM parsing |
| POST | `/ai/match-material` | Material reference lookup |
| POST | `/ai/suggest/improvement` | ISO-based suggestions |
| POST | `/ai/validate` | Component validation |
| POST | `/ai/transport-route` | Transport suggestions |
| POST | `/ai/chat` | Chat assistant |

## Authentication

| Property | Value |
|----------|-------|
| Method | JWT (python-jose) |
| Algorithm | HS256 |
| Secret | `JWT_SECRET` env var |
| Token Lifetime | 24 hours |
| Header | `Authorization: Bearer {token}` |

## Data Sources

### Local Factors Database
- **File**: `packages/shared/factors.json`
- **Structure**: Materials, Processes, Transport with 6 base indicators
- **Usage**: Fallback when Climatiq API unavailable

### Industry Templates
- **Defined in**: `backend/main.py` (INDUSTRY_TEMPLATES)
- **Templates**: furniture, food, workshop, construction, textile
- **Structure**: Pre-filled components, materials, processes

### Industry Benchmarks
- **Defined in**: `backend/main.py` (INDUSTRY_BENCHMARKS)
- **Metrics**: avg_co2e, best_co2e per industry
- **Usage**: Comparative visualization in results

## Export Formats

| Format | Endpoint | Purpose |
|--------|----------|---------|
| PDF | `/certificate/{id}/pdf` | Certificate with QR, indicators |
| SVG | `/badge/{run_id}` | Social sharing badge |
| JSON | `/runs/{id}/export` | Full calculation data |
| CSV | `/runs/{id}/export` | BOM + results (planned) |

## Third-party SDKs

| SDK | Purpose |
|-----|---------|
| OpenAI Python SDK | AI/LLM integration |
| WeasyPrint | HTML to PDF conversion |
| Recharts | React charting |
| Framer Motion | React animations |

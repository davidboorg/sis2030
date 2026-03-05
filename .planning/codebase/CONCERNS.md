# TR/ACE Codebase Concerns

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 7 |
| HIGH | 4 |
| MEDIUM | 26 |
| LOW | 6 |

---

## CRITICAL Security Issues

### 1. Hardcoded Secret Key
- **File**: `backend/main.py:39`
- **Issue**: `SECRET_KEY = os.getenv("JWT_SECRET", "demo-secret-change-in-production")`
- **Risk**: Default fallback uses weak demo secret for JWT signing
- **Fix**: Remove fallback, require env var explicitly

### 2. Hardcoded Demo Credentials
- **Files**: `backend/seed.py:24`, `backend/demo_flow.py:21`
- **Issue**: Password `"Demo123!"` appears as hardcoded strings
- **Risk**: Credentials exposed in git history
- **Fix**: Use environment variables for all credentials

### 3. SQLite for Production
- **File**: `backend/database.py:9`
- **Issue**: Default `sqlite:///./demo.db` is not production-ready
- **Risk**: No concurrent writes, data loss risk
- **Fix**: Require PostgreSQL in production, add Alembic migrations

### 4. Missing HTTPS Configuration
- **File**: `backend/main.py:48`
- **Issue**: CORS allows http:// origins
- **Risk**: Tokens transmitted unencrypted
- **Fix**: Require HTTPS in production

### 5. No Rate Limiting on Auth
- **File**: `backend/main.py:113-123`
- **Issue**: Login endpoint has no rate limiting
- **Risk**: Brute force attacks possible
- **Fix**: Implement rate limiting, account lockout

### 6. CORS Too Permissive
- **File**: `backend/main.py:48-55`
- **Issue**: `allow_methods=["*"]` and `allow_headers=["*"]`
- **Risk**: Increased attack surface
- **Fix**: Whitelist specific methods and headers

### 7. Weak JWT Token Expiry
- **File**: `backend/main.py:41`
- **Issue**: `ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24` (24 hours)
- **Risk**: Extended window for token theft
- **Fix**: Reduce to 1-4 hours, implement refresh tokens

---

## HIGH Priority Issues

### 8. Missing Input Validation
- **File**: `backend/main.py` - multiple endpoints
- **Issue**: No validation on numeric inputs (mass_kg, energy_kwh)
- **Risk**: Negative values, NaN could cause errors
- **Fix**: Add `Field(gt=0)` validators

### 9. Recycled Content Percentage Unbounded
- **File**: `backend/models.py:56`
- **Issue**: `recycled_content_pct` allows any float
- **Risk**: Values > 100% produce incorrect calculations
- **Fix**: Add `Field(ge=0, le=100)` validation

### 10. No Multi-Tenancy Isolation
- **Issue**: `org_id` exists but no isolation logic
- **Risk**: Users could access other orgs' data
- **Fix**: Add Row Level Security or app-level filtering

### 11. No Testing Coverage
- **Issue**: No test files in repo
- **Risk**: Refactoring breaks functionality silently
- **Fix**: Add unit, integration, and E2E tests

---

## MEDIUM Priority Issues

### Data Integrity

**12. Missing Null Checks in Calculator**
- `backend/calculator.py:94-120` - `_factor()` returns empty dict if key not found

**13. Circular JSON Serialization**
- Storing `json.dumps()` in JSON columns, then `json.loads()` again

**14. Unhandled Climatiq API Failures**
- `backend/climatiq_service.py:117-123` - Exceptions caught silently

### Error Handling

**15. Generic Exception Handling**
- `except Exception as e:` loses original traceback

**16. No Error Recovery in PDF Generation**
- If WeasyPrint fails, returns 500 with system info leaked

**17. Missing Null Safety in SVG Badge**
- String interpolation without HTML escaping

### Performance

**18. N+1 Query Pattern**
- `backend/main.py:177-246` - For each component, queries materials/processes separately
- **Fix**: Use SQLAlchemy eager loading

**19. No Pagination on List Endpoints**
- `/products` returns all without limit
- **Fix**: Add `limit` and `offset` parameters

**20. Database Connection Pool Not Configured**
- Default pool settings under high load cause issues
- **Fix**: Add `pool_size=20, max_overflow=40`

**21. Missing Database Indexes**
- No indexes on `product_id`, `component_id` foreign keys
- **Fix**: Add `index=True` to FK fields

### Logic Issues

**22. Incorrect Scope 1/2/3 Breakdown**
- `backend/main.py:1354-1357` - Hardcoded percentages
- **Fix**: Track scopes properly during calculation

**23. Missing Biodiversity Index Documentation**
- Placeholder formula with arbitrary constant 120
- **Fix**: Document rationale, add references

**24. Hotspots Limited to 3**
- `backend/calculator.py:159` - Silently discards rest
- **Fix**: Return all, let frontend decide

**25. WeasyPrint Fallback Not Complete**
- `HTML = None` if import fails, but code still uses it
- **Fix**: Return HTML alternative or fail at startup

### Frontend

**26. Hardcoded API URLs**
- 7 occurrences of `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'`
- **Fix**: Create shared `lib/api.ts`

**27. No Error Boundaries**
- Unhandled promise rejections crash UI
- **Fix**: Add Error Boundary components

**28. Missing Type Validation on API Responses**
- Assumes response shape matches types
- **Fix**: Use Zod validators

**29. Regex Parsing in Certificate**
- Fragile regex to extract product name from SVG
- **Fix**: Add `/badge/{id}/metadata` JSON endpoint

### Configuration

**30. No Environment Variable Documentation**
- No `.env.example` file
- **Fix**: Create example with all required vars

**31. No Graceful Shutdown**
- No signal handlers for SIGTERM
- **Fix**: Add shutdown events

### Missing Features

**32. Spend-Based Calculation Incomplete**
- Endpoint exists but uses mock components
- **Fix**: Complete `spend_calculator.py`

**33. PDF Export Route Broken**
- Returns `/exports/{filename}` but no static serving
- **Fix**: Mount directory or use FileResponse

**34. No Audit Trail**
- Cannot trace who modified what
- **Fix**: Add audit columns to all tables

**35. AI Service Fallback Not Transparent**
- Falls back to mock parser silently
- **Fix**: Indicate data source in response

---

## LOW Priority Issues

**36. Componentization of Calculator**
- Monolithic, difficult to add indicators

**37. Brittle Material Reference System**
- String IDs, renaming breaks history

**38. No Caching Strategy**
- Every calculation re-queries factors

**39. No API Documentation**
- No OpenAPI spec

**40. Assumption Tracking**
- Hardcoded assumptions, no versioning

**41. ISO Compliance Unverified**
- Claims compliance but no audit

**42. URL Parameter Validation**
- Uses `params.id` without type checking

**43. CORS Origins Configurable**
- Should be locked down per environment

---

## Recommendations

**Before Production:**
1. Fix all CRITICAL issues (secrets, auth, HTTPS)
2. Add PostgreSQL migration
3. Implement rate limiting
4. Add basic test coverage

**First Sprint:**
- Address HIGH issues (validation, isolation)
- Add Error Boundaries
- Implement caching

**Ongoing:**
- MEDIUM issues in phased approach
- LOW issues post-launch

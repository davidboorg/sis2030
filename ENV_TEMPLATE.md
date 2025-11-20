# Environment Variables Template

Kopiera denna fil och skapa `.env.local` i respektive mapp.

## Backend (.env.local)

```bash
# Climatiq API (för CO₂-beräkningar)
CLIMATIQ_API_KEY=din_climatiq_api_nyckel_här

# OpenAI API (för BOM-tolkning)
OPENAI_API_KEY=din_openai_api_nyckel_här
OPENAI_MODEL=gpt-4o-mini

# Databas (valfritt)
# DATABASE_URL=sqlite:///./demo.db

# JWT Secret (valfritt, för produktion)
# JWT_SECRET=din_hemliga_nyckel_här

# CORS Origins (valfritt)
# CORS_ORIGINS=http://localhost:3030,http://localhost:3031
```

## Frontend (.env.local)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8002
```

## Hur Får Jag API-Nycklar?

### Climatiq
1. Gå till https://www.climatiq.io/
2. Skapa konto
3. Hämta API-nyckel från dashboard

### OpenAI
1. Gå till https://platform.openai.com/
2. Skapa konto
3. Gå till API Keys
4. Skapa ny nyckel

## ⚠️ Säkerhet

**VIKTIGT:**
- Lägg ALDRIG `.env.local` i Git
- Dela ALDRIG API-nycklar publikt
- Använd olika nycklar för dev/prod
- Rotera nycklar regelbundet

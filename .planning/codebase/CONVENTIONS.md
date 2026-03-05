# TR/ACE Code Conventions

## Language & Style

| Aspect | Convention |
|--------|------------|
| UI Text | Swedish |
| Variables | English |
| API Contracts | English |
| Comments | Swedish (code), English (docs) |
| Abstraction | Minimal - prefer 10 clear lines over 100 "clean" lines |

## Frontend (Next.js 14 + React)

### Component Structure
```typescript
'use client'  // Client components only

import { useState } from 'react'
import { WizardData, Material } from './types'

type Props = {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

export default function StepMaterials({ data, onChange }: Props) {
  const [inputMode, setInputMode] = useState<'weight' | 'spend'>('weight')

  // ...component logic

  return (
    <div className="max-w-xl">
      {/* Eyebrow */}
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-sis-pomegranate">
        Steg 3 — Material
      </span>
      {/* ...rest */}
    </div>
  )
}
```

### Key Patterns

**Props Destructuring**
```typescript
export default function Component({ data, onChange, isLoading }: Props) {
```

**State Management**
- React hooks for local state
- TanStack React Query for server state
- No global state management (Redux, Zustand)
- Props drilling via `onChange` callbacks

**Event Handlers**
```typescript
const handleMaterialUpdate = (id: string, quantity: number) => {
  const updated = data.materials.map((m) =>
    m.id === id ? { ...m, quantity, isDefault: false } : m
  )
  onChange({ materials: updated })
}
```

### Tailwind & Design System

**Always use custom tokens:**
```typescript
// Good
className="bg-trace-surface text-trace-text border-trace-border"

// Avoid
className="bg-slate-800 text-white border-gray-700"
```

**Eyebrow Pattern (repeated everywhere):**
```html
<span className="font-mono text-[10px] tracking-[0.2em] uppercase text-sis-pomegranate">
  Label Text
</span>
```

**Accent Line (top of cards):**
```html
<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sis-pomegranate to-transparent" />
```

**Gap Grid (1px borders):**
```html
<div className="grid grid-cols-3 gap-px bg-trace-border">
  <div className="bg-trace-bg p-4">...</div>
  <div className="bg-trace-bg p-4">...</div>
</div>
```

**Animations (Framer Motion):**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

### Error Handling

```typescript
try {
  const response = await fetch(`${API_URL}/demo/wizard`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error('Calculation failed')
  const data = await response.json()
  setResult(data)
} catch (error) {
  setCalculationError('Något gick fel vid beräkningen')
  console.error(error)
}
```

## Backend (FastAPI + SQLModel)

### Request/Response Models
```python
from pydantic import BaseModel
from typing import Optional, List

class MaterialCreate(BaseModel):
    dataset_ref: str
    mass_kg: float
    recycled_content_pct: Optional[float] = 0
```

### Database Models
```python
from sqlmodel import SQLModel, Field
from typing import Optional

class MaterialItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="component.id")
    dataset_ref: str
    mass_kg: float
    recycled_content_pct: float = 0
    overrides_json: str = "{}"
```

### Endpoint Structure
```python
@app.post("/components/{component_id}/materials")
def add_material(
    component_id: int,
    material: MaterialCreate,
    db: Session = Depends(get_session)
):
    db_material = MaterialItem(
        component_id=component_id,
        dataset_ref=material.dataset_ref,
        mass_kg=material.mass_kg,
        recycled_content_pct=material.recycled_content_pct,
    )
    db.add(db_material)
    db.commit()
    return {"material_id": db_material.id}
```

### Error Handling
```python
from fastapi import HTTPException

if not product:
    raise HTTPException(status_code=404, detail="Product not found")

try:
    result = calculate_indicators(db, product_id)
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

### Database Session Pattern
```python
from database import get_session
from sqlmodel import Session

def get_product(product_id: int, db: Session = Depends(get_session)):
    return db.get(Product, product_id)
```

### JSON Column Pattern
```python
import json

# Storing
db_result = RunResult(
    indicators_json=json.dumps(results["indicators"]),
    hotspots_json=json.dumps(results["hotspots"]),
)

# Retrieving
indicators = json.loads(run_result.indicators_json)
```

## Design System Summary

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `trace-bg` | #0F172A | Main background |
| `trace-surface` | #1E293B | Cards, panels |
| `trace-surface-2` | #334155 | Hover, active |
| `trace-text` | #F8FAFC | Primary text |
| `trace-text-secondary` | #94A3B8 | Secondary text |
| `trace-text-muted` | #64748B | Labels, hints |
| `sis-pomegranate` | #F32735 | Accent, CTAs |

### Typography
| Token | Font | Usage |
|-------|------|-------|
| `font-display` | Cormorant | Headings |
| `font-sans` | Instrument Sans | Body |
| `font-mono` | DM Mono | Labels, numbers |

## Security Conventions

**Password Hashing:**
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash
password_hash = pwd_context.hash(password[:72])  # bcrypt max 72 bytes

# Verify
if not pwd_context.verify(request.password, user.password_hash):
    raise HTTPException(status_code=401)
```

**JWT Tokens:**
```python
from jose import jwt

token = jwt.encode(
    {"sub": str(user.id), "exp": datetime.utcnow() + timedelta(minutes=60*24)},
    SECRET_KEY,
    algorithm="HS256"
)
```

**Environment Variables:**
```python
import os
SECRET_KEY = os.getenv("JWT_SECRET")  # Required in production
API_KEY = os.getenv("CLIMATIQ_API_KEY", None)  # Optional with fallback
```

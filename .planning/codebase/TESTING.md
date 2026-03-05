# TR/ACE Testing

## Current State

**No tests exist in the codebase.**

- No test files (`*.test.ts`, `*.spec.ts`, `*.test.py`)
- No test frameworks configured
- No test scripts in package.json or requirements.txt
- No CI/CD test pipeline

## Testing Gaps

| Area | Gap |
|------|-----|
| Calculator | No unit tests for LCA calculation logic |
| API | No integration tests for endpoints |
| Components | No component tests for React |
| E2E | No end-to-end tests for wizard flow |
| Mocks | No fixture setup for external APIs |

## Recommended Testing Strategy

### Frontend (Vitest + Testing Library)

**Setup:**
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Component Test Example:**
```typescript
// StepMaterials.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import StepMaterials from './StepMaterials'

describe('StepMaterials', () => {
  const mockData = {
    materials: [
      { id: '1', name: 'Stål', quantity: 5, unit: 'kg', isDefault: true }
    ]
  }

  it('renders materials list', () => {
    render(<StepMaterials data={mockData} onChange={vi.fn()} />)
    expect(screen.getByText('Stål')).toBeInTheDocument()
  })

  it('updates quantity on input change', () => {
    const onChange = vi.fn()
    render(<StepMaterials data={mockData} onChange={onChange} />)

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } })

    expect(onChange).toHaveBeenCalledWith({
      materials: expect.arrayContaining([
        expect.objectContaining({ quantity: 10 })
      ])
    })
  })
})
```

**Wizard Flow Test:**
```typescript
// wizard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import WizardDemoPage from './page'

describe('Wizard Flow', () => {
  it('progresses through all steps', async () => {
    render(<WizardDemoPage />)

    // Step 0: Company
    fireEvent.change(screen.getByLabelText('Företagsnamn'), {
      target: { value: 'Test AB' }
    })
    fireEvent.click(screen.getByText('Nästa'))

    // Step 1: Product
    expect(screen.getByText('Välj produkttyp')).toBeInTheDocument()
    // ...continue through steps
  })
})
```

### Backend (pytest + httpx)

**Setup:**
```bash
pip install pytest pytest-asyncio httpx
```

**Calculator Unit Tests:**
```python
# test_calculator.py
import pytest
from calculator import calculate_indicators, _factor

def test_factor_returns_indicators():
    result = _factor("steel")
    assert "co2e_kg" in result
    assert result["co2e_kg"] > 0

def test_factor_unknown_material_returns_empty():
    result = _factor("nonexistent_material")
    assert result == {}

def test_calculate_indicators_with_materials(db_session):
    # Setup: create product with components
    product = create_test_product(db_session)

    result = calculate_indicators(db_session, product.id, "v1", "v1")

    assert "indicators" in result
    assert result["indicators"]["co2e_kg"] > 0
    assert "hotspots" in result
    assert len(result["hotspots"]) <= 3
```

**API Integration Tests:**
```python
# test_api.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_demo_wizard_endpoint():
    response = client.post("/demo/wizard", json={
        "templateId": "furniture",
        "companyName": "Test AB",
        "productName": "Test Chair",
        "materials": [
            {"name": "steel", "quantity": 5, "unit": "kg"}
        ],
        "electricityKwh": 10,
        "heatKwh": 5,
        "supplierDistance": 100,
        "customerDistance": 50,
        "transportMode": "truck"
    })

    assert response.status_code == 200
    data = response.json()
    assert "indicators" in data
    assert data["indicators"]["co2e_kg"] > 0

def test_templates_endpoint():
    response = client.get("/templates")
    assert response.status_code == 200
    templates = response.json()
    assert len(templates) == 5
    assert "furniture" in [t["id"] for t in templates]

def test_login_with_valid_credentials():
    response = client.post("/auth/login", json={
        "email": "demo@skandiform.example",
        "password": "Demo123!"
    })
    assert response.status_code == 200
    assert "token" in response.json()

def test_login_with_invalid_credentials():
    response = client.post("/auth/login", json={
        "email": "demo@skandiform.example",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
```

**Mock External APIs:**
```python
# conftest.py
import pytest
from unittest.mock import patch

@pytest.fixture
def mock_climatiq():
    with patch('climatiq_service.calculate_pcf') as mock:
        mock.return_value = {
            "co2e": 2.1,
            "co2e_unit": "kg",
            "source": "Climatiq"
        }
        yield mock

def test_calculation_uses_climatiq(mock_climatiq, db_session):
    product = create_test_product(db_session)
    result = calculate_indicators(db_session, product.id, "v1", "v1")

    mock_climatiq.assert_called()
    # Verify Climatiq values used
```

### E2E Tests (Playwright)

**Setup:**
```bash
pnpm add -D @playwright/test
npx playwright install
```

**Wizard E2E Test:**
```typescript
// e2e/wizard.spec.ts
import { test, expect } from '@playwright/test'

test('complete wizard flow generates certificate', async ({ page }) => {
  await page.goto('/demo/wizard')

  // Step 0: Company
  await page.fill('[name="companyName"]', 'Test AB')
  await page.selectOption('[name="industry"]', 'furniture')
  await page.click('text=Nästa')

  // Step 1: Product
  await expect(page.locator('text=Välj produkttyp')).toBeVisible()
  await page.click('[data-template="furniture"]')
  await page.click('text=Nästa')

  // Step 2: Materials
  await expect(page.locator('text=Material')).toBeVisible()
  await page.click('text=Nästa')

  // Step 3: Energy
  await page.click('text=Nästa')

  // Step 4: Transport
  await page.click('text=Nästa')

  // Step 5: Results
  await expect(page.locator('text=kg CO₂e')).toBeVisible()

  // Navigate to certificate
  await page.click('text=Hållbarhetsbevis')
  await expect(page.url()).toContain('/certificate/')
})
```

## Priority Test Coverage

| Priority | Area | Why |
|----------|------|-----|
| P0 | Calculator unit tests | Core business logic |
| P0 | API endpoint tests | Catch regressions |
| P1 | Wizard component tests | Primary UX flow |
| P1 | Auth tests | Security critical |
| P2 | E2E wizard flow | User journey |
| P2 | PDF generation | Export functionality |

## Test Commands (Recommended)

**Add to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

**Add to backend:**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest test_calculator.py -v
```

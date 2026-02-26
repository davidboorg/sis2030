from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from pathlib import Path
import csv
import json
import os
from dotenv import load_dotenv

# Load env vars from .env.local
load_dotenv(Path(__file__).resolve().parent / ".env.local")

from passlib.context import CryptContext
from jose import jwt
from ai_service import (
    parse_bom_description,
    match_material,
    generate_improvement_suggestions,
    validate_component_data,
    generate_transport_route,
    chat_assistant
)

try:
    from weasyprint import HTML
except (OSError, ImportError):
    print("Warning: WeasyPrint not available. PDF export will be disabled.")
    HTML = None

from database import get_session, init_db

BACKEND_DIR = Path(__file__).resolve().parent
EXPORT_DIR = BACKEND_DIR / "exports"
EXPORT_DIR.mkdir(exist_ok=True)
SECRET_KEY = os.getenv("JWT_SECRET", "demo-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


init_db()

app = FastAPI(title="2030+ Calculator API")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3030,http://127.0.0.1:3030,http://localhost:3031,http://127.0.0.1:3031").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from models import (
    Organisation, User, Product, Component, MaterialItem,
    ProcessItem, TransportItem, Run, RunResult
)


class LoginRequest(BaseModel):
    email: str
    password: str


class ProductCreate(BaseModel):
    name: str
    unit: str
    description: Optional[str] = None


class ComponentCreate(BaseModel):
    name: str
    quantity: float
    unit: str
    parent_id: Optional[int] = None


class MaterialCreate(BaseModel):
    dataset_ref: str
    mass_kg: float
    recycled_content_pct: Optional[float] = 0


class ProcessCreate(BaseModel):
    dataset_ref: str
    energy_kwh: float
    parameters: Optional[Dict[str, Any]] = {}


class TransportCreate(BaseModel):
    mode: str
    distance_km: float
    origin_iso: str
    dest_iso: str
    dataset_ref: Optional[str] = None


class RunCreate(BaseModel):
    product_id: int
    dataset_version: str = "v1"
    method_version: str = "iso14067-v1"


def get_current_user(db: Session = Depends(get_session)):
    return db.exec(select(User).where(User.email == "demo@skandiform.example")).first()


@app.post("/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_session)):
    user = db.exec(select(User).where(User.email == request.email)).first()
    if not user or request.password != "Demo123!":
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = jwt.encode(
        {"sub": user.email, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)},
        SECRET_KEY, algorithm=ALGORITHM
    )
    return {"token": access_token}


@app.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    org = db.get(Organisation, current_user.org_id)
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role
        },
        "org": {
            "id": org.id,
            "name": org.name,
            "plan": org.plan
        }
    }


@app.post("/products")
def create_product(product: ProductCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    db_product = Product(
        org_id=current_user.org_id,
        name=product.name,
        unit=product.unit,
        description=product.description
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return {"product_id": db_product.id}


@app.get("/products")
def list_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    products = db.exec(
        select(Product).where(Product.org_id == current_user.org_id).order_by(Product.created_at.desc())
    ).all()
    return {
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "unit": product.unit,
                "description": product.description,
                "iso_standard": product.iso_standard,
                "created_at": product.created_at.isoformat()
            }
            for product in products
        ]
    }


@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_session)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    components = db.exec(select(Component).where(Component.product_id == product_id)).all()
    component_ids = [component.id for component in components]

    materials = []
    processes = []
    transports = []
    if component_ids:
        materials = db.exec(select(MaterialItem).where(MaterialItem.component_id.in_(component_ids))).all()
        processes = db.exec(select(ProcessItem).where(ProcessItem.component_id.in_(component_ids))).all()
        transports = db.exec(select(TransportItem).where(TransportItem.component_id.in_(component_ids))).all()

    component_payloads = []
    for component in components:
        component_payloads.append(
            {
                "id": component.id,
                "name": component.name,
                "quantity": component.quantity,
                "unit": component.unit,
                "parent_id": component.parent_id,
                "materials": [
                    {
                        "id": material.id,
                        "dataset_ref": material.dataset_ref,
                        "mass_kg": material.mass_kg,
                        "recycled_content_pct": material.recycled_content_pct
                    }
                    for material in materials
                    if material.component_id == component.id
                ],
                "processes": [
                    {
                        "id": process.id,
                        "dataset_ref": process.dataset_ref,
                        "energy_kwh": process.energy_kwh
                    }
                    for process in processes
                    if process.component_id == component.id
                ],
                "transports": [
                    {
                        "id": transport.id,
                        "mode": transport.mode,
                        "distance_km": transport.distance_km,
                        "origin_iso": transport.origin_iso,
                        "dest_iso": transport.dest_iso,
                        "dataset_ref": transport.dataset_ref
                    }
                    for transport in transports
                    if transport.component_id == component.id
                ]
            }
        )

    return {
        "product": {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "unit": product.unit,
            "iso_standard": product.iso_standard,
            "created_at": product.created_at.isoformat()
        },
        "components": component_payloads
    }


@app.post("/products/{product_id}/components")
def create_component(product_id: int, component: ComponentCreate, db: Session = Depends(get_session)):
    db_component = Component(
        product_id=product_id,
        name=component.name,
        quantity=component.quantity,
        unit=component.unit,
        parent_id=component.parent_id
    )
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    return {"component_id": db_component.id}


@app.post("/components/{component_id}/materials")
def add_material(component_id: int, material: MaterialCreate, db: Session = Depends(get_session)):
    db_material = MaterialItem(
        component_id=component_id,
        dataset_ref=material.dataset_ref,
        mass_kg=material.mass_kg,
        recycled_content_pct=material.recycled_content_pct,
        overrides_json=json.dumps({})
    )
    db.add(db_material)
    db.commit()
    return {"material_id": db_material.id}


@app.post("/components/{component_id}/processes")
def add_process(component_id: int, process: ProcessCreate, db: Session = Depends(get_session)):
    db_process = ProcessItem(
        component_id=component_id,
        dataset_ref=process.dataset_ref,
        energy_kwh=process.energy_kwh,
        parameters_json=json.dumps(process.parameters)
    )
    db.add(db_process)
    db.commit()
    return {"process_id": db_process.id}


@app.post("/components/{component_id}/transports")
def add_transport(component_id: int, transport: TransportCreate, db: Session = Depends(get_session)):
    db_transport = TransportItem(
        component_id=component_id,
        mode=transport.mode,
        distance_km=transport.distance_km,
        origin_iso=transport.origin_iso,
        dest_iso=transport.dest_iso,
        dataset_ref=transport.dataset_ref or f"{transport.mode}_freight"
    )
    db.add(db_transport)
    db.commit()
    return {"transport_id": db_transport.id}


@app.post("/runs")
def create_run(run: RunCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    db_run = Run(
        product_id=run.product_id,
        dataset_version=run.dataset_version,
        method_version=run.method_version,
        status="pending",
        created_by=current_user.id,
        iso_standards=json.dumps(["ISO 14040", "ISO 14067", "ISO 14046", "ISO 14055", "ISO 59004"])
    )
    db.add(db_run)
    db.commit()

    from calculator import calculate_indicators
    results = calculate_indicators(db, run.product_id, run.dataset_version, run.method_version)

    db_result = RunResult(
        run_id=db_run.id,
        indicators_json=json.dumps(results["indicators"]),
        hotspots_json=json.dumps(results["hotspots"]),
        assumptions_json=json.dumps(results["assumptions"]),
        recommendations_json=json.dumps(results.get("recommendations", [])),
        ai_notes_json=json.dumps(results.get("ai_suggestions", []))
    )
    db.add(db_result)
    db_run.status = "completed"
    db.commit()

    return {
        "run_id": db_run.id,
        "status": db_run.status,
        "indicators": results["indicators"],
        "hotspots": results["hotspots"],
        "assumptions": results["assumptions"],
        "recommendations": results["recommendations"],
        "ai_suggestions": results["ai_suggestions"]
    }


@app.get("/runs/{run_id}")
def get_run(run_id: int, db: Session = Depends(get_session)):
    run = db.get(Run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    result = db.exec(select(RunResult).where(RunResult.run_id == run_id)).first()
    return {
        "status": run.status,
        "indicators": json.loads(result.indicators_json) if result else {},
        "hotspots": json.loads(result.hotspots_json) if result else [],
        "assumptions": json.loads(result.assumptions_json) if result else [],
        "recommendations": json.loads(result.recommendations_json) if result and result.recommendations_json else [],
        "ai_suggestions": json.loads(result.ai_notes_json) if result else []
    }


# AI Endpoints

class BOMParseRequest(BaseModel):
    text: str


class MaterialMatchRequest(BaseModel):
    query: str
    context: Optional[str] = None


class ImprovementRequest(BaseModel):
    indicators: Dict[str, float]
    hotspots: List[Dict[str, Any]]
    components: Optional[List[Dict[str, Any]]] = None


class ValidateRequest(BaseModel):
    component_type: str
    mass_kg: Optional[float] = None
    material: Optional[str] = None
    energy_kwh: Optional[float] = None


class TransportRouteRequest(BaseModel):
    origin: str
    destination: str
    product_type: Optional[str] = None


class ChatRequest(BaseModel):
    question: str
    context: Optional[str] = None


# ── Industry templates ──────────────────────────────────────────────

INDUSTRY_TEMPLATES = {
    "furniture": {
        "name": "Möbel",
        "example_product": "Kontorsstol",
        "components": [
            {
                "name": "Stålfot med hjul",
                "quantity": 4.5,
                "unit": "kg",
                "materials": [{"dataset_ref": "steel", "mass_kg": 4.5, "recycled_content_pct": 0}],
                "processes": [{"dataset_ref": "process_metal_forming", "energy_kwh": 8}],
                "transports": [
                    {"mode": "sea", "distance_km": 18000, "origin_iso": "CN", "dest_iso": "SE"},
                    {"mode": "road", "distance_km": 450, "origin_iso": "SE", "dest_iso": "SE"},
                ],
            },
            {
                "name": "Sits med skumstoppning",
                "quantity": 2.2,
                "unit": "kg",
                "materials": [
                    {"dataset_ref": "foam", "mass_kg": 0.8, "recycled_content_pct": 0},
                    {"dataset_ref": "polyester", "mass_kg": 1.4, "recycled_content_pct": 20},
                ],
                "processes": [
                    {"dataset_ref": "process_foam_molding", "energy_kwh": 3},
                    {"dataset_ref": "process_sewing", "energy_kwh": 1.5},
                ],
                "transports": [],
            },
            {
                "name": "Ryggstöd",
                "quantity": 1.8,
                "unit": "kg",
                "materials": [
                    {"dataset_ref": "plastic", "mass_kg": 1.2, "recycled_content_pct": 0},
                    {"dataset_ref": "polyester", "mass_kg": 0.6, "recycled_content_pct": 20},
                ],
                "processes": [],
                "transports": [],
            },
            {
                "name": "Gasdämpare",
                "quantity": 0.6,
                "unit": "kg",
                "materials": [{"dataset_ref": "steel", "mass_kg": 0.6, "recycled_content_pct": 0}],
                "processes": [],
                "transports": [],
            },
        ],
    },
    "food": {
        "name": "Livsmedel",
        "example_product": "Förpackat livsmedel (500g)",
        "components": [
            {
                "name": "Primärförpackning",
                "quantity": 0.035,
                "unit": "kg",
                "materials": [
                    {"dataset_ref": "plastic", "mass_kg": 0.025, "recycled_content_pct": 30},
                    {"dataset_ref": "cardboard", "mass_kg": 0.010, "recycled_content_pct": 80},
                ],
                "processes": [{"dataset_ref": "process_packaging", "energy_kwh": 0.5}],
                "transports": [
                    {"mode": "road", "distance_km": 200, "origin_iso": "SE", "dest_iso": "SE"},
                ],
            },
            {
                "name": "Sekundärförpackning (kartong)",
                "quantity": 0.12,
                "unit": "kg",
                "materials": [{"dataset_ref": "cardboard", "mass_kg": 0.12, "recycled_content_pct": 85}],
                "processes": [],
                "transports": [],
            },
            {
                "name": "Pall och krympfilm",
                "quantity": 0.05,
                "unit": "kg",
                "materials": [
                    {"dataset_ref": "wood", "mass_kg": 0.03, "recycled_content_pct": 0},
                    {"dataset_ref": "plastic", "mass_kg": 0.02, "recycled_content_pct": 0},
                ],
                "processes": [],
                "transports": [
                    {"mode": "road", "distance_km": 500, "origin_iso": "SE", "dest_iso": "SE"},
                ],
            },
        ],
    },
    "workshop": {
        "name": "Verkstad",
        "example_product": "CNC-bearbetad detalj i stål",
        "components": [
            {
                "name": "Stålämne",
                "quantity": 2.5,
                "unit": "kg",
                "materials": [{"dataset_ref": "steel", "mass_kg": 2.5, "recycled_content_pct": 25}],
                "processes": [
                    {"dataset_ref": "process_metal_forming", "energy_kwh": 12},
                    {"dataset_ref": "process_cnc_machining", "energy_kwh": 8},
                ],
                "transports": [
                    {"mode": "road", "distance_km": 300, "origin_iso": "SE", "dest_iso": "SE"},
                ],
            },
            {
                "name": "Ytbehandling",
                "quantity": 0.1,
                "unit": "kg",
                "materials": [{"dataset_ref": "coating", "mass_kg": 0.1, "recycled_content_pct": 0}],
                "processes": [{"dataset_ref": "process_surface_treatment", "energy_kwh": 3}],
                "transports": [],
            },
            {
                "name": "Förpackning",
                "quantity": 0.2,
                "unit": "kg",
                "materials": [{"dataset_ref": "cardboard", "mass_kg": 0.2, "recycled_content_pct": 90}],
                "processes": [],
                "transports": [],
            },
        ],
    },
}


@app.get("/templates")
def list_templates():
    """List available industry templates"""
    return {
        "templates": [
            {"id": tid, "name": t["name"], "example_product": t["example_product"]}
            for tid, t in INDUSTRY_TEMPLATES.items()
        ]
    }


@app.get("/templates/{template_id}")
def get_template(template_id: str):
    """Get full template with pre-filled components"""
    template = INDUSTRY_TEMPLATES.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@app.post("/templates/{template_id}/create")
def create_from_template(
    template_id: str,
    product_name: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Create a product pre-filled from an industry template"""
    template = INDUSTRY_TEMPLATES.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    product = Product(
        org_id=current_user.org_id,
        name=product_name or template["example_product"],
        description=f"Skapad från branschmall: {template['name']}",
        unit="st",
        iso_standard="ISO 14040, ISO 14067, ISO 14046",
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    for comp_data in template["components"]:
        comp = Component(
            product_id=product.id,
            name=comp_data["name"],
            quantity=comp_data["quantity"],
            unit=comp_data["unit"],
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)

        for mat in comp_data.get("materials", []):
            db.add(
                MaterialItem(
                    component_id=comp.id,
                    dataset_ref=mat["dataset_ref"],
                    mass_kg=mat["mass_kg"],
                    recycled_content_pct=mat.get("recycled_content_pct", 0),
                    overrides_json="{}",
                )
            )

        for proc in comp_data.get("processes", []):
            db.add(
                ProcessItem(
                    component_id=comp.id,
                    dataset_ref=proc["dataset_ref"],
                    energy_kwh=proc["energy_kwh"],
                    parameters_json="{}",
                )
            )

        for trans in comp_data.get("transports", []):
            db.add(
                TransportItem(
                    component_id=comp.id,
                    mode=trans["mode"],
                    distance_km=trans["distance_km"],
                    origin_iso=trans["origin_iso"],
                    dest_iso=trans["dest_iso"],
                    dataset_ref=f"{trans['mode']}_freight",
                )
            )

    db.commit()
    return {"product_id": product.id, "template": template_id, "name": product.name}


# ── Demo Endpoint (no auth) ────────────────────────────────────────


@app.post("/demo/{template_id}")
def demo_calculate(template_id: str, db: Session = Depends(get_session)):
    """Create a temporary product from template, run calculation, return results.
    No authentication required - this is the 'try without account' flow."""
    template = INDUSTRY_TEMPLATES.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Use org_id=1 (demo org) for demo products
    product = Product(
        org_id=1,
        name=f"[Demo] {template['example_product']}",
        description=f"Demo-analys från branschmall: {template['name']}",
        unit="st",
        iso_standard="ISO 14040, ISO 14067, ISO 14046, ISO 59004",
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    for comp_data in template["components"]:
        comp = Component(
            product_id=product.id,
            name=comp_data["name"],
            quantity=comp_data["quantity"],
            unit=comp_data["unit"],
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)

        for mat in comp_data.get("materials", []):
            db.add(
                MaterialItem(
                    component_id=comp.id,
                    dataset_ref=mat["dataset_ref"],
                    mass_kg=mat["mass_kg"],
                    recycled_content_pct=mat.get("recycled_content_pct", 0),
                    overrides_json="{}",
                )
            )
        for proc in comp_data.get("processes", []):
            db.add(
                ProcessItem(
                    component_id=comp.id,
                    dataset_ref=proc["dataset_ref"],
                    energy_kwh=proc["energy_kwh"],
                    parameters_json="{}",
                )
            )
        for trans in comp_data.get("transports", []):
            db.add(
                TransportItem(
                    component_id=comp.id,
                    mode=trans["mode"],
                    distance_km=trans["distance_km"],
                    origin_iso=trans["origin_iso"],
                    dest_iso=trans["dest_iso"],
                    dataset_ref=f"{trans['mode']}_freight",
                )
            )

    db.commit()

    # Run calculation
    from calculator import calculate_indicators

    results = calculate_indicators(db, product.id, "v1", "iso14040-2024")

    # Store run for potential follow-up
    demo_user = db.exec(select(User).where(User.email == "demo@skandiform.example")).first()
    db_run = Run(
        product_id=product.id,
        dataset_version="v1",
        method_version="iso14040-2024",
        status="completed",
        created_by=demo_user.id if demo_user else 1,
        iso_standards=json.dumps(
            ["ISO 14040", "ISO 14067", "ISO 14046", "ISO 14055", "ISO 59004"]
        ),
    )
    db.add(db_run)
    db.commit()
    db.refresh(db_run)

    db_result = RunResult(
        run_id=db_run.id,
        indicators_json=json.dumps(results["indicators"]),
        hotspots_json=json.dumps(results["hotspots"]),
        assumptions_json=json.dumps(results["assumptions"]),
        recommendations_json=json.dumps(results.get("recommendations", [])),
        ai_notes_json=json.dumps(results.get("ai_suggestions", [])),
    )
    db.add(db_result)
    db.commit()

    return {
        "product_id": product.id,
        "product_name": product.name,
        "run_id": db_run.id,
        "template": template_id,
        "template_name": template["name"],
        "indicators": results["indicators"],
        "hotspots": results["hotspots"],
        "assumptions": results["assumptions"],
        "recommendations": results.get("recommendations", []),
        "ai_suggestions": results.get("ai_suggestions", []),
        "components": template["components"],
    }


# ── Badge Generation ───────────────────────────────────────────────


@app.get("/badge/{run_id}")
def get_badge_svg(run_id: int, db: Session = Depends(get_session)):
    """Generate a shareable sustainability badge as SVG"""
    run = db.get(Run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    result = db.exec(select(RunResult).where(RunResult.run_id == run_id)).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    product = db.get(Product, run.product_id)

    indicators = json.loads(result.indicators_json)
    co2e = indicators.get("co2e_kg", 0)
    water = indicators.get("water_l", 0)
    circularity = indicators.get("circularity_pct", 0)
    energy = indicators.get("energy_mj", 0)

    product_name = product.name.replace("[Demo] ", "") if product else "Produkt"
    org = db.get(Organisation, product.org_id) if product else None
    org_name = org.name if org else ""
    verification_id = f"SIS-2030-{str(run_id).zfill(5)}"
    calc_date = run.created_at.strftime("%Y-%m-%d")

    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#F32735;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="520" rx="16" fill="white" stroke="#e2e8f0" stroke-width="1"/>

  <!-- Header -->
  <rect width="400" height="80" rx="16" fill="url(#headerGrad)"/>
  <rect y="64" width="400" height="16" fill="url(#headerGrad)"/>

  <!-- Verified badge -->
  <rect x="120" y="8" width="160" height="24" rx="12" fill="white" fill-opacity="0.2"/>
  <text x="200" y="24" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="white">Verifierad milj\u00f6analys</text>

  <!-- Product name -->
  <text x="200" y="55" text-anchor="middle" font-family="Inter,sans-serif" font-size="18" font-weight="700" fill="white">{product_name}</text>
  <text x="200" y="72" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="white" fill-opacity="0.8">{org_name} \u00b7 {calc_date}</text>

  <!-- Indicators -->
  <!-- CO2e -->
  <rect x="24" y="100" width="168" height="80" rx="12" fill="#fef2f2"/>
  <text x="108" y="124" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="600" fill="#991b1b" text-transform="uppercase" letter-spacing="0.5">Klimatp\u00e5verkan</text>
  <text x="108" y="155" text-anchor="middle" font-family="Inter,sans-serif" font-size="28" font-weight="700" fill="#0f172a">{co2e:.1f}</text>
  <text x="108" y="172" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#64748b">kg CO\u2082e</text>

  <!-- Water -->
  <rect x="208" y="100" width="168" height="80" rx="12" fill="#eff6ff"/>
  <text x="292" y="124" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="600" fill="#1e40af" text-transform="uppercase" letter-spacing="0.5">Vattenf\u00f6rbrukning</text>
  <text x="292" y="155" text-anchor="middle" font-family="Inter,sans-serif" font-size="28" font-weight="700" fill="#0f172a">{water:.0f}</text>
  <text x="292" y="172" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#64748b">liter</text>

  <!-- Energy -->
  <rect x="24" y="196" width="168" height="80" rx="12" fill="#fefce8"/>
  <text x="108" y="220" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="600" fill="#854d0e" text-transform="uppercase" letter-spacing="0.5">Energianv\u00e4ndning</text>
  <text x="108" y="251" text-anchor="middle" font-family="Inter,sans-serif" font-size="28" font-weight="700" fill="#0f172a">{energy:.1f}</text>
  <text x="108" y="268" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#64748b">MJ</text>

  <!-- Circularity -->
  <rect x="208" y="196" width="168" height="80" rx="12" fill="#f0fdf4"/>
  <text x="292" y="220" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="600" fill="#166534" text-transform="uppercase" letter-spacing="0.5">Cirkularitet</text>
  <text x="292" y="251" text-anchor="middle" font-family="Inter,sans-serif" font-size="28" font-weight="700" fill="#0f172a">{circularity:.0f}%</text>
  <text x="292" y="268" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#64748b">\u00e5tervunnet</text>

  <!-- Divider -->
  <line x1="40" y1="300" x2="360" y2="300" stroke="#e2e8f0" stroke-width="1"/>

  <!-- Standards -->
  <text x="200" y="328" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#94a3b8">Ber\u00e4knad enligt</text>
  <text x="200" y="348" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="#475569">ISO 14067 \u00b7 ISO 14046 \u00b7 ISO 59004</text>

  <!-- Powered by -->
  <rect x="100" y="370" width="200" height="36" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="112" y="378" width="20" height="20" rx="4" fill="#F32735"/>
  <text x="122" y="392" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" font-weight="700" fill="white">2+</text>
  <text x="210" y="393" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#0f172a">SIS 2030+ Calculator</text>

  <!-- Verification -->
  <text x="200" y="436" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#94a3b8">Verifierings-ID</text>
  <text x="200" y="456" text-anchor="middle" font-family="monospace" font-size="14" font-weight="600" fill="#334155">{verification_id}</text>

  <!-- Bottom link -->
  <text x="200" y="496" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#94a3b8">Skapa din egen analys p\u00e5 2030calculator.se</text>
</svg>"""

    return Response(content=svg, media_type="image/svg+xml")


# ── AI Endpoints ───────────────────────────────────────────────────

@app.post("/ai/parse-bom")
async def ai_parse_bom(request: BOMParseRequest):
    """Parse natural language BOM description into structured components"""
    components = await parse_bom_description(request.text)
    return {"components": components}


@app.post("/ai/match-material")
async def ai_match_material(request: MaterialMatchRequest):
    """Match material name to dataset reference"""
    matches = await match_material(request.query, request.context)
    return {"matches": matches}


@app.post("/ai/suggest/improvement")
async def ai_suggest_improvement(request: ImprovementRequest):
    """Generate improvement suggestions based on LCA results"""
    suggestions = await generate_improvement_suggestions(
        request.indicators,
        request.hotspots,
        request.components
    )
    return {"suggestions": suggestions}


@app.post("/ai/validate")
async def ai_validate(request: ValidateRequest):
    """Validate component data and flag unrealistic values"""
    warnings = await validate_component_data(
        request.component_type,
        request.mass_kg,
        request.material,
        request.energy_kwh
    )
    return {"warnings": warnings}


@app.post("/ai/transport-route")
async def ai_transport_route(request: TransportRouteRequest):
    """Generate realistic transport route"""
    route = await generate_transport_route(
        request.origin,
        request.destination,
        request.product_type
    )
    return route


@app.post("/ai/chat")
async def ai_chat(request: ChatRequest):
    """Chat assistant for LCA guidance"""
    response = await chat_assistant(request.question, request.context)
    return response


@app.post("/runs/{run_id}/export")
def export_run(run_id: int, format: str = "pdf", db: Session = Depends(get_session)):
    run = db.get(Run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    result = db.exec(select(RunResult).where(RunResult.run_id == run_id)).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    indicators = json.loads(result.indicators_json)
    hotspots = json.loads(result.hotspots_json)
    recommendations = json.loads(result.recommendations_json) if result.recommendations_json else []
    iso_standards = json.loads(run.iso_standards)

    units = {
        "co2e_kg": "kg CO₂e",
        "water_l": "liter",
        "energy_mj": "MJ",
        "land_m2a": "m²·år",
        "acid_mol_hplus": "mol H⁺-eq",
        "eutro_g_po4": "g PO₄³⁻-eq",
        "biodiversity_index": "index (0-1)",
        "circularity_pct": "%"
    }

    if format == "pdf":
        html = f"""
        <html lang="sv">
          <head>
            <meta charset="utf-8" />
            <style>
              body {{ font-family: 'Inter', sans-serif; margin: 24px; color: #0F172A; }}
              h1 {{ color: #003F87; }}
              h2 {{ color: #0066CC; margin-top: 32px; }}
              table {{ width: 100%; border-collapse: collapse; margin-top: 16px; }}
              th, td {{ border: 1px solid #CBD5E1; padding: 8px; text-align: left; font-size: 12px; }}
              th {{ background-color: #F1F5F9; }}
              .badge {{ display: inline-block; padding: 4px 8px; background: #003F87; color: white; border-radius: 999px; font-size: 10px; margin-right: 8px; }}
            </style>
          </head>
          <body>
            <h1>2030+ Calculator – ISO-rapport</h1>
            <p><strong>Produkt-ID:</strong> {run.product_id}</p>
            <p><strong>Metodversion:</strong> {run.method_version}</p>
            <p><strong>Beräknad:</strong> {run.created_at.strftime("%Y-%m-%d %H:%M")}</p>
            <div>
              {"".join(f"<span class='badge'>{code}</span>" for code in iso_standards)}
            </div>

            <h2>Miljöindikatorer</h2>
            <table>
              <thead>
                <tr><th>Indikator</th><th>Värde</th><th>Enhet</th></tr>
              </thead>
              <tbody>
                {"".join(f"<tr><td>{key}</td><td>{value}</td><td>{units.get(key, '')}</td></tr>" for key, value in indicators.items())}
              </tbody>
            </table>

            <h2>Hotspots</h2>
            <table>
              <thead>
                <tr><th>Namn</th><th>Bidrag</th></tr>
              </thead>
              <tbody>
                {"".join(f"<tr><td>{h['name']}</td><td>{h.get('share_pct') or h.get('contribution_pct', 0)}%</td></tr>" for h in hotspots)}
              </tbody>
            </table>

            <h2>Rekommendationer</h2>
            <ul>
              {"".join(f"<li><strong>{rec['action']}</strong> – {rec['impact']} ({rec['standard']})</li>" for rec in recommendations)}
            </ul>
          </body>
        </html>
        """
        output_path = EXPORT_DIR / f"run_{run_id}_iso_report.pdf"
        if HTML:
            HTML(string=html).write_pdf(str(output_path))
            return {"report_url": f"/exports/{output_path.name}"}
        else:
            raise HTTPException(status_code=501, detail="PDF export not available (WeasyPrint missing)")

    if format == "csv":
        output_path = EXPORT_DIR / f"run_{run_id}_data.csv"
        with output_path.open("w", newline="", encoding="utf-8") as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(["Indikator", "Värde", "Enhet"])
            for key, value in indicators.items():
                writer.writerow([key, value, units.get(key, "")])
        return {"report_url": f"/exports/{output_path.name}"}

    raise HTTPException(status_code=400, detail="Invalid export format")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)



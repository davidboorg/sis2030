from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
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
# Security: Require JWT_SECRET in production, allow demo mode for development
_jwt_secret = os.getenv("JWT_SECRET")
if not _jwt_secret:
    import warnings
    warnings.warn("JWT_SECRET not set! Using insecure demo key. Set JWT_SECRET env var for production.")
    _jwt_secret = "demo-secret-DO-NOT-USE-IN-PRODUCTION"
SECRET_KEY = _jwt_secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 4  # 4 hours (was 24h - reduced for security)


init_db()

app = FastAPI(title="TR/ACE API")

# Security: Rate limiting to prevent brute force attacks
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security: Locked down CORS - only allow specific methods and headers
# IMPORTANT: In production, set CORS_ORIGINS to HTTPS URLs only!
# Example: CORS_ORIGINS=https://trace.example.com,https://www.trace.example.com
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3030,http://127.0.0.1:3030,http://localhost:3031,http://127.0.0.1:3031").split(",")

# Security: Warn if HTTP origins detected in production
_is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"
if _is_production and any(origin.startswith("http://") for origin in cors_origins):
    import warnings
    warnings.warn(
        "CRITICAL: HTTP CORS origins detected in production! "
        "All origins should use HTTPS to protect tokens in transit.",
        RuntimeWarning
    )
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
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
@limiter.limit("5/minute")  # Security: Rate limit login attempts
def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_session)):
    user = db.exec(select(User).where(User.email == login_data.email)).first()
    if not user or not pwd_context.verify(login_data.password, user.password_hash):
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


@app.get("/certificate/{run_id}/pdf")
def get_certificate_pdf(run_id: int, db: Session = Depends(get_session)):
    """Generate and return a styled PDF certificate for a run."""
    run = db.get(Run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    result = db.exec(select(RunResult).where(RunResult.run_id == run_id)).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    # Get product info
    product = db.get(Product, run.product_id)
    product_name = product.name.replace("[Demo] ", "") if product else f"Produkt #{run.product_id}"
    org_name = ""
    if product and product.org_id:
        org = db.get(Organisation, product.org_id)
        org_name = org.name if org else ""

    indicators = json.loads(result.indicators_json)
    hotspots = json.loads(result.hotspots_json)
    assumptions = json.loads(result.assumptions_json) if result.assumptions_json else []

    verification_id = f"TRC-{datetime.now().year}-{str(run_id).zfill(5)}"
    calculated_date = run.created_at.strftime("%Y-%m-%d") if run.created_at else datetime.now().strftime("%Y-%m-%d")
    valid_until = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")

    indicator_labels = {
        "co2e_kg": ("Klimatpåverkan", "kg CO₂e"),
        "water_l": ("Vattenförbrukning", "liter"),
        "energy_mj": ("Energianvändning", "MJ"),
        "circularity_pct": ("Cirkularitet", "%"),
        "land_m2a": ("Markanvändning", "m²·år"),
        "acid_mol_hplus": ("Försurning", "mol H⁺-eq"),
        "eutro_g_po4": ("Övergödning", "g PO₄³⁻-eq"),
        "biodiversity_index": ("Biodiversitet", "index"),
    }

    # Build indicators HTML
    indicators_html = ""
    for key, value in indicators.items():
        if key in indicator_labels:
            label, unit = indicator_labels[key]
            formatted_value = f"{value:,.1f}".replace(",", " ") if isinstance(value, (int, float)) else str(value)
            indicators_html += f"""
            <div class="indicator">
                <div class="indicator-label">{label}</div>
                <div class="indicator-value">{formatted_value}</div>
                <div class="indicator-unit">{unit}</div>
            </div>
            """

    # Build hotspots HTML
    hotspots_html = ""
    for hs in hotspots[:5]:
        pct = hs.get("share_pct") or hs.get("contribution_pct", 0)
        hotspots_html += f"""
        <div class="hotspot">
            <div class="hotspot-bar" style="width: {pct}%;"></div>
            <span class="hotspot-name">{hs['name']}</span>
            <span class="hotspot-pct">{pct}%</span>
        </div>
        """

    # Build assumptions HTML
    assumptions_html = "".join(f"<li>{a}</li>" for a in assumptions[:6])

    html = f"""
    <!DOCTYPE html>
    <html lang="sv">
    <head>
        <meta charset="utf-8">
        <title>TR/ACE Certifikat - {product_name}</title>
        <style>
            @page {{
                size: A4;
                margin: 0;
            }}
            * {{
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }}
            body {{
                font-family: 'Helvetica Neue', Arial, sans-serif;
                background: #0F172A;
                color: #F8FAFC;
                padding: 40px;
                min-height: 297mm;
            }}
            .certificate {{
                border: 1px solid #1E293B;
                background: #1E293B;
                position: relative;
            }}
            .accent-line {{
                height: 4px;
                background: linear-gradient(to right, #F32735, transparent);
            }}
            .header {{
                padding: 40px;
                border-bottom: 1px solid #334155;
            }}
            .header-top {{
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }}
            .badge {{
                display: inline-flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;
            }}
            .badge-dot {{
                width: 8px;
                height: 8px;
                background: #F32735;
                border-radius: 50%;
            }}
            .badge-text {{
                font-size: 9px;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                color: #F32735;
            }}
            .product-name {{
                font-size: 32px;
                font-weight: 300;
                margin-bottom: 8px;
            }}
            .org-name {{
                font-size: 14px;
                color: #94A3B8;
            }}
            .seal {{
                width: 64px;
                height: 64px;
                border: 1px solid #F32735;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }}
            .seal-top {{
                font-size: 7px;
                letter-spacing: 0.1em;
                color: #64748B;
            }}
            .seal-slash {{
                font-size: 24px;
                color: #F32735;
                font-style: italic;
                font-weight: 300;
            }}
            .seal-bottom {{
                font-size: 6px;
                letter-spacing: 0.05em;
                color: #64748B;
                text-align: center;
                line-height: 1.3;
            }}
            .standards {{
                padding: 24px 40px;
                background: #334155;
                border-bottom: 1px solid #1E293B;
            }}
            .standards-label {{
                font-size: 9px;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                color: #64748B;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
            }}
            .standards-label::before {{
                content: '';
                width: 8px;
                height: 8px;
                background: #F32735;
                border-radius: 50%;
            }}
            .standards-level {{
                font-size: 11px;
                color: #94A3B8;
                margin-bottom: 4px;
            }}
            .standards-iso {{
                font-size: 20px;
                letter-spacing: 0.05em;
            }}
            .standards-iso span {{
                color: #F32735;
            }}
            .indicators {{
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                border-bottom: 1px solid #334155;
            }}
            .indicator {{
                padding: 24px;
                border-right: 1px solid #334155;
                border-bottom: 1px solid #334155;
            }}
            .indicator:nth-child(4n) {{
                border-right: none;
            }}
            .indicator-label {{
                font-size: 8px;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                color: #64748B;
                margin-bottom: 8px;
            }}
            .indicator-value {{
                font-size: 24px;
                font-weight: 300;
                margin-bottom: 4px;
            }}
            .indicator-unit {{
                font-size: 11px;
                color: #64748B;
            }}
            .content {{
                display: grid;
                grid-template-columns: 1fr 1fr;
            }}
            .section {{
                padding: 32px 40px;
                border-right: 1px solid #334155;
            }}
            .section:last-child {{
                border-right: none;
            }}
            .section-title {{
                font-size: 9px;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                color: #64748B;
                margin-bottom: 16px;
            }}
            .hotspot {{
                position: relative;
                padding: 8px 0;
                display: flex;
                justify-content: space-between;
            }}
            .hotspot-bar {{
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                background: rgba(243, 39, 53, 0.2);
            }}
            .hotspot-name {{
                position: relative;
                font-size: 12px;
                color: #F8FAFC;
            }}
            .hotspot-pct {{
                position: relative;
                font-size: 12px;
                color: #94A3B8;
            }}
            .assumptions {{
                font-size: 11px;
                color: #94A3B8;
                line-height: 1.6;
            }}
            .assumptions li {{
                margin-bottom: 4px;
                padding-left: 12px;
                position: relative;
            }}
            .assumptions li::before {{
                content: '·';
                position: absolute;
                left: 0;
                color: #F32735;
            }}
            .metadata {{
                padding: 32px 40px;
                border-top: 1px solid #334155;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 32px;
            }}
            .meta-row {{
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                padding: 4px 0;
            }}
            .meta-label {{
                color: #64748B;
                letter-spacing: 0.05em;
            }}
            .meta-value {{
                color: #F8FAFC;
            }}
            .meta-value.accent {{
                color: #F32735;
            }}
            .qr-section {{
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 16px;
            }}
            .qr-text {{
                text-align: right;
            }}
            .qr-label {{
                font-size: 8px;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                color: #64748B;
                margin-bottom: 4px;
            }}
            .qr-url {{
                font-size: 11px;
                color: #94A3B8;
            }}
            .qr-placeholder {{
                width: 80px;
                height: 80px;
                border: 1px solid #334155;
                background: #0F172A;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                color: #64748B;
            }}
            .footer {{
                padding: 16px 40px;
                border-top: 1px solid #334155;
                background: #334155;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }}
            .footer-verified {{
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 10px;
                letter-spacing: 0.1em;
                color: #F32735;
            }}
            .footer-verified::before {{
                content: '';
                width: 8px;
                height: 8px;
                background: #F32735;
                border-radius: 50%;
                box-shadow: 0 0 8px #F32735;
            }}
            .footer-logo {{
                font-size: 18px;
                font-weight: 300;
            }}
            .footer-logo span {{
                color: #F32735;
                font-style: italic;
            }}
            .disclaimer {{
                margin-top: 24px;
                padding: 16px;
                border: 1px solid #334155;
                font-size: 10px;
                color: #64748B;
                line-height: 1.5;
            }}
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="accent-line"></div>

            <div class="header">
                <div class="header-top">
                    <div>
                        <div class="badge">
                            <div class="badge-dot"></div>
                            <span class="badge-text">Screening-LCA · ISO 14040/14044 · Ej externt granskad</span>
                        </div>
                        <h1 class="product-name">{product_name}</h1>
                        {f'<p class="org-name">{org_name}</p>' if org_name else ''}
                    </div>
                    <div class="seal">
                        <span class="seal-top">TR/ACE</span>
                        <span class="seal-slash">/</span>
                        <span class="seal-bottom">VERIFIED<br>{datetime.now().year}</span>
                    </div>
                </div>
            </div>

            <div class="standards">
                <div class="standards-label">Beräkningsstandard</div>
                <div class="standards-level">Nivå 1 — TR/ACE screening</div>
                <div class="standards-iso">ISO 14040<span>/</span>14044</div>
            </div>

            <div class="indicators">
                {indicators_html}
            </div>

            <div class="content">
                <div class="section">
                    <div class="section-title">Hotspots — var kommer påverkan ifrån?</div>
                    {hotspots_html if hotspots_html else '<p style="color: #64748B; font-size: 12px;">Inga hotspots identifierade.</p>'}
                </div>
                <div class="section">
                    <div class="section-title">Antaganden</div>
                    <ul class="assumptions">
                        {assumptions_html if assumptions_html else '<li>Standardantaganden enligt ISO 14040</li>'}
                    </ul>
                </div>
            </div>

            <div class="metadata">
                <div>
                    <div class="meta-row">
                        <span class="meta-label">REFERENCE</span>
                        <span class="meta-value">{verification_id}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">ISSUED</span>
                        <span class="meta-value">{calculated_date}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">VALID UNTIL</span>
                        <span class="meta-value">{valid_until}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">INDICATORS</span>
                        <span class="meta-value accent">{len(indicators)} / 8</span>
                    </div>
                </div>
                <div class="qr-section">
                    <div class="qr-text">
                        <div class="qr-label">Verifiera</div>
                        <div class="qr-url">trace.se/c/{run_id}</div>
                    </div>
                    <div class="qr-placeholder">QR</div>
                </div>
            </div>

            <div class="footer">
                <div class="footer-verified">VERIFIED — trace.se/verify/{verification_id}</div>
                <div class="footer-logo">TR<span>/</span>ACE</div>
            </div>
        </div>

        <div class="disclaimer">
            <strong>Screening-LCA enligt ISO 14040/14044.</strong>
            Resultaten baseras på branschgenomsnitt och bör valideras för officiella deklarationer.
            Beräkningen inkluderar cradle-to-gate scope och täcker råmaterialutvinning, tillverkning och transport.
            Detta dokument är automatiskt genererat av TR/ACE och har inte externt granskats.
        </div>
    </body>
    </html>
    """

    if not HTML:
        raise HTTPException(status_code=501, detail="PDF export not available (WeasyPrint not installed)")

    try:
        pdf_bytes = HTML(string=html).write_pdf()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="trace-certificate-{run_id}.pdf"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")


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
    "construction": {
        "name": "Bygg & Fastighet",
        "example_product": "Byggelement",
        "icon": "🏗️",
        "components": [
            {
                "name": "Betongstomme",
                "quantity": 15.0,
                "unit": "kg",
                "materials": [{"dataset_ref": "concrete", "mass_kg": 15.0, "recycled_content_pct": 10}],
                "processes": [{"dataset_ref": "process_concrete_mixing", "energy_kwh": 5}],
                "transports": [
                    {"mode": "road", "distance_km": 200, "origin_iso": "SE", "dest_iso": "SE"},
                ],
            },
            {
                "name": "Stålarmering",
                "quantity": 8.0,
                "unit": "kg",
                "materials": [{"dataset_ref": "steel", "mass_kg": 8.0, "recycled_content_pct": 35}],
                "processes": [{"dataset_ref": "process_metal_forming", "energy_kwh": 10}],
                "transports": [],
            },
            {
                "name": "Isolering (mineralull)",
                "quantity": 3.0,
                "unit": "kg",
                "materials": [{"dataset_ref": "insulation", "mass_kg": 3.0, "recycled_content_pct": 20}],
                "processes": [],
                "transports": [],
            },
        ],
    },
    "textile": {
        "name": "Textil",
        "example_product": "Plagg (t-shirt)",
        "icon": "👕",
        "components": [
            {
                "name": "Bomullstyg",
                "quantity": 0.3,
                "unit": "kg",
                "materials": [{"dataset_ref": "cotton", "mass_kg": 0.3, "recycled_content_pct": 0}],
                "processes": [
                    {"dataset_ref": "process_weaving", "energy_kwh": 1.5},
                ],
                "transports": [
                    {"mode": "sea", "distance_km": 15000, "origin_iso": "BD", "dest_iso": "SE"},
                    {"mode": "road", "distance_km": 100, "origin_iso": "SE", "dest_iso": "SE"},
                ],
            },
            {
                "name": "Polyesterdetaljer",
                "quantity": 0.15,
                "unit": "kg",
                "materials": [{"dataset_ref": "polyester", "mass_kg": 0.15, "recycled_content_pct": 50}],
                "processes": [],
                "transports": [],
            },
            {
                "name": "Färgning och finish",
                "quantity": 0.05,
                "unit": "kg",
                "materials": [{"dataset_ref": "dye", "mass_kg": 0.05, "recycled_content_pct": 0}],
                "processes": [{"dataset_ref": "process_dyeing", "energy_kwh": 2}],
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


# ── Industry Benchmarks ────────────────────────────────────────────

INDUSTRY_BENCHMARKS = {
    "furniture": {"avg_co2e": 18.2, "best_co2e": 8.1, "unit": "kg CO₂e/stol"},
    "food": {"avg_co2e": 3.5, "best_co2e": 1.2, "unit": "kg CO₂e/kg produkt"},
    "workshop": {"avg_co2e": 45.0, "best_co2e": 22.0, "unit": "kg CO₂e/detalj"},
    "construction": {"avg_co2e": 120.0, "best_co2e": 65.0, "unit": "kg CO₂e/element"},
    "textile": {"avg_co2e": 8.5, "best_co2e": 3.2, "unit": "kg CO₂e/plagg"},
}


@app.get("/benchmark/{template_id}")
def get_benchmark(template_id: str):
    """Get industry benchmark for comparison"""
    benchmark = INDUSTRY_BENCHMARKS.get(template_id)
    if not benchmark:
        raise HTTPException(status_code=404, detail="Benchmark not found")
    return benchmark


# ── Demo Endpoint (no auth) ────────────────────────────────────────


class WizardCalculateRequest(BaseModel):
    """Request body for wizard-based calculation"""
    templateId: str
    companyName: Optional[str] = None
    productName: Optional[str] = None
    materials: List[Dict[str, Any]]
    electricityKwh: float = 0
    heatKwh: float = 0
    supplierDistance: float = 200
    customerDistance: float = 100
    transportMode: str = "truck"


@app.post("/demo/wizard")
def demo_wizard_calculate(request: WizardCalculateRequest, db: Session = Depends(get_session)):
    """Calculate LCA from wizard data without requiring authentication.
    This endpoint takes wizard form data and returns calculated indicators."""

    template = INDUSTRY_TEMPLATES.get(request.templateId)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Create a temporary product
    product_name = request.productName or template.get("example_product", "Demo-produkt")
    product = Product(
        org_id=1,
        name=f"[Demo] {product_name}",
        description=f"Wizard-analys från branschmall: {template['name']}",
        unit="st",
        iso_standard="ISO 14040, ISO 14067, ISO 14046, ISO 59004",
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # Map wizard materials to components
    for mat in request.materials:
        if mat.get("quantity", 0) <= 0:
            continue

        # Create component from wizard material
        comp = Component(
            product_id=product.id,
            name=mat.get("name", "Material"),
            quantity=mat.get("quantity", 0),
            unit=mat.get("unit", "kg"),
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)

        # Map material ID to dataset_ref
        material_id = mat.get("id", "").lower()
        dataset_ref = material_id if material_id else "plastic"

        # Handle unit conversion for kWh (energy as process)
        if mat.get("unit") == "kWh":
            db.add(ProcessItem(
                component_id=comp.id,
                dataset_ref=f"process_{material_id}" if material_id else "process_assembly",
                energy_kwh=mat.get("quantity", 0),
                parameters_json="{}",
            ))
        else:
            db.add(MaterialItem(
                component_id=comp.id,
                dataset_ref=dataset_ref,
                mass_kg=mat.get("quantity", 0),
                recycled_content_pct=0,
                overrides_json="{}",
            ))

    # Add energy usage as a process component
    if request.electricityKwh > 0 or request.heatKwh > 0:
        energy_comp = Component(
            product_id=product.id,
            name="Energianvändning",
            quantity=request.electricityKwh + request.heatKwh,
            unit="kWh",
        )
        db.add(energy_comp)
        db.commit()
        db.refresh(energy_comp)

        if request.electricityKwh > 0:
            db.add(ProcessItem(
                component_id=energy_comp.id,
                dataset_ref="process_assembly",
                energy_kwh=request.electricityKwh,
                parameters_json="{}",
            ))
        if request.heatKwh > 0:
            db.add(ProcessItem(
                component_id=energy_comp.id,
                dataset_ref="process_metal_forming",
                energy_kwh=request.heatKwh,
                parameters_json="{}",
            ))

    # Add transport
    if request.supplierDistance > 0 or request.customerDistance > 0:
        transport_comp = Component(
            product_id=product.id,
            name="Transport",
            quantity=1,
            unit="st",
        )
        db.add(transport_comp)
        db.commit()
        db.refresh(transport_comp)

        transport_mode_map = {"truck": "road", "rail": "rail", "ship": "sea"}
        mode = transport_mode_map.get(request.transportMode, "road")

        total_distance = request.supplierDistance + request.customerDistance
        if total_distance > 0:
            db.add(TransportItem(
                component_id=transport_comp.id,
                mode=mode,
                distance_km=total_distance,
                origin_iso="SE",
                dest_iso="SE",
                dataset_ref=f"{mode}_freight",
            ))

    db.commit()

    # Run calculation
    from calculator import calculate_indicators
    results = calculate_indicators(db, product.id, "v1", "iso14040-2024")

    # Store run for certificate generation
    demo_user = db.exec(select(User).where(User.email == "demo@skandiform.example")).first()
    db_run = Run(
        product_id=product.id,
        dataset_version="v1",
        method_version="iso14040-2024",
        status="completed",
        created_by=demo_user.id if demo_user else 1,
        iso_standards=json.dumps(["ISO 14040", "ISO 14067", "ISO 14046", "ISO 14055", "ISO 59004"]),
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

    # Calculate scope breakdown for visualization
    indicators = results["indicators"]
    total_co2e = indicators.get("co2e_kg", 0)

    # Estimate scope breakdown (simplified)
    scope1 = total_co2e * 0.05  # Direct emissions (small for most products)
    scope2 = (request.electricityKwh * 0.05 + request.heatKwh * 0.1)  # Energy
    scope3 = max(0, total_co2e - scope1 - scope2)  # Materials and transport

    # Get benchmark for comparison
    benchmark = INDUSTRY_BENCHMARKS.get(request.templateId, {})

    return {
        "product_id": product.id,
        "product_name": product_name,
        "run_id": db_run.id,
        "template": request.templateId,
        "template_name": template["name"],
        "indicators": results["indicators"],
        "hotspots": results["hotspots"],
        "assumptions": results["assumptions"],
        "recommendations": results.get("recommendations", []),
        "ai_suggestions": results.get("ai_suggestions", []),
        "scopes": {
            "scope1": round(scope1, 2),
            "scope2": round(scope2, 2),
            "scope3": round(scope3, 2),
        },
        "benchmark": benchmark,
    }


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
    """Generate a shareable sustainability badge as SVG — TR/ACE brand identity"""
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
    verification_id = f"TRC-{run.created_at.strftime('%Y')}-{str(run_id).zfill(5)}"
    calc_date = run.created_at.strftime("%Y-%m-%d")

    # TR/ACE Brand Colors
    void = "#080808"
    surface = "#111111"
    surface2 = "#1A1A1A"
    border = "#272727"
    parchment = "#EFEFEA"
    gold = "#E8D48B"
    verified = "#7EE8A2"
    muted = "#666666"

    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520">
  <defs>
    <linearGradient id="goldFade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:{gold};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:{gold};stop-opacity:0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="520" fill="{void}"/>
  <rect width="400" height="520" fill="{surface}" x="0" y="0"/>

  <!-- Gold accent line -->
  <rect x="0" y="0" width="400" height="3" fill="url(#goldFade)"/>

  <!-- Header -->
  <rect x="0" y="0" width="400" height="120" fill="{surface}"/>

  <!-- Logo: TR/ACE -->
  <text x="32" y="52" font-family="Georgia,serif" font-size="28" font-weight="300" fill="{parchment}">TR<tspan fill="{gold}" font-style="italic">/</tspan>ACE</text>

  <!-- Verified status -->
  <circle cx="340" cy="40" r="4" fill="{verified}"/>
  <text x="355" y="44" font-family="monospace" font-size="9" fill="{verified}" letter-spacing="0.1em">VERIFIED</text>

  <!-- Product name -->
  <text x="32" y="90" font-family="Georgia,serif" font-size="24" font-weight="300" fill="{parchment}">{product_name}</text>
  <text x="32" y="110" font-family="monospace" font-size="11" fill="{muted}">{org_name}</text>

  <!-- Divider -->
  <line x1="0" y1="120" x2="400" y2="120" stroke="{border}" stroke-width="1"/>

  <!-- Standards section -->
  <rect x="0" y="120" width="400" height="48" fill="{surface2}"/>
  <text x="32" y="140" font-family="monospace" font-size="9" fill="{muted}" letter-spacing="0.15em">BER&#196;KNINGSSTANDARD</text>
  <text x="32" y="158" font-family="monospace" font-size="14" fill="{parchment}">ISO 14040<tspan fill="{gold}">/</tspan>14044</text>

  <!-- Divider -->
  <line x1="0" y1="168" x2="400" y2="168" stroke="{border}" stroke-width="1"/>

  <!-- Indicators Grid (2x2) -->
  <!-- CO2e -->
  <rect x="0" y="168" width="200" height="88" fill="{surface}"/>
  <text x="24" y="196" font-family="monospace" font-size="9" fill="{muted}" letter-spacing="0.1em">KLIMATP&#197;VERKAN</text>
  <text x="24" y="232" font-family="monospace" font-size="32" fill="{parchment}">{co2e:.1f}</text>
  <text x="24" y="248" font-family="monospace" font-size="11" fill="{muted}">kg CO&#8322;e</text>
  <line x1="200" y1="168" x2="200" y2="256" stroke="{border}" stroke-width="1"/>

  <!-- Water -->
  <rect x="200" y="168" width="200" height="88" fill="{surface}"/>
  <text x="224" y="196" font-family="monospace" font-size="9" fill="{muted}" letter-spacing="0.1em">VATTENF&#214;RBRUKNING</text>
  <text x="224" y="232" font-family="monospace" font-size="32" fill="{parchment}">{water:.0f}</text>
  <text x="224" y="248" font-family="monospace" font-size="11" fill="{muted}">liter</text>

  <!-- Divider -->
  <line x1="0" y1="256" x2="400" y2="256" stroke="{border}" stroke-width="1"/>

  <!-- Energy -->
  <rect x="0" y="256" width="200" height="88" fill="{surface}"/>
  <text x="24" y="284" font-family="monospace" font-size="9" fill="{muted}" letter-spacing="0.1em">ENERGIANV&#196;NDNING</text>
  <text x="24" y="320" font-family="monospace" font-size="32" fill="{parchment}">{energy:.1f}</text>
  <text x="24" y="336" font-family="monospace" font-size="11" fill="{muted}">MJ</text>
  <line x1="200" y1="256" x2="200" y2="344" stroke="{border}" stroke-width="1"/>

  <!-- Circularity -->
  <rect x="200" y="256" width="200" height="88" fill="{surface}"/>
  <text x="224" y="284" font-family="monospace" font-size="9" fill="{muted}" letter-spacing="0.1em">CIRKULARITET</text>
  <text x="224" y="320" font-family="monospace" font-size="32" fill="{parchment}">{circularity:.0f}<tspan font-size="18">%</tspan></text>
  <text x="224" y="336" font-family="monospace" font-size="11" fill="{muted}">&#229;tervunnet</text>

  <!-- Divider -->
  <line x1="0" y1="344" x2="400" y2="344" stroke="{border}" stroke-width="1"/>

  <!-- Metadata section -->
  <rect x="0" y="344" width="400" height="96" fill="{surface}"/>

  <text x="32" y="372" font-family="monospace" font-size="9" fill="{muted}">REFERENCE</text>
  <text x="200" y="372" font-family="monospace" font-size="9" fill="{parchment}">{verification_id}</text>

  <text x="32" y="392" font-family="monospace" font-size="9" fill="{muted}">ISSUED</text>
  <text x="200" y="392" font-family="monospace" font-size="9" fill="{parchment}">{calc_date}</text>

  <text x="32" y="412" font-family="monospace" font-size="9" fill="{muted}">INDICATORS</text>
  <text x="200" y="412" font-family="monospace" font-size="9" fill="{verified}">4 / 4 &#10003;</text>

  <text x="32" y="432" font-family="monospace" font-size="9" fill="{muted}">STATUS</text>
  <circle cx="204" cy="428" r="3" fill="{verified}"/>
  <text x="214" y="432" font-family="monospace" font-size="9" fill="{verified}">ACTIVE</text>

  <!-- Divider -->
  <line x1="0" y1="440" x2="400" y2="440" stroke="{border}" stroke-width="1"/>

  <!-- Footer -->
  <rect x="0" y="440" width="400" height="80" fill="{surface2}"/>

  <!-- Seal -->
  <rect x="32" y="456" width="48" height="48" fill="none" stroke="{gold}" stroke-width="1"/>
  <text x="56" y="474" text-anchor="middle" font-family="monospace" font-size="7" fill="{muted}">TR/ACE</text>
  <text x="56" y="488" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="{gold}" font-style="italic">/</text>
  <text x="56" y="499" text-anchor="middle" font-family="monospace" font-size="6" fill="{muted}">VERIFIED</text>

  <!-- Verification link -->
  <text x="100" y="476" font-family="monospace" font-size="9" fill="{muted}">Verifiera detta certifikat:</text>
  <text x="100" y="492" font-family="monospace" font-size="10" fill="{parchment}">trace.se/c/{run_id}</text>

  <!-- Logo repeat -->
  <text x="340" y="492" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="300" fill="{parchment}">TR<tspan fill="{gold}" font-style="italic">/</tspan>ACE</text>
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
            <h1>TR/ACE – ISO-rapport</h1>
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



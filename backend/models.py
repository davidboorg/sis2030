from sqlmodel import Field, SQLModel, JSON, Column
from typing import Optional
from datetime import datetime


class Organisation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    plan: str = "pro"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organisation.id")
    email: str = Field(unique=True)
    password_hash: str
    role: str = "member"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class License(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organisation.id")
    plan: str
    seats: int
    expires_at: datetime
    features_json: str = Field(sa_column=Column(JSON))


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organisation.id")
    name: str
    description: Optional[str] = None
    unit: str = "st"
    iso_standard: str = "ISO 14040"
    version_tag: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Component(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    name: str
    quantity: float
    unit: str
    parent_id: Optional[int] = None  # För hierarkisk struktur


class MaterialItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="component.id")
    dataset_ref: str
    mass_kg: float
    recycled_content_pct: Optional[float] = 0
    biodiversity_score: Optional[float] = None
    overrides_json: str = Field(sa_column=Column(JSON))


class ProcessItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="component.id")
    dataset_ref: str
    energy_kwh: float
    parameters_json: str = Field(sa_column=Column(JSON))


class TransportItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="component.id")
    mode: str
    distance_km: float
    origin_iso: str
    dest_iso: str
    dataset_ref: str


class Run(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    dataset_version: str
    method_version: str = "iso14040-2024"
    iso_standards: str = "[]"  # JSON array av tillämpade standarder
    status: str = "pending"
    created_by: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RunResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    run_id: int = Field(foreign_key="run.id")
    indicators_json: str = Field(sa_column=Column(JSON))  # Inkluderar alla 8 indikatorer
    hotspots_json: str = Field(sa_column=Column(JSON))
    assumptions_json: str = Field(sa_column=Column(JSON))
    recommendations_json: str = Field(sa_column=Column(JSON))  # ISO-baserade rekommendationer
    ai_notes_json: str = Field(sa_column=Column(JSON))


class Dataset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    source: str
    version: str
    scope: str
    metadata_json: str = Field(sa_column=Column(JSON))


class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    run_id: int = Field(foreign_key="run.id")
    type: str
    url: str
    created_at: datetime = Field(default_factory=datetime.utcnow)



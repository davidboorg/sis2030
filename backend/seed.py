from sqlmodel import SQLModel
from passlib.context import CryptContext

from database import engine, init_db, session_scope
from models import Component, Dataset, MaterialItem, Organisation, ProcessItem, Product, TransportItem, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_database():
    SQLModel.metadata.drop_all(engine)
    init_db()
    
    with session_scope() as session:
        # Skapa organisation
        org = Organisation(
            name="Skandiform AB",
            plan="pro"
        )
        session.add(org)
        session.commit()
        
        # Skapa användare
        password = "Demo123!"
        user = User(
            org_id=org.id,
            email="demo@skandiform.example",
            password_hash=pwd_context.hash(password[:72]),  # bcrypt max 72 bytes
            # password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", # Hashed 'Demo123!'
            role="admin"
        )
        session.add(user)
        session.commit()
        
        # Skapa produkt - Realistisk kontorsstol
        product = Product(
            org_id=org.id,
            name="Kontorsstol Ergo Pro",
            description="Ergonomisk kontorsstol med stålfot, textilklädsel och skumstoppning. Typisk produkt för SME-tillverkare.",
            unit="st",
            iso_standard="ISO 14040, ISO 14067, ISO 14046"
        )
        session.add(product)
        session.commit()
        
        # Skapa komponenter - Realistiska stoldelar
        comp1 = Component(
            product_id=product.id,
            name="Stålfot med hjul",
            quantity=4.5,
            unit="kg"
        )
        comp2 = Component(
            product_id=product.id,
            name="Sits med skumstoppning",
            quantity=2.2,
            unit="kg"
        )
        comp3 = Component(
            product_id=product.id,
            name="Ryggstöd",
            quantity=1.8,
            unit="kg"
        )
        comp4 = Component(
            product_id=product.id,
            name="Gasdämpare",
            quantity=0.6,
            unit="kg"
        )
        session.add_all([comp1, comp2, comp3, comp4])
        session.commit()
        
        # Lägg till material - Optimerade för Climatiq
        mat1 = MaterialItem(
            component_id=comp1.id,
            dataset_ref="steel",  # Enklare namn
            mass_kg=4.5,
            recycled_content_pct=0,
            biodiversity_score=0.8,
            overrides_json="{}"
        )
        mat2 = MaterialItem(
            component_id=comp2.id,
            dataset_ref="foam",  # Generiskt skum
            mass_kg=0.8,
            recycled_content_pct=0,
            biodiversity_score=0.5,
            overrides_json="{}"
        )
        mat3 = MaterialItem(
            component_id=comp2.id,
            dataset_ref="polyester",  # Enklare tyg-namn
            mass_kg=1.4,
            recycled_content_pct=20,
            biodiversity_score=0.6,
            overrides_json="{}"
        )
        mat4 = MaterialItem(
            component_id=comp3.id,
            dataset_ref="plastic",  # Generisk plast
            mass_kg=1.2,
            recycled_content_pct=0,
            biodiversity_score=0.5,
            overrides_json="{}"
        )
        mat5 = MaterialItem(
            component_id=comp3.id,
            dataset_ref="polyester",
            mass_kg=0.6,
            recycled_content_pct=20,
            biodiversity_score=0.6,
            overrides_json="{}"
        )
        mat6 = MaterialItem(
            component_id=comp4.id,
            dataset_ref="steel",
            mass_kg=0.6,
            recycled_content_pct=0,
            biodiversity_score=0.8,
            overrides_json="{}"
        )
        session.add_all([mat1, mat2, mat3, mat4, mat5, mat6])
        
        # Lägg till processer - Realistisk tillverkning
        proc1 = ProcessItem(
            component_id=comp1.id,
            dataset_ref="process_metal_forming",
            energy_kwh=8,
            parameters_json="{}"
        )
        proc2 = ProcessItem(
            component_id=comp2.id,
            dataset_ref="process_foam_molding",
            energy_kwh=3,
            parameters_json="{}"
        )
        proc3 = ProcessItem(
            component_id=comp2.id,
            dataset_ref="process_sewing",
            energy_kwh=1.5,
            parameters_json="{}"
        )
        session.add_all([proc1, proc2, proc3])
        
        # Lägg till transport - Typiskt för SME (Asien → Sverige)
        trans1 = TransportItem(
            component_id=comp1.id,
            mode="sea",
            distance_km=18000,
            origin_iso="CN",
            dest_iso="SE",
            dataset_ref="sea_freight"
        )
        trans2 = TransportItem(
            component_id=comp1.id,
            mode="road",
            distance_km=450,
            origin_iso="SE",
            dest_iso="SE",
            dataset_ref="road_eu"
        )
        session.add_all([trans1, trans2])
        
        # Lägg till datasets
        datasets = [
            Dataset(name="Aluminium Primary", source="Ecoinvent", version="v1", scope="cradle-to-gate", metadata_json="{}"),
            Dataset(name="Steel", source="Ecoinvent", version="v1", scope="cradle-to-gate", metadata_json="{}"),
            Dataset(name="PCB", source="Ecoinvent", version="v1", scope="cradle-to-gate", metadata_json="{}"),
            Dataset(name="Casting Al", source="Ecoinvent", version="v1", scope="gate-to-gate", metadata_json="{}"),
            Dataset(name="Assembly", source="Ecoinvent", version="v1", scope="gate-to-gate", metadata_json="{}"),
            Dataset(name="Sea Freight", source="Ecoinvent", version="v1", scope="gate-to-gate", metadata_json="{}"),
            Dataset(name="Road EU", source="Ecoinvent", version="v1", scope="gate-to-gate", metadata_json="{}")
        ]
        session.add_all(datasets)
        
        session.commit()
        print("✅ Database seeded successfully!")

if __name__ == "__main__":
    seed_database()


"""
Script to initialize default categories in the database.
Run this after the database is created.
"""
from app.database import SessionLocal, init_db
from app.models.categoria import Categoria


def init_categories():
    """Create default categories if they don't exist"""
    # First, initialize the database tables
    print("Initializing database tables...")
    init_db()
    print("[OK] Database tables created")

    db = SessionLocal()

    default_categories = [
        {"nombre": "Comida", "icono": "🍔", "color": "#10B981"},
        {"nombre": "Transporte", "icono": "🚗", "color": "#3B82F6"},
        {"nombre": "Servicios", "icono": "💡", "color": "#F59E0B"},
        {"nombre": "Compras", "icono": "🛍️", "color": "#8B5CF6"},
        {"nombre": "Entretenimiento", "icono": "🎬", "color": "#EC4899"},
        {"nombre": "Salud", "icono": "⚕️", "color": "#EF4444"},
        {"nombre": "Otros", "icono": "📦", "color": "#6B7280"},
    ]

    try:
        # Check if categories already exist
        existing_count = db.query(Categoria).count()

        if existing_count == 0:
            print("Creating default categories...")
            for cat_data in default_categories:
                categoria = Categoria(**cat_data)
                db.add(categoria)

            db.commit()
            print(f"[OK] Created {len(default_categories)} default categories")
        else:
            print(f"Categories already exist ({existing_count} found). Skipping initialization.")

    except Exception as e:
        print(f"Error initializing categories: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_categories()

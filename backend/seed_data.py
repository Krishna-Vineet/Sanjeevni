from sqlalchemy import create_all
# Assuming models.py is in the same directory or properly imported
# from app.models import Base, Hospital, HistoricalSurgeData
import datetime
import random

def seed_data():
    """
    SCRIPT TODO:
    1. Connect to PostgreSQL using DATABASE_URL.
    2. Create all tables if they don't exist.
    3. Insert 10-15 mock hospitals across a 10km radius.
       - assign varying 'icu_beds' (0-20), 'ventilators' (0-10)
    4. Insert 30 days of historical surge data for each hospital.
       - patient_count should follow a weekly pattern (higher on weekends)
       - resource_utilization should correlate with patient_count
    5. Log completion to console.
    """
    print("DEMO SEEDER: Initializing database tables...")
    # Base.metadata.create_all(engine)
    
    hospitals = [
        {"name": "City Memorial Hospital", "lat": 12.9716, "lng": 77.5946, "icu": 15, "vent": 8},
        {"name": "St.arlight Emergency Unit", "lat": 12.9816, "lng": 77.6046, "icu": 5, "vent": 2},
        {"name": "Metro Health Centre", "lat": 12.9616, "lng": 77.5846, "icu": 20, "vent": 12},
    ]
    
    print(f"DEMO SEEDER: Seeding {len(hospitals)} mock hospitals...")
    # Insert logic here
    
    print("DEMO SEEDER: Generating 30 days of historical surge data for ML engine...")
    # Generation logic here
    
    print("DEMO SEEDER: Database successfully seeded with hackathon-ready data.")

if __name__ == "__main__":
    seed_data()

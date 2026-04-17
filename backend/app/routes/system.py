"""
System / Utility APIs — Location-based search and dev tools.
Endpoints:
  GET  /api/hospitals/nearby  — Fetch hospitals by location
  POST /api/dev/seed          — Populate mock data (dev only)
"""

import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Hospital, HistoricalSurgeData
from ..schemas import NearbyHospitalsResponse, NearbyHospitalEntry

router = APIRouter(tags=["System"])


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


@router.get("/api/hospitals/nearby", response_model=NearbyHospitalsResponse)
def get_nearby_hospitals(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    db: Session = Depends(get_db),
):
    """Fetch hospitals sorted by distance from given location."""
    hospitals = db.query(Hospital).all()

    results = []
    for h in hospitals:
        dist = _haversine(lat, lng, h.location_lat or 0, h.location_lng or 0)
        results.append(NearbyHospitalEntry(id=h.hospital_id, distance_km=dist))

    results.sort(key=lambda x: x.distance_km)
    return NearbyHospitalsResponse(hospitals=results)


@router.post("/api/dev/seed")
def seed_data(db: Session = Depends(get_db)):
    """Populate mock hospitals and data (dev only)."""
    import random
    from datetime import datetime, timedelta

    # Check if already seeded
    if db.query(Hospital).count() > 0:
        return {"status": "skipped", "message": "Data already seeded"}

    mock_hospitals = [
        {"hospital_id": "H1", "name": "City Memorial Hospital",
         "lat": 28.6139, "lng": 77.2090, "spec": "Trauma",
         "icu": 15, "gen": 50, "oxy": 30, "vent": 8, "rating": 4.5},
        {"hospital_id": "H2", "name": "Metro Health Centre",
         "lat": 28.6280, "lng": 77.2195, "spec": "Cardiology",
         "icu": 20, "gen": 80, "oxy": 50, "vent": 12, "rating": 4.7},
        {"hospital_id": "H3", "name": "Sunrise General Hospital",
         "lat": 28.6050, "lng": 77.2250, "spec": "General",
         "icu": 10, "gen": 40, "oxy": 25, "vent": 5, "rating": 4.2},
        {"hospital_id": "H4", "name": "Apollo Emergency Unit",
         "lat": 28.6350, "lng": 77.1980, "spec": "Neurology",
         "icu": 25, "gen": 100, "oxy": 60, "vent": 15, "rating": 4.8},
        {"hospital_id": "H5", "name": "Green Valley Medical",
         "lat": 28.6200, "lng": 77.2350, "spec": "Pediatrics",
         "icu": 8, "gen": 30, "oxy": 20, "vent": 3, "rating": 4.0},
        {"hospital_id": "H6", "name": "National Trauma Centre",
         "lat": 28.6100, "lng": 77.1900, "spec": "Trauma",
         "icu": 30, "gen": 120, "oxy": 80, "vent": 20, "rating": 4.9},
        {"hospital_id": "H7", "name": "Lifeline Hospital",
         "lat": 28.6450, "lng": 77.2100, "spec": "Cardiology",
         "icu": 12, "gen": 45, "oxy": 35, "vent": 6, "rating": 4.3},
        {"hospital_id": "H8", "name": "Care Plus Clinic",
         "lat": 28.5950, "lng": 77.2150, "spec": "General",
         "icu": 5, "gen": 20, "oxy": 15, "vent": 2, "rating": 3.8},
        {"hospital_id": "H9", "name": "Fortis Emergency Wing",
         "lat": 28.6300, "lng": 77.2400, "spec": "Orthopedics",
         "icu": 18, "gen": 60, "oxy": 40, "vent": 10, "rating": 4.6},
        {"hospital_id": "H10", "name": "Medanta Satellite Unit",
         "lat": 28.6000, "lng": 77.2000, "spec": "Oncology",
         "icu": 22, "gen": 70, "oxy": 45, "vent": 14, "rating": 4.4},
    ]

    for h in mock_hospitals:
        hospital = Hospital(
            hospital_id=h["hospital_id"],
            name=h["name"],
            location_lat=h["lat"],
            location_lng=h["lng"],
            specialization=h["spec"],
            icu_beds=h["icu"],
            general_beds=h["gen"],
            oxygen_units=h["oxy"],
            ventilators=h["vent"],
            rating=h["rating"],
            auto_accept_enabled=False,
        )
        db.add(hospital)

    db.flush()

    # Generate 30 days of historical surge data per hospital
    all_hospitals = db.query(Hospital).all()
    now = datetime.utcnow()
    for hosp in all_hospitals:
        for day_offset in range(30):
            dt = now - timedelta(days=day_offset)
            weekday = dt.weekday()
            base = random.randint(20, 60)
            # Higher on weekends
            if weekday >= 5:
                base = int(base * 1.4)
            utilization = round(min(base / max(hosp.icu_beds + hosp.general_beds, 1), 1.0), 2)

            surge = HistoricalSurgeData(
                hospital_id=hosp.id,
                date=dt,
                patient_count=base,
                resource_utilization=utilization,
            )
            db.add(surge)

    db.commit()
    return {"status": "seeded", "message": f"Seeded {len(mock_hospitals)} hospitals with 30 days of surge data"}

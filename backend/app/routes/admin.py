"""
Admin APIs — System monitoring and overview.
Endpoints:
  GET /api/admin/transfers  — All transfers overview
  GET /api/admin/hospitals  — Hospital stats and health
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Hospital, TransferRequest
from ..schemas import (
    AdminTransfersResponse, AdminTransferEntry,
    AdminHospitalsResponse, AdminHospitalEntry,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/transfers", response_model=AdminTransfersResponse)
def get_all_transfers(db: Session = Depends(get_db)):
    """Admin overview of all transfer requests."""
    transfers = db.query(TransferRequest).order_by(TransferRequest.created_at.desc()).all()

    entries = []
    for t in transfers:
        assigned = None
        if t.assigned_hospital_id:
            h = db.query(Hospital).filter(Hospital.id == t.assigned_hospital_id).first()
            assigned = h.hospital_id if h else None

        entries.append(AdminTransferEntry(
            request_id=t.request_id,
            status=t.status,
            assigned_hospital=assigned,
        ))

    return AdminTransfersResponse(transfers=entries)


@router.get("/hospitals", response_model=AdminHospitalsResponse)
def get_hospital_stats(db: Session = Depends(get_db)):
    """View system health — all hospitals with capacity and load factor."""
    hospitals = db.query(Hospital).all()

    entries = []
    for h in hospitals:
        # Load factor: ratio of assigned active transfers to total ICU capacity
        active_count = db.query(TransferRequest).filter(
            TransferRequest.assigned_hospital_id == h.id,
            TransferRequest.status.in_(["confirmed", "broadcasted"]),
        ).count()

        total_capacity = max((h.icu_beds or 0) + (h.general_beds or 0), 1)
        load_factor = round(active_count / total_capacity, 2)

        entries.append(AdminHospitalEntry(
            id=h.hospital_id,
            icu_beds=h.icu_beds or 0,
            load_factor=load_factor,
        ))

    return AdminHospitalsResponse(hospitals=entries)

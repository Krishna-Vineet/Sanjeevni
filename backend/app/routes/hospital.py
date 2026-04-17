"""
Hospital Response APIs — Hospitals interact with transfer requests.

Endpoints:
  POST /api/hospital/respond                  — Accept/reject a transfer
  GET  /api/hospital/{hospital_id}/requests    — View incoming requests
  PUT  /api/hospital/{hospital_id}/capacity    — Update beds/resources
  PUT  /api/hospital/{hospital_id}/settings    — Configure auto-accept rules
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Hospital, TransferRequest, TransferResponse
from ..schemas import (
    HospitalRespondRequest, HospitalRespondResponse,
    IncomingRequestsResponse, IncomingRequest,
    UpdateCapacityRequest, UpdateCapacityResponse,
    UpdateSettingsRequest, UpdateSettingsResponse,
)

router = APIRouter(prefix="/api/hospital", tags=["Hospital"])


# ─────────────────────────────────────────────────
# 2.1  Accept / Reject Transfer
# ─────────────────────────────────────────────────
@router.post("/respond", response_model=HospitalRespondResponse)
def respond_to_transfer(body: HospitalRespondRequest, db: Session = Depends(get_db)):
    """Hospital responds to a transfer request."""

    # Validate hospital
    hospital = db.query(Hospital).filter(Hospital.hospital_id == body.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail=f"Hospital '{body.hospital_id}' not found")

    # Validate transfer request
    transfer = db.query(TransferRequest).filter(TransferRequest.request_id == body.request_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail=f"Transfer request '{body.request_id}' not found")

    # Check if hospital was broadcasted to
    broadcasted = transfer.broadcasted_hospitals or []
    if body.hospital_id not in broadcasted:
        raise HTTPException(status_code=400, detail="This hospital was not included in the broadcast")

    # Check for duplicate response
    existing = db.query(TransferResponse).filter(
        TransferResponse.request_id == transfer.id,
        TransferResponse.hospital_id == body.hospital_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Hospital has already responded to this request")

    # Validate response value
    if body.response not in ("accept", "reject"):
        raise HTTPException(status_code=400, detail="Response must be 'accept' or 'reject'")

    # Record response
    resp = TransferResponse(
        request_id=transfer.id,
        hospital_id=body.hospital_id,
        action=body.response,
        is_auto=False,
    )
    db.add(resp)
    db.commit()

    return HospitalRespondResponse(
        status="recorded",
        message="Response submitted",
    )


# ─────────────────────────────────────────────────
# 2.2  Get Incoming Requests
# ─────────────────────────────────────────────────
@router.get("/{hospital_id}/requests", response_model=IncomingRequestsResponse)
def get_incoming_requests(hospital_id: str, db: Session = Depends(get_db)):
    """Hospital sees pending transfer requests sent to it."""

    hospital = db.query(Hospital).filter(Hospital.hospital_id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail=f"Hospital '{hospital_id}' not found")

    # Find all broadcasted requests where this hospital is included and hasn't responded
    all_transfers = db.query(TransferRequest).filter(
        TransferRequest.status.in_(["broadcasted", "created"])
    ).all()

    incoming = []
    for t in all_transfers:
        broadcasted = t.broadcasted_hospitals or []
        if hospital_id in broadcasted:
            # Check if already responded
            existing_resp = db.query(TransferResponse).filter(
                TransferResponse.request_id == t.id,
                TransferResponse.hospital_id == hospital_id,
            ).first()
            if not existing_resp:
                incoming.append(IncomingRequest(
                    request_id=t.request_id,
                    severity=t.severity,
                    required_resources=t.required_resources or [],
                ))

    return IncomingRequestsResponse(requests=incoming)


# ─────────────────────────────────────────────────
# 2.3  Update Hospital Capacity
# ─────────────────────────────────────────────────
@router.put("/{hospital_id}/capacity", response_model=UpdateCapacityResponse)
def update_capacity(hospital_id: str, body: UpdateCapacityRequest, db: Session = Depends(get_db)):
    """Update hospital bed counts and resources."""

    hospital = db.query(Hospital).filter(Hospital.hospital_id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail=f"Hospital '{hospital_id}' not found")

    hospital.icu_beds = body.icu_beds
    hospital.general_beds = body.general_beds
    hospital.oxygen_units = body.oxygen_units
    hospital.ventilators = body.ventilators
    db.commit()

    return UpdateCapacityResponse(status="updated")


# ─────────────────────────────────────────────────
# 2.4  Update Auto-Accept Settings
# ─────────────────────────────────────────────────
@router.put("/{hospital_id}/settings", response_model=UpdateSettingsResponse)
def update_settings(hospital_id: str, body: UpdateSettingsRequest, db: Session = Depends(get_db)):
    """Configure auto acceptance rules for a hospital."""

    hospital = db.query(Hospital).filter(Hospital.hospital_id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail=f"Hospital '{hospital_id}' not found")

    hospital.auto_accept_enabled = body.auto_accept_enabled
    if body.conditions:
        hospital.auto_accept_conditions = body.conditions.model_dump()
    else:
        hospital.auto_accept_conditions = None
    db.commit()

    return UpdateSettingsResponse(status="updated")

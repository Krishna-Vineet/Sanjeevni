"""
Transfer APIs — Core system for patient transfer lifecycle.

Endpoints:
  POST /api/transfer/create       — Create transfer request
  GET  /api/transfer/match/{id}   — Match hospitals for a request
  POST /api/transfer/broadcast    — Broadcast to top N hospitals
  GET  /api/transfer/{id}         — Get transfer status
  POST /api/transfer/finalize     — Finalize hospital assignment
"""

import uuid
import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Hospital, TransferRequest, TransferResponse
from ..schemas import (
    CreateTransferRequest, CreateTransferResponse,
    MatchResponse, RankedHospital,
    BroadcastRequest, BroadcastResponse,
    TransferStatusResponse, TransferResponseEntry,
    FinalizeRequest, FinalizeResponse,
)

router = APIRouter(prefix="/api/transfer", tags=["Transfer"])


def _generate_request_id() -> str:
    return f"REQ{uuid.uuid4().hex[:8].upper()}"


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points in km."""
    R = 6371  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def _compute_match_score(hospital: Hospital, request: TransferRequest, distance_km: float) -> float:
    """
    Scoring engine:
      score = 0.4 * specialization_match
            + 0.3 * proximity_score (inverse distance, capped)
            + 0.2 * normalized_rating
            + 0.1 * resource_availability
    """
    # Specialization match
    required = [r.lower() for r in (request.required_resources or [])]
    hospital_resources = []
    if hospital.icu_beds and hospital.icu_beds > 0:
        hospital_resources.append("icu")
    if hospital.ventilators and hospital.ventilators > 0:
        hospital_resources.append("ventilator")
    if hospital.oxygen_units and hospital.oxygen_units > 0:
        hospital_resources.append("oxygen")
    if hospital.general_beds and hospital.general_beds > 0:
        hospital_resources.append("general")

    resource_match = sum(1 for r in required if r in hospital_resources)
    spec_score = resource_match / max(len(required), 1)

    # Proximity score (closer = better, max at 1km, min at 50km+)
    proximity_score = max(0, 1 - (distance_km / 50))

    # Rating score (normalized 0-1, assuming max 5.0)
    rating_score = (hospital.rating or 4.0) / 5.0

    # Resource availability (how many of required resources are available)
    avail_score = spec_score  # reuse specialization match for simplicity

    score = (0.4 * spec_score +
             0.3 * proximity_score +
             0.2 * rating_score +
             0.1 * avail_score)

    return round(score, 2)


# ─────────────────────────────────────────────────
# 1.1  Create Transfer Request
# ─────────────────────────────────────────────────
@router.post("/create", response_model=CreateTransferResponse)
def create_transfer(body: CreateTransferRequest, db: Session = Depends(get_db)):
    """Doctor creates a patient transfer request when hospital cannot admit."""

    # Resolve origin hospital
    origin = db.query(Hospital).filter(Hospital.hospital_id == body.origin_hospital_id).first()
    if not origin:
        raise HTTPException(status_code=404, detail=f"Origin hospital '{body.origin_hospital_id}' not found")

    req_id = _generate_request_id()

    transfer = TransferRequest(
        request_id=req_id,
        origin_hospital_id=origin.id,
        patient_name=body.patient_name,
        severity=body.severity,
        condition=body.condition,
        required_resources=body.required_resources,
        notes=body.notes,
        location_lat=body.location.lat if body.location else origin.location_lat,
        location_lng=body.location.lng if body.location else origin.location_lng,
        status="created",
    )
    db.add(transfer)
    db.commit()
    db.refresh(transfer)

    return CreateTransferResponse(
        request_id=req_id,
        status="created",
        message="Transfer request created successfully",
    )


# ─────────────────────────────────────────────────
# 1.2  Match Hospitals
# ─────────────────────────────────────────────────
@router.get("/match/{request_id}", response_model=MatchResponse)
def match_hospitals(request_id: str, db: Session = Depends(get_db)):
    """Find and rank hospitals for a given transfer request."""

    transfer = db.query(TransferRequest).filter(TransferRequest.request_id == request_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer request not found")

    # Get all hospitals except origin
    hospitals = db.query(Hospital).filter(Hospital.id != transfer.origin_hospital_id).all()

    req_lat = transfer.location_lat or 0
    req_lng = transfer.location_lng or 0

    ranked = []
    for h in hospitals:
        dist = _haversine(req_lat, req_lng, h.location_lat or 0, h.location_lng or 0)
        score = _compute_match_score(h, transfer, dist)

        # Build available resources list
        avail = []
        if h.icu_beds and h.icu_beds > 0:
            avail.append("ICU")
        if h.ventilators and h.ventilators > 0:
            avail.append("VENTILATOR")
        if h.oxygen_units and h.oxygen_units > 0:
            avail.append("OXYGEN")
        if h.general_beds and h.general_beds > 0:
            avail.append("GENERAL")

        required = [r.upper() for r in (transfer.required_resources or [])]
        spec_match = all(r in avail for r in required)

        # ETA estimation: assume avg 25 km/h in city traffic
        eta = round(dist / 25 * 60, 1)

        ranked.append(RankedHospital(
            hospital_id=h.hospital_id,
            name=h.name,
            score=score,
            distance_km=round(dist, 2),
            eta_minutes=eta,
            specialization_match=spec_match,
            available_resources=avail,
        ))

    # Sort by score descending
    ranked.sort(key=lambda x: x.score, reverse=True)

    return MatchResponse(request_id=request_id, ranked_hospitals=ranked)


# ─────────────────────────────────────────────────
# 1.3  Broadcast Transfer Request (Code Red)
# ─────────────────────────────────────────────────
@router.post("/broadcast", response_model=BroadcastResponse)
def broadcast_transfer(body: BroadcastRequest, db: Session = Depends(get_db)):
    """Send transfer request to top N hospitals."""

    transfer = db.query(TransferRequest).filter(TransferRequest.request_id == body.request_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer request not found")

    # Validate that all hospital_ids exist
    for hid in body.hospital_ids:
        h = db.query(Hospital).filter(Hospital.hospital_id == hid).first()
        if not h:
            raise HTTPException(status_code=404, detail=f"Hospital '{hid}' not found")

    # Update transfer status and record broadcasted hospitals
    transfer.status = "broadcasted"
    transfer.broadcasted_hospitals = body.hospital_ids
    db.commit()

    # Check for auto-accept hospitals
    for hid in body.hospital_ids:
        h = db.query(Hospital).filter(Hospital.hospital_id == hid).first()
        if h and h.auto_accept_enabled:
            conditions = h.auto_accept_conditions or {}
            severity_match = conditions.get("severity") is None or conditions.get("severity") == transfer.severity
            resource_match = True
            if conditions.get("required_resources"):
                cond_res = [r.upper() for r in conditions["required_resources"]]
                req_res = [r.upper() for r in (transfer.required_resources or [])]
                resource_match = any(r in cond_res for r in req_res)

            if severity_match and resource_match:
                # Auto-accept: create response
                auto_resp = TransferResponse(
                    request_id=transfer.id,
                    hospital_id=hid,
                    action="accept",
                    is_auto=True,
                )
                db.add(auto_resp)
                db.commit()

    return BroadcastResponse(
        status="broadcasted",
        message="Request sent to hospitals",
    )


# ─────────────────────────────────────────────────
# 1.4  Get Transfer Status
# ─────────────────────────────────────────────────
@router.get("/{request_id}", response_model=TransferStatusResponse)
def get_transfer_status(request_id: str, db: Session = Depends(get_db)):
    """Track transfer request progress."""

    transfer = db.query(TransferRequest).filter(TransferRequest.request_id == request_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer request not found")

    responses = []
    for r in transfer.responses:
        responses.append(TransferResponseEntry(
            hospital_id=r.hospital_id,
            response=r.action,
        ))

    assigned = None
    if transfer.assigned_hospital_id:
        assigned_h = db.query(Hospital).filter(Hospital.id == transfer.assigned_hospital_id).first()
        assigned = assigned_h.hospital_id if assigned_h else None

    return TransferStatusResponse(
        request_id=transfer.request_id,
        status=transfer.status,
        assigned_hospital=assigned,
        responses=responses,
    )


# ─────────────────────────────────────────────────
# 1.5  Finalize Assignment
# ─────────────────────────────────────────────────
@router.post("/finalize", response_model=FinalizeResponse)
def finalize_assignment(body: FinalizeRequest, db: Session = Depends(get_db)):
    """Select best hospital when multiple accept."""

    transfer = db.query(TransferRequest).filter(TransferRequest.request_id == body.request_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer request not found")

    # Get all "accept" responses
    accepts = [r for r in transfer.responses if r.action == "accept"]
    if not accepts:
        raise HTTPException(status_code=400, detail="No hospitals have accepted this request yet")

    # Multi-accept scoring: pick the best hospital based on distance + rating
    req_lat = transfer.location_lat or 0
    req_lng = transfer.location_lng or 0

    best_hospital = None
    best_score = -1
    best_eta = 0

    for resp in accepts:
        h = db.query(Hospital).filter(Hospital.hospital_id == resp.hospital_id).first()
        if not h:
            continue

        dist = _haversine(req_lat, req_lng, h.location_lat or 0, h.location_lng or 0)
        score = _compute_match_score(h, transfer, dist)
        eta = round(dist / 25 * 60, 1)

        if score > best_score:
            best_score = score
            best_hospital = h
            best_eta = eta

    if not best_hospital:
        raise HTTPException(status_code=400, detail="Could not determine best hospital")

    # Assign
    transfer.assigned_hospital_id = best_hospital.id
    transfer.status = "confirmed"
    db.commit()

    return FinalizeResponse(
        assigned_hospital_id=best_hospital.hospital_id,
        eta=best_eta,
        message="Hospital assigned successfully",
    )

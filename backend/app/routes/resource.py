"""
Resource Exchange APIs — Inter-hospital resource sharing.

Endpoints:
  POST /api/resource/request   — Create resource request
  POST /api/resource/respond   — Respond to resource request
  GET  /api/resource/all       — View all resource requests
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Hospital, ResourceRequest
from ..schemas import (
    CreateResourceRequest, CreateResourceResponse,
    RespondResourceRequest, RespondResourceResponse,
    AllResourceRequestsResponse, ResourceRequestEntry,
)

router = APIRouter(prefix="/api/resource", tags=["Resource Exchange"])


def _generate_resource_request_id() -> str:
    return f"RR{uuid.uuid4().hex[:6].upper()}"


# ─────────────────────────────────────────────────
# 3.1  Create Resource Request
# ─────────────────────────────────────────────────
@router.post("/request", response_model=CreateResourceResponse)
def create_resource_request(body: CreateResourceRequest, db: Session = Depends(get_db)):
    """Hospital requests resources from the network."""

    hospital = db.query(Hospital).filter(Hospital.hospital_id == body.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail=f"Hospital '{body.hospital_id}' not found")

    rr_id = _generate_resource_request_id()

    resource_req = ResourceRequest(
        resource_request_id=rr_id,
        requesting_hospital_id=body.hospital_id,
        resource_type=body.resource_type,
        quantity=body.quantity,
        status="pending",
    )
    db.add(resource_req)
    db.commit()

    return CreateResourceResponse(
        resource_request_id=rr_id,
        status="created",
    )


# ─────────────────────────────────────────────────
# 3.2  Respond to Resource Request
# ─────────────────────────────────────────────────
@router.post("/respond", response_model=RespondResourceResponse)
def respond_to_resource_request(body: RespondResourceRequest, db: Session = Depends(get_db)):
    """Another hospital fulfills or rejects a resource request."""

    resource_req = db.query(ResourceRequest).filter(
        ResourceRequest.resource_request_id == body.resource_request_id
    ).first()
    if not resource_req:
        raise HTTPException(status_code=404, detail=f"Resource request '{body.resource_request_id}' not found")

    hospital = db.query(Hospital).filter(Hospital.hospital_id == body.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail=f"Hospital '{body.hospital_id}' not found")

    if resource_req.status != "pending":
        raise HTTPException(status_code=400, detail="Resource request is no longer pending")

    if body.response == "accept":
        resource_req.status = "accepted"
        resource_req.fulfilled_by = body.hospital_id
    elif body.response == "reject":
        # Just log — don't change status unless it's the last hospital
        pass
    else:
        raise HTTPException(status_code=400, detail="Response must be 'accept' or 'reject'")

    db.commit()

    return RespondResourceResponse(status=resource_req.status)


# ─────────────────────────────────────────────────
# 3.3  Get All Resource Requests
# ─────────────────────────────────────────────────
@router.get("/all", response_model=AllResourceRequestsResponse)
def get_all_resource_requests(db: Session = Depends(get_db)):
    """View all resource requests in the network."""

    all_reqs = db.query(ResourceRequest).order_by(ResourceRequest.created_at.desc()).all()

    entries = [
        ResourceRequestEntry(
            id=r.resource_request_id,
            resource_type=r.resource_type,
            quantity=r.quantity,
            status=r.status,
        )
        for r in all_reqs
    ]

    return AllResourceRequestsResponse(requests=entries)

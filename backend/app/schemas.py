"""
Pydantic schemas for the Sanjeevni API.
Defines request/response models for all API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ────────────────────────────────────────────────────────
# 1. TRANSFER SCHEMAS
# ────────────────────────────────────────────────────────

class LocationSchema(BaseModel):
    lat: float
    lng: float


class CreateTransferRequest(BaseModel):
    origin_hospital_id: str
    patient_name: Optional[str] = None
    severity: str = Field(..., description="critical | moderate | stable")
    condition: str = Field(..., description="Description of patient condition")
    required_resources: List[str] = Field(..., description="e.g. ['ICU', 'VENTILATOR']")
    notes: Optional[str] = None
    location: Optional[LocationSchema] = None


class CreateTransferResponse(BaseModel):
    request_id: str
    status: str
    message: str


class RankedHospital(BaseModel):
    hospital_id: str
    name: str
    score: float
    distance_km: float
    eta_minutes: float
    specialization_match: bool
    available_resources: List[str]


class MatchResponse(BaseModel):
    request_id: str
    ranked_hospitals: List[RankedHospital]


class BroadcastRequest(BaseModel):
    request_id: str
    hospital_ids: List[str]


class BroadcastResponse(BaseModel):
    status: str
    message: str


class TransferResponseEntry(BaseModel):
    hospital_id: str
    response: str


class TransferStatusResponse(BaseModel):
    request_id: str
    status: str
    assigned_hospital: Optional[str] = None
    responses: List[TransferResponseEntry]


class FinalizeRequest(BaseModel):
    request_id: str


class FinalizeResponse(BaseModel):
    assigned_hospital_id: str
    eta: float
    message: str


# ────────────────────────────────────────────────────────
# 2. HOSPITAL RESPONSE SCHEMAS
# ────────────────────────────────────────────────────────

class HospitalRespondRequest(BaseModel):
    request_id: str
    hospital_id: str
    response: str = Field(..., description="accept | reject")


class HospitalRespondResponse(BaseModel):
    status: str
    message: str


class IncomingRequest(BaseModel):
    request_id: str
    severity: str
    required_resources: List[str]


class IncomingRequestsResponse(BaseModel):
    requests: List[IncomingRequest]


class UpdateCapacityRequest(BaseModel):
    icu_beds: int
    general_beds: int
    oxygen_units: int
    ventilators: int


class UpdateCapacityResponse(BaseModel):
    status: str


class AutoAcceptConditions(BaseModel):
    severity: Optional[str] = None
    required_resources: Optional[List[str]] = None


class UpdateSettingsRequest(BaseModel):
    auto_accept_enabled: bool
    conditions: Optional[AutoAcceptConditions] = None


class UpdateSettingsResponse(BaseModel):
    status: str


# ────────────────────────────────────────────────────────
# 3. RESOURCE EXCHANGE SCHEMAS
# ────────────────────────────────────────────────────────

class CreateResourceRequest(BaseModel):
    hospital_id: str
    resource_type: str
    quantity: int


class CreateResourceResponse(BaseModel):
    resource_request_id: str
    status: str


class RespondResourceRequest(BaseModel):
    resource_request_id: str
    hospital_id: str
    response: str = Field(..., description="accept | reject")


class RespondResourceResponse(BaseModel):
    status: str


class ResourceRequestEntry(BaseModel):
    id: str
    resource_type: str
    quantity: int
    status: str


class AllResourceRequestsResponse(BaseModel):
    requests: List[ResourceRequestEntry]


# ────────────────────────────────────────────────────────
# 4. AI SMART DOCTOR SCHEMAS
# ────────────────────────────────────────────────────────

class SmartDoctorRequest(BaseModel):
    symptoms: str
    vitals: str
    notes: Optional[str] = None


class SmartDoctorResponse(BaseModel):
    recommendation: str
    urgency: str


# ────────────────────────────────────────────────────────
# 5. ADMIN SCHEMAS
# ────────────────────────────────────────────────────────

class AdminTransferEntry(BaseModel):
    request_id: str
    status: str
    assigned_hospital: Optional[str] = None


class AdminTransfersResponse(BaseModel):
    transfers: List[AdminTransferEntry]


class AdminHospitalEntry(BaseModel):
    id: str
    icu_beds: int
    load_factor: float


class AdminHospitalsResponse(BaseModel):
    hospitals: List[AdminHospitalEntry]


# ────────────────────────────────────────────────────────
# 6. SYSTEM / UTILITY SCHEMAS
# ────────────────────────────────────────────────────────

class NearbyHospitalEntry(BaseModel):
    id: str
    distance_km: float


class NearbyHospitalsResponse(BaseModel):
    hospitals: List[NearbyHospitalEntry]

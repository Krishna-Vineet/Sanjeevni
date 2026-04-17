"""
SQLAlchemy ORM models for the Sanjeevni Hospital Network OS.
Covers hospitals, transfer requests, responses, resources, and surge data.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(String, unique=True, index=True)  # e.g. "H1", "H2"
    name = Column(String, unique=True, index=True)
    location_lat = Column(Float)
    location_lng = Column(Float)
    rating = Column(Float, default=4.0)
    specialization = Column(String)  # Cardiology, Trauma, General etc.

    # Capacity
    icu_beds = Column(Integer, default=0)
    general_beds = Column(Integer, default=0)
    oxygen_units = Column(Integer, default=0)
    ventilators = Column(Integer, default=0)

    # Settings
    auto_accept_enabled = Column(Boolean, default=False)
    auto_accept_conditions = Column(JSON, nullable=True)  # {"severity": "critical", "required_resources": ["ICU"]}

    # Relationships
    requests_sent = relationship(
        "TransferRequest",
        foreign_keys="TransferRequest.origin_hospital_id",
        back_populates="origin",
    )
    requests_received = relationship(
        "TransferRequest",
        foreign_keys="TransferRequest.assigned_hospital_id",
        back_populates="assigned",
    )


class TransferRequest(Base):
    __tablename__ = "transfer_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, index=True)  # e.g. "REQ123"
    origin_hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    patient_name = Column(String, nullable=True)
    severity = Column(String)  # critical, moderate, stable
    condition = Column(Text, nullable=True)
    required_resources = Column(JSON, default=[])  # ["ICU", "VENTILATOR"]
    notes = Column(Text, nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    status = Column(String, default="created")  # created, pending, broadcasted, confirmed, completed
    assigned_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    origin = relationship("Hospital", foreign_keys=[origin_hospital_id], back_populates="requests_sent")
    assigned = relationship("Hospital", foreign_keys=[assigned_hospital_id], back_populates="requests_received")
    responses = relationship("TransferResponse", back_populates="request")

    # Many-to-many for broadcasted hospitals
    broadcasted_hospitals = Column(JSON, default=[])  # list of hospital_ids that were broadcasted to


class TransferResponse(Base):
    __tablename__ = "transfer_responses"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("transfer_requests.id"))
    hospital_id = Column(String)  # hospital_id string like "H2"
    action = Column(String)  # accept, reject
    is_auto = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    request = relationship("TransferRequest", back_populates="responses")


class ResourceRequest(Base):
    __tablename__ = "resource_requests"

    id = Column(Integer, primary_key=True, index=True)
    resource_request_id = Column(String, unique=True, index=True)  # e.g. "RR1"
    requesting_hospital_id = Column(String)  # hospital_id string
    resource_type = Column(String)  # oxygen, blood, ventilator etc.
    quantity = Column(Integer)
    status = Column(String, default="pending")  # pending, accepted, fulfilled, closed
    fulfilled_by = Column(String, nullable=True)  # hospital_id that fulfilled
    created_at = Column(DateTime, default=datetime.utcnow)


class HistoricalSurgeData(Base):
    __tablename__ = "surge_data"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    date = Column(DateTime)
    patient_count = Column(Integer)
    resource_utilization = Column(Float)  # 0.0 to 1.0

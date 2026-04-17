"""
Authentication APIs — Hospital login and session management.

Endpoints:
  POST /api/auth/login    — Hospital login
  POST /api/auth/logout   — Hospital logout
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    hospital_id: str
    password: str


class LoginResponse(BaseModel):
    token: str
    hospital: dict
    message: str


class LogoutResponse(BaseModel):
    message: str


# Mock hospital data (in real app, this would come from database)
HOSPITALS = {
    "H1": {
        "id": "H1",
        "name": "Fortis Hospital Gurgaon",
        "icu_beds": 80,
        "general_beds": 320,
        "load_factor": 0.75,
        "location": {"lat": 28.4595, "lng": 77.0745}
    },
    "H2": {
        "id": "H2", 
        "name": "Medanta - The Medicity",
        "icu_beds": 200,
        "general_beds": 1400,
        "load_factor": 0.85,
        "location": {"lat": 28.4478, "lng": 77.0449}
    },
    "H3": {
        "id": "H3",
        "name": "Artemis Hospital", 
        "icu_beds": 120,
        "general_beds": 630,
        "load_factor": 0.70,
        "location": {"lat": 28.4328, "lng": 77.0910}
    },
    "H4": {
        "id": "H4",
        "name": "Max Super Speciality Hospital",
        "icu_beds": 25,
        "general_beds": 75,
        "load_factor": 0.65,
        "location": {"lat": 28.4700, "lng": 77.0870}
    },
    "H5": {
        "id": "H5",
        "name": "CK Birla Hospital",
        "icu_beds": 15,
        "general_beds": 55,
        "load_factor": 0.55,
        "location": {"lat": 28.4250, "lng": 77.0800}
    },
    "H6": {
        "id": "H6",
        "name": "Alchemist Hospital",
        "icu_beds": 10,
        "general_beds": 40,
        "load_factor": 0.45,
        "location": {"lat": 28.4600, "lng": 77.0600}
    }
}


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    """Authenticate hospital and return token."""
    
    # Simple authentication - accept any hospital_id with any password
    # In production, implement proper password validation
    hospital = HOSPITALS.get(credentials.hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    # Generate mock token
    token = f"mock-jwt-token-{credentials.hospital_id}-{hash(credentials.password)}"
    
    return LoginResponse(
        token=token,
        hospital=hospital,
        message="Login successful"
    )


@router.post("/logout", response_model=LogoutResponse)
def logout():
    """Logout hospital session."""
    return LogoutResponse(message="Logged out successfully")

"""
AI Smart Doctor API — Medical decision assistant.
Endpoint: POST /api/ai/smart-doctor
"""

from fastapi import APIRouter
from ..schemas import SmartDoctorRequest, SmartDoctorResponse
from ..ai import ai_assistant

router = APIRouter(prefix="/api/ai", tags=["AI Smart Doctor"])


@router.post("/smart-doctor", response_model=SmartDoctorResponse)
async def smart_doctor(body: SmartDoctorRequest):
    """Assist doctor with medical decision based on symptoms and vitals."""
    result = await ai_assistant.get_clinical_recommendation(
        symptoms=body.symptoms,
        vitals={"raw": body.vitals, "notes": body.notes or ""},
    )
    return SmartDoctorResponse(
        recommendation=result.get("recommendation", "Unable to generate recommendation."),
        urgency=result.get("urgency", "unknown"),
    )

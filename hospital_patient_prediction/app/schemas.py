from pydantic import BaseModel
from typing import List

class HospitalPredictionRequest(BaseModel):
    hosp_id: str

class ResourceInventory(BaseModel):
    doctors: int
    oxygen_cylinders: int
    masks: int
    ventilators: int
    paracetamol: int
    ppe_kits: int

class PredictionItem(BaseModel):
    date: str
    predicted_patients: int
    resources: ResourceInventory

class HospitalPredictionResponse(BaseModel):
    hosp_id: str
    prediction_start_date: str
    prediction_end_date: str
    predictions: List[PredictionItem]
    total_resources_needed: ResourceInventory
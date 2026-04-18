from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np
from datetime import timedelta
import math
from app.schemas import HospitalPredictionRequest, HospitalPredictionResponse, ResourceInventory, PredictionItem

app = FastAPI(title="Hospital Patient Forecasting API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = joblib.load('models/rf_model.joblib')
    preprocessor = joblib.load('models/preprocessor.joblib')
except Exception as e:
    raise RuntimeError(f"Model loading failed: {e}")


def calculate_resources(patients: int) -> ResourceInventory:
    """Calculate required resources based on patient count"""
    return ResourceInventory(
        doctors=max(1, math.ceil(patients / 8)),
        oxygen_cylinders=math.ceil(patients * 0.4),
        masks=patients * 5,
        ventilators=math.ceil(patients * 0.05),
        paracetamol=patients * 12,
        ppe_kits=math.ceil(patients * 0.5)
    )


@app.post("/predict_next_7_days", response_model=HospitalPredictionResponse)
def predict_next_7_days(request: HospitalPredictionRequest):
    try:
        # Load data
        history_data = pd.read_csv(
            'data/processed/daily_aggregated_data.csv',
            parse_dates=['date']
        )

        # Validate hospital ID
        if request.hosp_id not in history_data['HOSP_ID'].unique():
            raise HTTPException(
                status_code=404,
                detail=f"Hospital ID {request.hosp_id} not found"
            )

        last_date = history_data['date'].max()
        hosp_history = history_data[history_data['HOSP_ID'] == request.hosp_id].sort_values('date')
        
        recent_patients = list(hosp_history['total_patients'].values[-14:])
        
        # Pre-calculate means
        avg_hum = hosp_history['avg_humidity'].mean()
        avg_tmp = hosp_history['avg_temp'].mean()
        avg_aqi = hosp_history['avg_aqi'].mean()
        avg_rnf = hosp_history['total_rainfall'].mean()
        avg_rev = hosp_history['total_revisit'].mean()

        prediction_list = []
        peak_patients = 0
        
        future_dates = [last_date + timedelta(days=i) for i in range(1, 8)]

        for f_date in future_dates:
            # Build state vector
            row = pd.DataFrame([{
                'HOSP_ID': request.hosp_id,
                'day_of_week': f_date.dayofweek,
                'month': f_date.month,
                'year': f_date.year,
                'is_weekend': int(f_date.dayofweek >= 5),
                'lag_1_patients': recent_patients[-1],
                'lag_7_patients': recent_patients[-7] if len(recent_patients) >= 7 else np.mean(recent_patients),
                'lag_14_patients': recent_patients[-14] if len(recent_patients) >= 14 else np.mean(recent_patients),
                'rolling_7_patients': np.mean(recent_patients[-7:]) if len(recent_patients) >= 7 else np.mean(recent_patients),
                'rolling_14_patients': np.mean(recent_patients[-14:]) if len(recent_patients) >= 14 else np.mean(recent_patients),
                'avg_humidity': avg_hum,
                'avg_temp': avg_tmp,
                'avg_aqi': avg_aqi,
                'total_rainfall': avg_rnf,
                'total_revisit': avg_rev,
                'is_holiday': 0
            }])
            
            row_transformed = preprocessor.transform(row)
            pred = model.predict(row_transformed)[0]
            
            pred = pred * 0.25 
            
            yesterday_patients = recent_patients[-1]
            max_allowed = yesterday_patients * 1.08 if yesterday_patients > 10 else 15
            
            if pred > max_allowed:
                pred = yesterday_patients + (yesterday_patients * 0.05) 
                
            patient_count = int(round(max(0, pred)))
            
            recent_patients.append(patient_count)
            
            if patient_count > peak_patients:
                peak_patients = patient_count
                
            prediction_list.append(
                PredictionItem(
                    date=f_date.strftime("%Y-%m-%d"),
                    predicted_patients=patient_count,
                    resources=calculate_resources(patient_count)
                )
            )

        return HospitalPredictionResponse(
            hosp_id=request.hosp_id,
            prediction_start_date=future_dates[0].strftime("%Y-%m-%d"),
            prediction_end_date=future_dates[-1].strftime("%Y-%m-%d"),
            predictions=prediction_list,
            total_resources_needed=calculate_resources(peak_patients)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Optional direct run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", reload=True, port=8001)
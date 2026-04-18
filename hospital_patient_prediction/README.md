# Hospital Patient Prediction & Resource Management

This project provides a Machine Learning model to predict hospital patient arrivals for the next 7 days and recommends resource/inventory requirements based on those predictions.

## Features
- **Data Preprocessing**: Aggregates hourly hospital data into daily summaries with lag and rolling features.
- **ML Model**: Uses a Random Forest Regressor to predict the total number of patients per day.
- **Resource Management**: Automatically calculates required resources (Doctors, Oxygen Cylinders, Masks, Ventilators, Paracetamol, PPE Kits) based on predicted patient counts.
- **FastAPI Endpoints**: A production-ready API to fetch 7-day forecasts.

## Project Structure
```text
hospital_patient_prediction/
├── app/
│   ├── main.py          # FastAPI application
│   └── schemas.py       # Pydantic models for request/response
├── data/
│   ├── raw/             # Raw hourly data (hospital_data.csv)
│   └── processed/       # Daily aggregated data
├── models/
│   ├── rf_model.joblib      # Trained Random Forest model
│   └── preprocessor.joblib  # Fitted preprocessing pipeline
├── src/
│   ├── data_preprocessing.py # Preprocessing logic
│   └── model_training.py      # Training script
└── requirements.txt     # Python dependencies
```

## Setup and Usage

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Prepare Data and Train Model
Run the preprocessing and training scripts:
```bash
python -m src.data_preprocessing
python -m src.model_training
```

### 3. Start the API
```bash
uvicorn app.main:app --reload
```

### 4. Test the Endpoint
Send a POST request to `http://127.0.0.1:8000/predict_next_7_days`:

**Request Body:**
```json
{
  "hosp_id": "MEDANTA01"
}
```

**Example Response:**
```json
{
  "hosp_id": "MEDANTA01",
  "prediction_start_date": "2024-01-01",
  "prediction_end_date": "2024-01-07",
  "predictions": [
    {
      "date": "2024-01-01",
      "predicted_patients": 45,
      "resources": {
        "doctors": 6,
        "oxygen_cylinders": 18,
        "masks": 225,
        "ventilators": 3,
        "paracetamol": 540,
        "ppe_kits": 23
      }
    },
    ...
  ],
  "total_resources_needed": {
    "doctors": 42,
    "oxygen_cylinders": 126,
    "masks": 1575,
    "ventilators": 16,
    "paracetamol": 3780,
    "ppe_kits": 158
  }
}
```

## Resource Calculation Logic
The resources are estimated using the following heuristics:
- **Doctors**: 1 per 8 patients
- **Oxygen Cylinders**: 0.4 per patient
- **Masks**: 5 per patient
- **ICU Ventilators**: 5% of patients
- **Paracetamol**: 12 tablets per patient
- **PPE Kits**: 0.5 per patient

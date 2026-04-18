import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

def load_raw_data(file_path):
    """Load raw hourly data"""
    df = pd.read_csv(file_path, parse_dates=['date'], dayfirst=True)
    return df

def aggregate_to_daily(df):
    """Aggregate hourly data to daily per hospital"""
    daily_df = df.groupby(['HOSP_ID', 'date']).agg(
        total_patients=('patients', 'sum'),
        avg_humidity=('humidity', 'mean'),
        avg_temp=('temperature', 'mean'),
        avg_aqi=('aqi', 'mean'),
        total_rainfall=('rainfall', 'sum'),
        total_revisit=('revisit', 'sum'),
        is_holiday=('holiday', 'max'),
        avg_lagged=('lagged', 'mean')
    ).reset_index()
    
    # Add time-based features
    daily_df['day_of_week'] = daily_df['date'].dt.dayofweek
    daily_df['month'] = daily_df['date'].dt.month
    daily_df['year'] = daily_df['date'].dt.year
    daily_df['is_weekend'] = (daily_df['day_of_week'] >= 5).astype(int)
    
    # Add lag features (1-day, 7-day, 14-day)
    for lag in [1,7,14]:
        daily_df[f'lag_{lag}_patients'] = daily_df.groupby('HOSP_ID')['total_patients'].shift(lag)
    
    # Add rolling averages (7-day, 14-day)
    for window in [7,14]:
        daily_df[f'rolling_{window}_patients'] = daily_df.groupby('HOSP_ID')['total_patients'].transform(
            lambda x: x.rolling(window=window, min_periods=1).mean()
        )
    
    # Drop rows with missing values from lag features
    daily_df = daily_df.dropna()
    return daily_df

def create_preprocessing_pipeline():
    """Create preprocessing pipeline for categorical and numerical features"""
    categorical_features = ['HOSP_ID']
    numerical_features = ['avg_humidity', 'avg_temp', 'avg_aqi', 'total_rainfall', 
                          'total_revisit', 'is_holiday', 
                          'day_of_week', 'month', 'year', 'is_weekend', 
                          'lag_1_patients', 'lag_7_patients', 'lag_14_patients',
                          'rolling_7_patients', 'rolling_14_patients']
    
    # Preprocessor steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', 'passthrough', numerical_features)
        ])
    
    return preprocessor

def main():
    # Load and process data
    raw_data_path = 'data/raw/hospital_data.csv'
    processed_data_path = 'data/processed/daily_aggregated_data.csv'
    
    df = load_raw_data(raw_data_path)
    daily_df = aggregate_to_daily(df)
    daily_df.to_csv(processed_data_path, index=False)
    print(f"Processed data saved to {processed_data_path}")
    
    # Save preprocessing pipeline
    preprocessor = create_preprocessing_pipeline()
    joblib.dump(preprocessor, 'models/preprocessor.joblib')
    print("Preprocessing pipeline saved to models/preprocessor.joblib")

if __name__ == "__main__":
    main()
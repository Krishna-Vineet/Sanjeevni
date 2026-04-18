import pandas as pd
import numpy as np
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from src.data_preprocessing import create_preprocessing_pipeline


def main():
    df = pd.read_csv("data/processed/daily_aggregated_data.csv", parse_dates=["date"])

    df = df.sort_values("date")
    train_size = int(0.8 * len(df))
    train_df = df.iloc[:train_size]
    test_df = df.iloc[train_size:]

    target = "total_patients"

    X_train = train_df.drop(columns=[target, "date"])
    y_train = train_df[target]
    X_test = test_df.drop(columns=[target, "date"])
    y_test = test_df[target]

    # 1) FIT preprocessor
    preprocessor = create_preprocessing_pipeline()
    X_train_t = preprocessor.fit_transform(X_train)   # <-- fit_transform
    X_test_t = preprocessor.transform(X_test)

    # 2) Train model
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=18,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_t, y_train)

    # 3) Evaluate
    preds = model.predict(X_test_t)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    print(f"MAE={mae:.3f}, RMSE={rmse:.3f}, R2={r2:.3f}")

    # 4) SAVE BOTH (fitted)
    joblib.dump(preprocessor, "models/preprocessor.joblib")
    joblib.dump(model, "models/rf_model.joblib")
    print("Saved fitted preprocessor and model")


if __name__ == "__main__":
    main()
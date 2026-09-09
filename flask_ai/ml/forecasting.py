from __future__ import annotations

import warnings
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from statsmodels.tsa.statespace.sarimax import SARIMAX


BASE_FEATURES = [
    "lag_1",
    "lag_7",
    "lag_14",
    "rolling_7",
    "rolling_14",
    "day_of_week",
    "is_weekend",
    "month",
    "day_of_month",
    "week_of_year",
    "available_workers_lag1",
    "provider_hours_lag1",
    "service_popularity_lag1",
    "booking_amount_lag1",
    "base_price_lag1",
    "completion_rate_lag1",
    "cancellation_rate_lag1",
]


def _make_training_frame(data: pd.DataFrame) -> pd.DataFrame:
    """Build leakage-safe lag/rolling/calendar features."""
    d = data.copy().sort_index()

    y = pd.to_numeric(d["request_count"], errors="coerce").fillna(0).astype(float)
    d["target"] = y

    for lag, src in [
        (1, "target"),
        (7, "target"),
        (14, "target"),
    ]:
        d[f"lag_{lag}"] = d[src].shift(lag)

    d["rolling_7"] = d["target"].shift(1).rolling(7, min_periods=3).mean()
    d["rolling_14"] = d["target"].shift(1).rolling(14, min_periods=5).mean()

    operational_map = {
        "available_workers": "available_workers_lag1",
        "provider_available_hours": "provider_hours_lag1",
        "service_popularity_index": "service_popularity_lag1",
        "booking_amount": "booking_amount_lag1",
        "base_price": "base_price_lag1",
        "completion_rate": "completion_rate_lag1",
        "cancellation_rate": "cancellation_rate_lag1",
    }
    for src, dst in operational_map.items():
        if src in d.columns:
            d[dst] = d[src].shift(1)
        else:
            d[dst] = np.nan

    # Demand pressure is a valuable operational signal.
    d["demand_per_worker_lag1"] = (
        d["target"].shift(1)
        / d["available_workers"].shift(1).clip(lower=1)
    )
    # Use pressure as a substitute feature only when enough history exists.
    BASE_WITH_PRESSURE = BASE_FEATURES + ["demand_per_worker_lag1"]

    for col in BASE_WITH_PRESSURE:
        if col in d.columns:
            d[col] = d[col].replace([np.inf, -np.inf], np.nan)

    d = d.dropna(subset=["target", "lag_14", "rolling_14"]).copy()

    return d, [c for c in BASE_WITH_PRESSURE if c in d.columns]


def _future_operational_values(history: pd.DataFrame) -> dict:
    """Estimate unknown future operational values from recent observed history."""
    context = {}
    for col in [
        "available_workers",
        "provider_available_hours",
        "service_popularity_index",
        "booking_amount",
        "base_price",
        "completion_rate",
        "cancellation_rate",
    ]:
        if col in history.columns:
            s = pd.to_numeric(history[col], errors="coerce").dropna()
            context[col] = float(s.tail(7).median()) if not s.empty else 0.0
    return context




def _recursive_rf_forecast(
    data: pd.DataFrame, steps: int = 7
) -> Tuple[pd.Series, float, list[str]]:
    train, feature_cols = _make_training_frame(data)

    if len(train) < 25:
        raise ValueError("Not enough history for feature-based forecasting")

    X = train[feature_cols].copy()
    y = train["target"].copy()
    X = X.replace([np.inf, -np.inf], np.nan).fillna(0)

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=8,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X, y)

    # A simple time-respecting holdout estimate for UI transparency.
    holdout = min(7, max(3, len(train) // 10))
    if len(train) > holdout + 15:
        val_X = train[feature_cols].iloc[-holdout:].replace(
            [np.inf, -np.inf], np.nan
        ).fillna(0)
        val_y = train["target"].iloc[-holdout:]
        val_pred = model.predict(val_X)
        mae = float(np.mean(np.abs(val_y.to_numpy() - val_pred)))
    else:
        mae = float("nan")

    history = data.copy().sort_index()
    preds = []

    for _ in range(steps):
        next_date = history.index.max() + pd.Timedelta(days=1)
        row = pd.DataFrame(index=[next_date])

        row["day_of_week"] = next_date.dayofweek
        row["is_weekend"] = int(next_date.dayofweek >= 5)
        row["month"] = next_date.month
        row["day_of_month"] = next_date.day
        row["week_of_year"] = int(next_date.isocalendar().week)

        y_hist = pd.to_numeric(history["request_count"], errors="coerce").fillna(0)

        row["lag_1"] = float(y_hist.iloc[-1])
        row["lag_7"] = float(y_hist.iloc[-7]) if len(y_hist) >= 7 else float(y_hist.iloc[-1])
        row["lag_14"] = float(y_hist.iloc[-14]) if len(y_hist) >= 14 else float(y_hist.iloc[-1])
        row["rolling_7"] = float(y_hist.tail(7).mean())
        row["rolling_14"] = float(y_hist.tail(14).mean())

        op = _future_operational_values(history)
        for src, dst in {
            "available_workers": "available_workers_lag1",
            "provider_available_hours": "provider_hours_lag1",
            "service_popularity_index": "service_popularity_lag1",
            "booking_amount": "booking_amount_lag1",
            "base_price": "base_price_lag1",
            "completion_rate": "completion_rate_lag1",
            "cancellation_rate": "cancellation_rate_lag1",
        }.items():
            row[dst] = op.get(src, 0.0)

        row["demand_per_worker_lag1"] = row["lag_1"] / max(
            row["available_workers_lag1"].iloc[0], 1
        )

        for col in feature_cols:
            if col not in row.columns:
                row[col] = 0.0

        X_next = row[feature_cols].replace(
            [np.inf, -np.inf], np.nan
        ).fillna(0)
        pred = max(0.0, float(model.predict(X_next)[0]))
        preds.append(pred)

        # Append predicted target and carry forward operational proxies.
        new_row = pd.DataFrame(
            {
                "request_count": [pred],
                "available_workers": [op.get("available_workers", 1.0)],
                "provider_available_hours": [op.get("provider_available_hours", 8.0)],
                "service_popularity_index": [op.get("service_popularity_index", 100.0)],
                "booking_amount": [op.get("booking_amount", 0.0)],
                "base_price": [op.get("base_price", 0.0)],
                "completion_rate": [op.get("completion_rate", 0.0)],
                "cancellation_rate": [op.get("cancellation_rate", 0.0)],
            },
            index=[next_date],
        )
        history = pd.concat([history, new_row])

    dates = pd.date_range(
        data.index.max() + pd.Timedelta(days=1), periods=steps, freq="D"
    )
    return pd.Series(np.ceil(preds).astype(int), index=dates), mae, feature_cols




def _sarimax_forecast(data: pd.DataFrame, steps: int = 7) -> pd.Series:
    y = pd.to_numeric(data["request_count"], errors="coerce").fillna(0)
    if len(y) < 5:
        return pd.Series([max(0, int(round(y.mean()))) for _ in range(steps)],
                         index=pd.date_range(y.index.max() + pd.Timedelta(days=1), periods=steps, freq="D"))
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        model = SARIMAX(
            y,
            order=(1, 1, 1),
            seasonal_order=(1, 1, 1, 7),
            enforce_stationarity=False,
            enforce_invertibility=False,
        )
        fit = model.fit(disp=False)
        forecast = fit.forecast(steps=steps)

    dates = pd.date_range(y.index.max() + pd.Timedelta(days=1), periods=steps, freq="D")
    return pd.Series(np.maximum(0, np.ceil(forecast).astype(int)), index=dates)




def forecast_model(data: pd.DataFrame, steps: int = 7) -> tuple[pd.Series, dict]:
    """Feature-enriched ML forecast with SARIMAX fallback."""
    try:
        forecast, mae, feature_cols = _recursive_rf_forecast(data, steps=steps)
        meta = {
            "model": "RandomForest feature-enriched forecast",
            "validation_mae": None if np.isnan(mae) else round(mae, 2),
            "features": feature_cols,
        }
        return forecast, meta
    except Exception:
        forecast = _sarimax_forecast(data, steps=steps)
        return forecast, {
            "model": "SARIMAX seasonal fallback",
            "validation_mae": None,
            "features": ["request_count", "7-day seasonality"],
        }




def forecast_SeriesData(data, steps=7):
    """Backward-compatible helper for area analytics."""
    if isinstance(data, pd.Series):
        frame = pd.DataFrame({"request_count": data})
    else:
        frame = pd.DataFrame({"request_count": data})
    forecast, _ = forecast_model(frame, steps=steps)
    return forecast

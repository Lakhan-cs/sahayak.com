from __future__ import annotations

from pathlib import Path
import pandas as pd
import numpy as np


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "sih_combined_data_v5.csv"


NUMERIC_COLUMNS = [
    "request_count",
    "completed_requests",
    "cancelled_requests",
    "base_price",
    "booking_amount",
    "experience_years",
    "provider_rating",
    "provider_available_hours",
    "available_workers",
    "service_popularity_index",
    "latitude",
    "longitude",
]


def load_data() -> pd.DataFrame:
    """Load the current UrbanServe-heavy dataset with robust date/numeric parsing."""
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Forecast dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()

    # Prefer ISO YYYY-MM-DD, then support legacy DD-MM-YYYY values.
    raw_dates = df["booking_date"].astype(str).str.strip()
    parsed_iso = pd.to_datetime(raw_dates, format="%Y-%m-%d", errors="coerce")
    parsed_legacy = pd.to_datetime(raw_dates, format="%d-%m-%Y", errors="coerce")
    df["booking_date"] = parsed_iso.fillna(parsed_legacy)

    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    required = ["booking_date", "area", "service", "request_count"]
    df = df.dropna(subset=required).copy()

    # Keep non-negative operational measures.
    for col in [
        "request_count",
        "completed_requests",
        "cancelled_requests",
        "base_price",
        "booking_amount",
        "provider_available_hours",
        "available_workers",
    ]:
        if col in df.columns:
            df[col] = df[col].clip(lower=0)

    # Derived row-level signals useful for ML/recommendation.
    requests = df["request_count"].replace(0, np.nan)
    df["completion_rate"] = (
        df["completed_requests"] / requests
        if "completed_requests" in df.columns
        else np.nan
    ).clip(0, 1).fillna(0)

    df["cancellation_rate"] = (
        df["cancelled_requests"] / requests
        if "cancelled_requests" in df.columns
        else np.nan
    ).clip(0, 1).fillna(0)

    df["demand_per_available_worker"] = (
        df["request_count"] / df["available_workers"].clip(lower=1)
        if "available_workers" in df.columns
        else df["request_count"]
    )

    if "base_price" in df.columns and "booking_amount" in df.columns:
        df["booking_price_ratio"] = (
            df["booking_amount"] / df["base_price"].replace(0, np.nan)
        ).replace([np.inf, -np.inf], np.nan).fillna(1.0)

    df["day_of_week"] = df["booking_date"].dt.dayofweek
    df["day_name"] = df["booking_date"].dt.day_name()
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    df["month"] = df["booking_date"].dt.month
    df["week_of_year"] = df["booking_date"].dt.isocalendar().week.astype(int)
    df["day_of_month"] = df["booking_date"].dt.day

    df = df.sort_values(
        by=["booking_date", "area", "service"]
    ).reset_index(drop=True)

    return df


def get_time_series(df: pd.DataFrame, area: str, service: str) -> pd.DataFrame:
    """Return one daily series plus operational context for an area/service pair."""
    filtered = df[
        (df["area"].astype(str) == str(area))
        & (df["service"].astype(str) == str(service))
    ].copy()

    if filtered.empty:
        return pd.DataFrame(
            columns=[
                "request_count",
                "available_workers",
                "provider_available_hours",
                "service_popularity_index",
                "booking_amount",
                "base_price",
                "completion_rate",
                "cancellation_rate",
            ]
        )

    filtered = filtered.set_index("booking_date").sort_index()

    agg = {
        "request_count": "sum",
        "available_workers": "mean",
        "provider_available_hours": "mean",
        "service_popularity_index": "mean",
        "booking_amount": "mean",
        "base_price": "mean",
        "completion_rate": "mean",
        "cancellation_rate": "mean",
    }

    available = {k: v for k, v in agg.items() if k in filtered.columns}
    daily = filtered[list(available)].resample("D").agg(available)

    # Preserve an explicit zero-demand day while using recent operational values.
    daily["request_count"] = daily["request_count"].fillna(0)
    for col in daily.columns:
        if col != "request_count":
            daily[col] = daily[col].ffill().bfill()

    # Calendar features are deterministic.
    daily["day_of_week"] = daily.index.dayofweek
    daily["is_weekend"] = (daily["day_of_week"] >= 5).astype(int)
    daily["month"] = daily.index.month
    daily["day_of_month"] = daily.index.day
    daily["week_of_year"] = daily.index.isocalendar().week.astype(int)

    return daily

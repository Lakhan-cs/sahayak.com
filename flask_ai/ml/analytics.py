from __future__ import annotations

import numpy as np
import pandas as pd

from ml.preprocessing import get_time_series
from ml.forecasting import forecast_model


def get_weekly_serviceData(df: pd.DataFrame) -> pd.DataFrame:
    dt = df.copy()
    dt["week"] = dt["booking_date"].dt.to_period("W-MON").apply(lambda x: x.start_time)
    return (
        dt.groupby(["week", "service"], as_index=False)["request_count"]
        .sum()
        .sort_values(["week", "service"])
    )




def get_next_week_service_demand(df: pd.DataFrame, steps: int = 7):
    results = []
    for service in sorted(df["service"].dropna().unique()):
        service_df = df[df["service"] == service]
        series = (
            service_df.set_index("booking_date")["request_count"]
            .resample("D")
            .sum()
            .fillna(0)
        )
        if len(series) < 14:
            continue
        forecast, meta = forecast_model(pd.DataFrame({"request_count": series}), steps=steps)
        results.append({
            "service": service,
            "request_count": int(round(float(forecast.sum()))),
            "peak_daily_demand": int(round(float(forecast.max()))),
            "model": meta["model"],
        })
    return results




def get_weekly_areaData(df: pd.DataFrame, area: str) -> pd.DataFrame:
    area_df = df[df["area"] == area].copy()
    area_df["week"] = area_df["booking_date"].dt.to_period("W-MON").apply(lambda x: x.start_time)
    return (
        area_df.groupby(["week", "area"], as_index=False)["request_count"]
        .sum()
        .sort_values("week")
    )




def get_next_week_area_demand(df: pd.DataFrame, area: str, steps: int = 7):
    area_df = df[df["area"] == area]
    series = (
        area_df.set_index("booking_date")["request_count"]
        .resample("D")
        .sum()
        .fillna(0)
    )
    forecast, meta = forecast_model(pd.DataFrame({"request_count": series}), steps=steps)
    return float(forecast.sum()), meta




def get_summary(df: pd.DataFrame) -> dict:
    total = float(pd.to_numeric(df["request_count"], errors="coerce").fillna(0).sum())
    completed = float(pd.to_numeric(df["completed_requests"], errors="coerce").fillna(0).sum())
    cancelled = float(pd.to_numeric(df["cancelled_requests"], errors="coerce").fillna(0).sum())

    service_totals = (
        df.groupby("service")["request_count"].sum().sort_values(ascending=False)
    )
    area_totals = (
        df.groupby("area")["request_count"].sum().sort_values(ascending=False)
    )

    return {
        "records": int(len(df)),
        "total_requests": int(round(total)),
        "completed_requests": int(round(completed)),
        "cancelled_requests": int(round(cancelled)),
        "completion_rate": round((completed / total * 100) if total else 0, 2),
        "cancellation_rate": round((cancelled / total * 100) if total else 0, 2),
        "services": int(df["service"].nunique()),
        "areas": int(df["area"].nunique()),
        "providers": int(df["provider_id"].nunique()),
        "active_providers": int(df.loc[df["status"].astype(str).str.lower().ne("cancelled"), "provider_id"].nunique()) if "status" in df.columns else int(df["provider_id"].nunique()),
        "first_date": df["booking_date"].min().strftime("%Y-%m-%d"),
        "last_date": df["booking_date"].max().strftime("%Y-%m-%d"),
        "top_service": service_totals.index[0] if not service_totals.empty else "-",
        "top_service_requests": int(round(service_totals.iloc[0])) if not service_totals.empty else 0,
        "top_area": area_totals.index[0] if not area_totals.empty else "-",
        "top_area_requests": int(round(area_totals.iloc[0])) if not area_totals.empty else 0,
        "geography": "Delhi",
    }




def get_worker_recommendations(df: pd.DataFrame, area: str, service: str, limit: int = 5) -> dict:
    target = df[(df["area"] == area) & (df["service"] == service)].copy()
    locality_basis = "exact area + service match"

    if target.empty:
        return {
            "area": area,
            "service": service,
            "recommendations": [],
            "message": "No provider records are available for this area and service.",
        }

    # Aggregate repeated observations into one provider profile.
    profile = (
        target.sort_values("booking_date")
        .groupby("provider_id")
        .agg(
            experience_years=("experience_years", "mean"),
            provider_rating=("provider_rating", "mean"),
            verification_status=("verification_status", "last"),
            provider_available_hours=("provider_available_hours", "mean"),
            available_workers=("available_workers", "mean"),
            completed_requests=("completed_requests", "sum"),
            cancelled_requests=("cancelled_requests", "sum"),
            last_date=("booking_date", "max"),
            latitude=("latitude", "mean"),
            longitude=("longitude", "mean"),
            area=("area", "last"),
        )
        .reset_index()
    )

    total_jobs = (profile["completed_requests"] + profile["cancelled_requests"]).replace(0, np.nan)
    profile["completion_rate"] = (profile["completed_requests"] / total_jobs).fillna(0).clip(0, 1)
    profile["cancellation_rate"] = (profile["cancelled_requests"] / total_jobs).fillna(0).clip(0, 1)

    def minmax(s):
        s = s.astype(float)
        lo, hi = s.min(), s.max()
        if hi == lo:
            return pd.Series(np.ones(len(s)), index=s.index)
        return (s - lo) / (hi - lo)

    profile["rating_score"] = profile["provider_rating"].clip(0, 5) / 5
    profile["experience_score"] = minmax(profile["experience_years"].clip(0, 20))
    profile["availability_score"] = profile["provider_available_hours"].clip(0, 24) / 24
    profile["reliability_score"] = profile["completion_rate"]
    profile["verification_score"] = profile["verification_status"].astype(str).str.lower().eq("verified").astype(float)
    profile["capacity_score"] = minmax(profile["available_workers"])
    profile["recommendation_score"] = (
        100 * (
            0.30 * profile["rating_score"]
            + 0.20 * profile["experience_score"]
            + 0.20 * profile["availability_score"]
            + 0.15 * profile["reliability_score"]
            + 0.10 * profile["verification_score"]
            + 0.05 * profile["capacity_score"]
        )
    ).round(2)

    series = get_time_series(df, area, service)
    forecast, meta = forecast_model(series, steps=7) if not series.empty else (
        pd.Series([0] * 7), {"model": "Unavailable", "validation_mae": None, "features": []}
    )
    peak_demand = int(np.ceil(float(forecast.max()))) if len(forecast) else 0

    # Estimate capacity directly from observed demand and available workers;
    # Capacity is inferred from observed demand per available worker.
    daily_capacity = get_time_series(df, area, service)
    if not daily_capacity.empty and "available_workers" in daily_capacity.columns:
        ratio = (
            daily_capacity["request_count"]
            / daily_capacity["available_workers"].clip(lower=1)
        ).replace([np.inf, -np.inf], np.nan).dropna()
        jobs_per_worker_day = max(1, int(round(float(ratio.tail(30).median()))) if not ratio.empty else 1)
    else:
        jobs_per_worker_day = 1

    required_workers = int(np.ceil(peak_demand / jobs_per_worker_day)) if peak_demand else 0
    current_available = int(round(target.sort_values("booking_date")["available_workers"].tail(7).mean())) if "available_workers" in target else 0
    capacity_gap = max(0, required_workers - current_available)

    profile["capacity_status"] = np.where(profile["available_workers"] >= 1, "Available", "Low capacity")

    recommendations = []
    for _, row in profile.sort_values("recommendation_score", ascending=False).head(limit).iterrows():
        provider_id = str(row["provider_id"]) if pd.notna(row["provider_id"]) else "Provider"
        recommendations.append({
            "provider_id": provider_id,
            "provider_label": provider_id if provider_id.lower().startswith("provider") else f"Provider {provider_id}",
            "score": float(row["recommendation_score"]),
            "rating": round(float(row["provider_rating"]), 1),
            "experience_years": int(round(float(row["experience_years"]))),
            "verification_status": str(row["verification_status"]),
            "availability_hours": int(round(float(row["provider_available_hours"]))),
            "available_workers": int(round(float(row["available_workers"]))),
            "completion_rate": round(float(row["completion_rate"]) * 100, 1),
            "cancellation_rate": round(float(row["cancellation_rate"]) * 100, 1),
            "area": str(row["area"]),
            "capacity_status": str(row["capacity_status"]),
        })

    return {
        "area": area,
        "service": service,
        "locality_basis": locality_basis,
        "forecast_next_7_days": int(round(float(forecast.sum()))) if len(forecast) else 0,
        "peak_daily_demand": peak_demand,
        "estimated_jobs_per_worker_day": jobs_per_worker_day,
        "required_workers": required_workers,
        "current_available": current_available,
        "capacity_gap": capacity_gap,
        "forecast_model": meta["model"],
        "recommendations": recommendations,
    }


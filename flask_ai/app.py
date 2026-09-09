from __future__ import annotations

from pathlib import Path

from flask import Flask, jsonify, request
import numpy as np
import pandas as pd
from dotenv import load_dotenv

from ml.preprocessing import load_data, get_time_series
from ml.forecasting import forecast_model
from ml.gemini_req import understand_requirement
from ml.analytics import (
    get_weekly_serviceData,
    get_next_week_service_demand,
    get_weekly_areaData,
    get_next_week_area_demand,
    get_summary,
    get_worker_recommendations,
)

load_dotenv(Path(__file__).resolve().parent / ".env")
app = Flask(__name__)


def _options(df: pd.DataFrame) -> dict:
    pairs = df[["area", "service"]].dropna().drop_duplicates().sort_values(["area", "service"])
    return {
        "areas": sorted(df["area"].dropna().unique().tolist()),
        "services": sorted(df["service"].dropna().unique().tolist()),
        "pairs": [{"area": row["area"], "service": row["service"]} for _, row in pairs.iterrows()],
    }


@app.get("/api/health")
def health():
    return jsonify({"status": "running", "service": "Nabhi Flask AI/ML", "ai": "Gemini + local ML fallback"})


@app.post("/api/understand")
def understand():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    return jsonify(understand_requirement(text))


@app.post("/api/ml-understand")
def ml_understand():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"success": False, "message": "Please enter your requirement."}), 400
    from search_feature.requirement_model import RequirementModel
    return jsonify(RequirementModel().understand(text))


@app.get("/api/options")
def api_options():
    return jsonify(_options(load_data()))


@app.get("/api/summary")
def api_summary():
    return jsonify(get_summary(load_data()))


@app.get("/api/forecast")
def get_forecast():
    area = request.args.get("area", "").strip()
    service = request.args.get("service", "").strip()
    if not area or not service:
        return jsonify({"error": "Area and service are required"}), 400

    df = load_data()
    series = get_time_series(df, area, service)
    target = df[(df["area"] == area) & (df["service"] == service)].copy()
    if series.empty:
        return jsonify({"error": "Not enough historical data for this area/service combination"}), 400

    try:
        forecast, meta = forecast_model(series, steps=7)
        peak_demand = int(np.ceil(float(forecast.max()))) if len(forecast) else 0
        daily_capacity = series
        if not daily_capacity.empty and "available_workers" in daily_capacity.columns:
            ratio = (daily_capacity["request_count"] / daily_capacity["available_workers"].clip(lower=1)).replace([np.inf, -np.inf], np.nan).dropna()
            jobs_per_worker_day = max(1, int(round(float(ratio.tail(30).median()))) if not ratio.empty else 1)
        else:
            jobs_per_worker_day = 1
        required_workers = int(np.ceil(peak_demand / jobs_per_worker_day)) if peak_demand else 0
        current_available = int(round(target.sort_values("booking_date")["available_workers"].tail(7).mean())) if "available_workers" in target else 0
        capacity_gap = max(0, required_workers - current_available)

        return jsonify({
            "area": area,
            "service": service,
            "dates": [d.strftime("%Y-%m-%d") for d in forecast.index],
            "forecast": [round(float(v), 2) for v in forecast],
            "total_forecast": int(round(float(forecast.sum()))),
            "peak_demand": peak_demand,
            "current_available_workers": current_available,
            "capacityGap": capacity_gap,
            "requiredWorkers": required_workers,
            "model": meta["model"],
            "validation_mae": meta["validation_mae"],
            "features": meta["features"],
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.get("/api/get_weekly_service_demand")
def weekly_service_demand():
    service = request.args.get("service", "").strip()
    weekly = get_weekly_serviceData(load_data())
    if service:
        weekly = weekly[weekly["service"] == service]
    weekly["week"] = weekly["week"].dt.strftime("%Y-%m-%d")
    return jsonify(weekly.to_dict(orient="records"))


@app.get("/api/next_week_service_forecast")
def next_week_service_forecast():
    return jsonify(get_next_week_service_demand(load_data(), steps=7))


@app.get("/api/area_stats")
def area_demand():
    area = request.args.get("area", "").strip()
    if not area:
        return jsonify({"error": "Area is required"}), 400
    df = load_data()
    weekly = get_weekly_areaData(df, area)
    if len(weekly) < 2:
        return jsonify({"error": "Not enough data for this area"}), 400
    last_week = int(weekly["request_count"].iloc[-2])
    this_week = int(weekly["request_count"].iloc[-1])
    next_week, meta = get_next_week_area_demand(df, area, steps=7)
    growth = ((this_week - last_week) / last_week * 100) if last_week else 0
    return jsonify({
        "area": area,
        "last_week": last_week,
        "this_week": this_week,
        "next_week": int(round(next_week)),
        "growth_rate": round(growth, 2),
        "model": meta["model"],
        "weekly": [{"week": pd.to_datetime(row["week"]).strftime("%Y-%m-%d"), "request_count": int(row["request_count"])} for _, row in weekly.iterrows()],
    })


@app.get("/api/worker_recommendations")
def worker_recommendations_api():
    area = request.args.get("area", "").strip()
    service = request.args.get("service", "").strip()
    if not area or not service:
        return jsonify({"error": "Area and service are required"}), 400
    return jsonify(get_worker_recommendations(load_data(), area, service, limit=5))


if __name__ == "__main__":
    import os
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", os.getenv("FLASK_PORT", "5000"))),
        debug=False,
    )

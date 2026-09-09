# SIH 26089 — DemandAI (Updated)

## What changed
The project now uses `data/sih_forecast.csv` as the active dataset. It is the supplied UrbanServe-heavy dataset with the ISO date format `YYYY-MM-DD` and coverage from 2026-04-01 through 2026-07-01.

The original Flask pages are retained, but hard-coded old Delhi service/area lists have been replaced with dynamic values from the current dataset.

## Run
```bash
pip install -r requirements.txt
python app.py
```
Then open `http://127.0.0.1:5000/`.

## Implemented features
- Dynamic area/service selectors
- 7-day area + service demand forecast
- Feature-enriched Random Forest forecasting with SARIMAX fallback
- Forecast validation MAE shown in the UI when available
- Worker requirement estimate from peak demand and observed worker capacity
- Capacity gap = required workers - available workers
- Provider recommendation score
- Service and area trend dashboards
- Dataset summary analytics page
- No PII is used by the new forecast/recommendation endpoints

## Forecast features
The model uses lag/rolling demand and calendar features plus recent operational context:
`lag_1`, `lag_7`, `lag_14`, `rolling_7`, `rolling_14`, day-of-week, weekend, month, day-of-month, week-of-year, available workers, provider availability hours, service popularity, booking amount, base price, completion rate, cancellation rate, and demand-per-worker pressure.

## Recommendation features
Provider ranking uses service/area fit, rating, experience, availability hours, completion reliability, verification and current capacity.

## Good future additions
For a larger real-world dataset, add hourly demand, holiday/event flags, weather, travel time, discount/surge data, provider shift calendars, no-show history, customer repeat/first-time flags, urgency/SLA and neighborhood-level demand drivers.

## Data provenance note
Synthetic/augmented rows inside the supplied dataset are generated/augmented observations based on the source patterns. They should not be presented as official Urban Company, government, or other official real-world observations.

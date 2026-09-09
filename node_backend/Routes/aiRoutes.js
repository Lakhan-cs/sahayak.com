const express = require("express");
const { createFlaskProxy } = require("../controllers/aiController");

const router = express.Router();

const mappings = [
  ["/understand", "/api/understand"],
  ["/health", "/api/health"],
  ["/options", "/api/options"],
  ["/summary", "/api/summary"],
  ["/forecast", "/api/forecast"],
  ["/get_weekly_service_demand", "/api/get_weekly_service_demand"],
  ["/next_week_service_forecast", "/api/next_week_service_forecast"],
  ["/area_stats", "/api/area_stats"],
  ["/worker_recommendations", "/api/worker_recommendations"],
  ["/ml-understand", "/api/ml-understand"],
];

for (const [publicPath, flaskPath] of mappings) {
  router.all(publicPath, createFlaskProxy(flaskPath));
}

module.exports = router;

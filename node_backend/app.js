const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const useroutes = require("./Routes/useroutes");
const aiRoutes = require("./Routes/aiRoutes");
const errorHandler = require("./middlewares/err");

const app = express();
const publicDir = path.resolve(__dirname, "../public");

app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/node-health", (req, res) => {
  res.json({
    status: "running",
    backend: "Node.js + Express",
    flask: process.env.FLASK_BASE_URL || "http://127.0.0.1:5000"
  });
});

app.use("/api", useroutes);
app.use("/api", aiRoutes);
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));
app.use(express.static(publicDir));

const pages = {
  "/": "homepage.html",
  "/homepage": "homepage.html",
  "/login": "login.html",
  "/signup": "signup.html",
  "/forgotpass": "forgotpass.html",
  "/customerhomepage": "customerhomepage.html",
  "/worker-dashboard": "worker-dashboard.html",
  "/service-request": "service-request.html",
  "/schedule-service": "schedule-service.html",
  "/worker-match": "worker-match.html",
  "/customer-tracking": "frontend/navigation/customer-tracking.html",
  "/customer-tracking.html": "frontend/navigation/customer-tracking.html",
  "/worker-navigation": "frontend/navigation/worker-navigation.html",
  "/worker-navigation.html": "frontend/navigation/worker-navigation.html",
  "/review-booking": "review-booking.html",
  "/booking-confirmed": "booking-confirmed.html",
  "/dashboard": "dashboard.html",
  "/analysis": "analysis.html",
  "/service_forecast": "service_forecast.html",
  "/area_stats": "area_stats.html",
  "/worker_recommendations": "worker_recommendations.html"
};

for (const [route, file] of Object.entries(pages)) {
  app.get(route, (req, res) => res.sendFile(path.join(publicDir, file)));
}

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ status: false, message: "API route not found" });
  res.status(404).sendFile(path.join(publicDir, "homepage.html"));
});

app.use(errorHandler);

module.exports = app;

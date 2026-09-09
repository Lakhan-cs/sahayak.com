function flaskBaseUrl() {
  return (process.env.FLASK_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
}

function createFlaskProxy(flaskPath) {
  return async (req, res, next) => {
    try {
      const query = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
      const target = `${flaskBaseUrl()}${flaskPath}${query}`;

      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        Number(process.env.FLASK_TIMEOUT_MS || 120000)
      );

      const headers = { accept: "application/json" };
      const options = { method: req.method, headers, signal: controller.signal };

      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        headers["content-type"] = "application/json";
        options.body = JSON.stringify(req.body || {});
      }

      const response = await fetch(target, options);
      clearTimeout(timeout);

      const contentType = response.headers.get("content-type") || "application/json";
      const text = await response.text();
      res.status(response.status).type(contentType).send(text);
    } catch (err) {
      if (err.name === "AbortError") {
        return res.status(504).json({ success: false, error: "AI service timed out" });
      }
      if (err.cause?.code === "ECONNREFUSED" || err.code === "ECONNREFUSED") {
        return res.status(503).json({
          success: false,
          error: "Flask AI service is not running. Start the Flask service on the configured FLASK_BASE_URL.",
        });
      }
      next(err);
    }
  };
}

module.exports = { createFlaskProxy };

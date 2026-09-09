const err = (error, req, res, next) => {
  console.error(error);

  if (error.code === 11000) {
    return res.status(400).json({ status: false, message: "Duplicate entry found", path: req.path });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ status: false, message: error.message, path: req.path });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ status: false, message: "Invalid ID format", path: req.path });
  }
  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return res.status(401).json({ status: false, message: error.name === "TokenExpiredError" ? "Token expired" : "Invalid token", path: req.path });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ status: false, message: "Invalid JSON in request body", path: req.path });
  }

  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({ status: false, statusCode, message: error.message || "Internal server error", path: req.path });
};

module.exports = err;

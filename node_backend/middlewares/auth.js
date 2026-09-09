const jwt = require("jsonwebtoken");
const apierr = require("../utils/errclass");

module.exports = function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : header;
    if (!token) throw new apierr("Authorization token is required", 401);
    req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    next();
  } catch (err) {
    next(err);
  }
};

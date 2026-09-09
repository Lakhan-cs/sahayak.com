const jwt = require("jsonwebtoken");
const apierr = require("../utils/errclass");

const tokenverify = async (req, resp, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : header;
    if (!token) throw new apierr("Authorization token is required", 401);

    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = tokenverify;

const jwt = require("jsonwebtoken");

const generateaccesstoken = user => jwt.sign(
  { id: user._id, role: user.role, email: user.email },
  process.env.JWT_SECRET_KEY,
  { expiresIn: "20m" }
);

const generaterefreshtoken = (user, sessionid) => jwt.sign(
  { userId: user._id, sessionid },
  process.env.REFRESH_SECRET_KEY,
  { expiresIn: "7d" }
);

module.exports = { generateaccesstoken, generaterefreshtoken };

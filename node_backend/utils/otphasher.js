const crypto = require('crypto');


// 2. Hash it using SHA-256
const hashedotp = (otp)=>{ return crypto .createHash('sha256') .update(otp) .digest('hex') }

module.exports = hashedotp


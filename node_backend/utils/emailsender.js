const transporter = require("../config/mailer.js");

async function sendmail(to, sub, data) {
  if (!transporter) {
    console.warn("Mail is not configured; skipping email delivery.");
    return false;
  }
  await transporter.sendMail({
    from: process.env.APP_MAIL,
    to,
    subject: sub,
    html: data,
  });
  return true;
}

module.exports = sendmail;

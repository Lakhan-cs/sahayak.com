const nodemailer = require("nodemailer");

const hasMailConfig = Boolean(process.env.APP_MAIL && process.env.APP_PASS && !process.env.APP_MAIL.startsWith("your_"));

const transporter = hasMailConfig
  ? nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.APP_MAIL, pass: process.env.APP_PASS },
    })
  : null;

module.exports = transporter;

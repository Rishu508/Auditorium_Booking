const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.BRAVE_EMAIL, // youremail@brave.com
    pass: process.env.BRAVE_APP_PASS, // app password
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP config error:", error);
  } else {
    console.log("Nodemailer smtp is ready to send mails");
  }
});

module.exports = transporter;

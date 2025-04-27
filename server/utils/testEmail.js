const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendTestEmail() {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"StudyNotion Test" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: "Test Email from StudyNotion",
      text: "This is a test email to verify SMTP configuration.",
      html: "<b>This is a test email to verify SMTP configuration.</b>",
    });

    console.log("Test email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

sendTestEmail();

const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    // Check if environment variables are set
    if (
      !process.env.MAIL_HOST ||
      !process.env.MAIL_USER ||
      !process.env.MAIL_PASS
    ) {
      console.error(
        "Email configuration missing. Please set MAIL_HOST, MAIL_USER, and MAIL_PASS environment variables.",
      );
      console.log("MAIL_HOST:", process.env.MAIL_HOST ? "Set" : "Not set");
      console.log("MAIL_USER:", process.env.MAIL_USER ? "Set" : "Not set");
      console.log("MAIL_PASS:", process.env.MAIL_PASS ? "Set" : "Not set");
      throw new Error(
        "Email configuration is missing. Please configure SMTP settings.",
      );
    }

    console.log("Creating email transporter with host:", process.env.MAIL_HOST);
    const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587;
    const secure = process.env.MAIL_SECURE
      ? process.env.MAIL_SECURE === "true"
      : port === 465;
    console.log("SMTP connection settings:", {
      host: process.env.MAIL_HOST,
      port,
      secure,
    });
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port,
      secure, // false for port 587, true for 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Timeout settings
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 15000,
      socketTimeout: 30000,
      // Better TLS settings for Gmail
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates in dev
        ciphers: "SSLv3",
      },
    });

    console.log("Sending email to:", email);
    let info = await transporter.sendMail({
      from: `"StudyNotion" <${process.env.MAIL_USER}>`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error in mailSender:", error.message);
    console.error("Full error:", error);
    throw error;
  }
};

module.exports = mailSender;

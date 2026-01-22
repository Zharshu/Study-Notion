const mongoose = require("mongoose");
const mailSender = require("../utils/email/emailSender");
const emailTemplate = require("../utils/email/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
  },
});

// Define a function ->SendVerification Mail to send emails which takes email,otp
async function sendVerificationEmail(email, otp) {
  // Send the email
  try {
    //mailSender function ka use kia mail send krne ke lie jo ki email,title,body mang raga hai
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      emailTemplate(otp),
    );
    if (mailResponse && mailResponse.response) {
      console.log("Email sent successfully: ", mailResponse.response);
    } else {
      console.log(
        "Email sent successfully, but no response property in mailResponse",
      );
    }
    return mailResponse;
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    // Don't throw - just log the error and return
    return null;
  }
}

// Define a pre-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
  console.log("New document saved to database");

  //It ensures that the logic (like sending verification email) only runs
  //  when the document is being created for the first time, and not during updates.
  if (this.isNew) {
    // Send email asynchronously without blocking
    sendVerificationEmail(this.email, this.otp)
      .then((res) => {
        if (res && (res.messageId || res.response)) {
          console.log("Verification email sent successfully");
        } else {
          console.error("Verification email could not be sent (no response from transporter)");
        }
      })
      .catch((error) => {
        console.error("Failed to send verification email:", error.message);
        // Don't throw error - allow signup to proceed even if email fails
      });
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;

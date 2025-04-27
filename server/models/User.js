const mongoose = require("mongoose");
const crypto = require("crypto");

// Define the user schema using Mongoose Schema constructor
const userSchema = new mongoose.Schema(
  {
    // Define fields with validations and properties
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    accountType: {
      type: String,
      enum: ["Admin", "Student", "Instructor"],
      required: true,
    },
    active: { type: Boolean, default: true },
    approved: { type: Boolean, default: true },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Profile",
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    token: { type: String },
    resetPasswordExpires: { type: Date },
    // Image field dynamically assigned if not provided
    image: { type: String },
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseProgress", 
      },
    ],
    credits: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save middleware for dynamically assigning default Gravatar URL
userSchema.pre("save", function (next) {
  // If image field is not provided, generate Gravatar URL based on email
  if (!this.image) {
    const emailHash = crypto
      .createHash("md5")
      .update(this.email || "default")
      .digest("hex");
    this.image = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
  }
  next();
});

// Export the Mongoose model for the user schema
module.exports = mongoose.model("User", userSchema); // ✅ Ensure this line is there
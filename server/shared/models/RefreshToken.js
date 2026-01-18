const mongoose = require("mongoose");

// RefreshToken model for managing user sessions across multiple devices
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true, // For efficient cleanup of expired tokens
    },
    deviceInfo: {
      userAgent: String,
      ip: String,
      deviceType: String, // mobile, desktop, tablet
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true,
    // Automatically delete documents after they expire
    expireAfterSeconds: 0,
  }
);

// Index for finding active tokens by user
refreshTokenSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });

// Method to check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return !this.isRevoked && this.expiresAt > new Date();
};

// Static method to cleanup expired tokens
refreshTokenSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isRevoked: true }
    ]
  });
  return result.deletedCount;
};

// Static method to revoke all tokens for a user (used on password change, etc.)
refreshTokenSchema.statics.revokeAllForUser = async function(userId) {
  const result = await this.updateMany(
    { userId, isRevoked: false },
    { $set: { isRevoked: true } }
  );
  return result.modifiedCount;
};

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);

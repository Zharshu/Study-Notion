const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
    // Examples: "USER_SUSPENDED", "COURSE_APPROVED", "REFUND_PROCESSED"
  },
  targetType: {
    type: String,
    enum: ["User", "Course", "Payment", "Category", "Review", "Refund"],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
}, { timestamps: true });

// Index for efficient querying
auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

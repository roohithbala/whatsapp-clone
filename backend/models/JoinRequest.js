const mongoose = require("mongoose");

const joinRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    groupId: {
      type: String,
      required: true,
      ref: "Group",
      index: true,
    },
    requestedUserId: {
      type: String,
      required: true,
      ref: "User",
    },
    requestedBy: {
      type: String,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Compound index to ensure a pending request for a user in a group is unique.
// This allows a new request if a previous one was approved or rejected.
joinRequestSchema.index({ groupId: 1, requestedUserId: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: "pending" } 
});

module.exports = mongoose.model("JoinRequest", joinRequestSchema);

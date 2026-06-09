const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: String,
      required: true,
      index: true,
    },
    targetUserId: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
      index: true,
    },
    actionTaken: {
      type: String,
      default: "none",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);

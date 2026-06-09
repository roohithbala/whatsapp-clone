const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      unique: true,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: "Unknown",
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    os: {
      type: String,
      default: "Unknown",
    },
    deviceType: {
      type: String,
      default: "Desktop",
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);

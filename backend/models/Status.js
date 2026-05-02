const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      expires: 0, // MongoDB TTL index: automatically deletes document when current time >= expiresAt
    },
    type: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    backgroundColor: {
      type: String,
      default: "#25D366", // WhatsApp Green
    },
    fontFamily: {
      type: String,
      default: "Inter",
    },
    privacyType: {
      type: String,
      enum: ["all", "except", "only"],
      default: "all",
    },
    privacyList: [
      {
        type: String,
        ref: "User",
      },
    ],
    viewedBy: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Status", statusSchema);

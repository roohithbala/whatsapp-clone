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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Status", statusSchema);

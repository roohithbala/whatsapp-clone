const mongoose = require("mongoose");

const chatSettingSchema = new mongoose.Schema(
  {
    chatId: {
      type: String, // "userId1_userId2" (sorted alphabetically) or groupId
      required: true,
      unique: true,
      index: true,
    },
    disappearingMessages: {
      type: String,
      enum: ["off", "24h", "7d", "90d"],
      default: "off",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSetting", chatSettingSchema);

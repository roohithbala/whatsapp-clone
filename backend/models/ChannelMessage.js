const mongoose = require("mongoose");

const channelMessageSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      ref: "Channel",
    },
    content: {
      type: String,
      default: "",
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    messageType: {
      type: String,
      default: "text",
      enum: ["text", "image", "video", "audio", "document"],
    },
    hiddenFor: [
      {
        type: String,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false
    },
    userDeliveryList: [
      {
        userId: { type: String, required: true },
        deliveredAt: { type: Date, default: Date.now }
      }
    ],
    userSeenList: [
      {
        userId: { type: String, required: true },
        seenAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChannelMessage", channelMessageSchema);

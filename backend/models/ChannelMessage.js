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
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChannelMessage", channelMessageSchema);

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderUsername: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
      index: true,
    },
    receiverUsername: {
      type: String,
      required: true,
    },
    encryptedContent: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    algorithm: {
      type: String,
      default: "AES-GCM",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);

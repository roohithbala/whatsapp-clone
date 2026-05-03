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
    },
    encryptedContent: {
      type: String,
    },
    iv: {
      type: String,
    },
    text: {
      type: String,
    },
    mediaUrl: {
      type: String,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    messageType: {
      type: String,
      default: "text",
      enum: ["text", "image", "video", "audio", "document"],
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
    starredBy: [
      {
        type: String,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    hiddenFor: [
      {
        type: String,
      },
    ],
    reactions: [
      {
        userId: { type: String, required: true },
        emoji: { type: String, required: true },
      }
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);

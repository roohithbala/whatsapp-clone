const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      default: () => require("crypto").randomBytes(8).toString("hex"),
      unique: true,
      index: true,
    },
    callerId: { type: String, required: true, index: true },
    callerUsername: { type: String },
    receiverId: { type: String, required: true, index: true },
    receiverUsername: { type: String },
    type: { type: String, enum: ["audio", "video"], default: "audio" },
    status: {
      type: String,
      enum: ["missed", "answered", "declined", "ended"],
      default: "missed",
    },
    duration: { type: Number, default: 0 }, // seconds
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Call", callSchema);

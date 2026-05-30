const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      unique: true,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    adminId: {
      type: String,
      required: true,
      ref: "User",
    },
    followers: [
      {
        type: String, // Storing userIds
        ref: "User",
      },
    ],
    admins: [
      {
        type: String, // Storing userIds
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", channelSchema);

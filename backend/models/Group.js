const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    groupId: {
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
    adminIds: [
      {
        type: String, // Storing userIds
        ref: "User",
      },
    ],
    members: [
      {
        type: String, // Storing userIds
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);

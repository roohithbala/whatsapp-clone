const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    creatorId: { type: String, required: true, ref: "User" },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    announcementGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);

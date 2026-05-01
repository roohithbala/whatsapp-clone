const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "Hey there!",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    refreshToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    archivedChats: [
      {
        type: String, // Storing userIds or channelIds
      },
    ],
    theme: {
      type: String,
      default: "light",
      enum: ["light", "dark"],
    },
    appPin: {
      type: String,
      default: null,
    },
    isAppLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Password logic moved to SQLite and handled in routes

module.exports = mongoose.model("User", userSchema);

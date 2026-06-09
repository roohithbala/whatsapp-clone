const mongoose = require("mongoose");

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
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    authProvider: {
      type: String,
      default: "local",
      enum: ["local", "google"],
    },
    profilePicture: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "Hey there! I am using WhatsApp.",
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
    archivedChats: [{ type: String }],
    blockedUsers: [{ type: String }],
    favoriteUsers: [{ type: String }],
    lockedChats: [{ type: String }],
    mutedChats: [{ type: String }],
    theme: {
      type: String,
      default: "dark",
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
    notifications: {
      type: Boolean,
      default: true,
    },
    disappearingMessages: {
      type: String,
      default: "off",
      enum: ["off", "24h", "7d", "90d"],
    },
    privacy: {
      lastSeen: { type: String, default: "everyone", enum: ["everyone", "contacts", "nobody"] },
      profilePhoto: { type: String, default: "everyone", enum: ["everyone", "contacts", "nobody"] },
      about: { type: String, default: "everyone", enum: ["everyone", "contacts", "nobody"] },
      readReceipts: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.post('save', async function (doc, next) {
  try {
    const sql = require("../db/sql");
    await sql.run(
      `INSERT OR REPLACE INTO users_cache (
        userId, username, email, profilePicture, status, theme, isOnline, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        doc.userId,
        doc.username,
        doc.email,
        doc.profilePicture || null,
        doc.status || "Hey there! I am using WhatsApp.",
        doc.theme || "dark",
        doc.isOnline ? 1 : 0,
        doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
        doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString()
      ]
    );
  } catch (err) {
    console.error("Failed to sync Mongoose user doc to SQLite cache: ", err);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);

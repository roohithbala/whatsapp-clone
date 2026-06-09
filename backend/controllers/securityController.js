const User = require("../models/User");
const Report = require("../models/Report");
const bcrypt = require("bcryptjs");

// Toggle Archive
exports.toggleArchive = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    const { targetId } = req.params;
    if (!user.archivedChats) user.archivedChats = [];
    const isArchived = user.archivedChats.includes(targetId);

    if (isArchived) {
      user.archivedChats = user.archivedChats.filter(id => id !== targetId);
    } else {
      user.archivedChats.push(targetId);
    }
    await user.save();
    res.json({ archived: !isArchived, archivedChats: user.archivedChats });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Unarchive Chat
exports.unarchiveChat = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    user.archivedChats = (user.archivedChats || []).filter(id => id !== req.params.targetId);
    await user.save();
    res.json({ success: true, archivedChats: user.archivedChats });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Toggle Favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    const { targetId } = req.params;
    if (!user.favoriteUsers) user.favoriteUsers = [];
    const isFav = user.favoriteUsers.includes(targetId);

    if (isFav) {
      user.favoriteUsers = user.favoriteUsers.filter(id => id !== targetId);
    } else {
      user.favoriteUsers.push(targetId);
    }
    await user.save();
    res.json({ favorite: !isFav, favoriteUsers: user.favoriteUsers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Toggle Block
exports.toggleBlock = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    const { targetId } = req.params;
    if (!user.blockedUsers) user.blockedUsers = [];
    const isBlocked = user.blockedUsers.includes(targetId);

    if (isBlocked) {
      user.blockedUsers = user.blockedUsers.filter(id => id !== targetId);
    } else {
      user.blockedUsers.push(targetId);
    }
    await user.save();
    res.json({ blocked: !isBlocked, blockedUsers: user.blockedUsers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Unblock
exports.unblock = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    user.blockedUsers = (user.blockedUsers || []).filter(id => id !== req.params.targetId);
    await user.save();
    res.json({ success: true, blockedUsers: user.blockedUsers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Toggle Lock
exports.toggleLock = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    const { targetId } = req.params;
    if (!user.lockedChats) user.lockedChats = [];
    const isLocked = user.lockedChats.includes(targetId);

    if (isLocked) {
      user.lockedChats = user.lockedChats.filter(id => id !== targetId);
    } else {
      user.lockedChats.push(targetId);
    }
    await user.save();
    res.json({ locked: !isLocked, lockedChats: user.lockedChats });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Unlock
exports.unlock = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    user.lockedChats = (user.lockedChats || []).filter(id => id !== req.params.targetId);
    await user.save();
    res.json({ success: true, lockedChats: user.lockedChats });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Set App PIN
exports.setPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length < 4) return res.status(400).json({ error: "PIN must be at least 4 digits" });

    const user = await User.findOne({ userId: req.userId });
    const salt = await bcrypt.genSalt(10);
    user.appPin = await bcrypt.hash(pin, salt);
    await user.save();
    res.json({ message: "PIN set successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Verify PIN
exports.verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findOne({ userId: req.userId });
    if (!user.appPin) return res.status(400).json({ error: "No PIN set" });

    const isMatch = await bcrypt.compare(pin, user.appPin);
    if (isMatch) res.json({ success: true });
    else res.status(401).json({ error: "Invalid PIN" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Verify PIN route parameter
exports.verifyPinParam = async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });
    const { pin } = req.body;
    const user = await User.findOne({ userId: req.userId });
    if (!user || !user.appPin) return res.status(400).json({ error: "No PIN set" });

    const isValid = await bcrypt.compare(pin, user.appPin);
    if (isValid) res.json({ success: true });
    else res.status(401).json({ error: "Invalid PIN" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Report User
exports.reportUser = async (req, res) => {
  try {
    const { targetUserId, reason } = req.body;
    if (!targetUserId || !reason) return res.status(400).json({ error: "Target user ID and reason are required" });

    const reporter = await User.findOne({ userId: req.userId });
    const targetUser = await User.findOne({ userId: targetUserId });
    if (!reporter) return res.status(404).json({ error: "Reporter not found" });
    if (!targetUser) return res.status(404).json({ error: "Target user not found" });

    const nodemailer = require("nodemailer");
    let transporter;
    const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== "your-gmail-app-password";

    if (isConfigured) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com", port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_PORT === "465",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email", port: 587, secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    }

    const adminEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || "admin@whatsappclone.com";
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@whatsappclone.com",
      to: adminEmail, subject: `[USER REPORT] User reported: ${targetUser.username}`,
      html: `<p>User ${reporter.username} reported ${targetUser.username} for: ${reason}</p>`
    };

    await transporter.sendMail(mailOptions);

    const newReport = new Report({
      reporterId: req.userId,
      targetUserId,
      reason,
    });
    await newReport.save();

    res.json({ message: "User reported successfully. Report logged and email notification sent to administrator." });
  } catch (error) {
    console.error("Failed to submit report:", error);
    res.status(500).json({ error: "Failed to submit user report" });
  }
};

// Toggle Mute Chat
exports.toggleMuteChat = async (req, res) => {
  try {
    const userId = req.userId;
    const targetId = req.params.targetId;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.mutedChats) user.mutedChats = [];
    const isMuted = user.mutedChats.includes(targetId);
    if (isMuted) {
      user.mutedChats = user.mutedChats.filter(id => id !== targetId);
    } else {
      user.mutedChats.push(targetId);
    }
    await user.save();
    res.json({ success: true, muted: !isMuted, mutedChats: user.mutedChats });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get Starred Messages
exports.getStarredMessages = async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });
    const Message = require("../models/Message");
    const messages = await Message.find({ starredBy: req.userId }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

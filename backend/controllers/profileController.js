const User = require("../models/User");

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select("-password -refreshToken -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ...user.toObject(), hasPin: !!user.appPin });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });

    const { username, status, profilePicture, privacy } = req.body;
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (username) user.username = username;
    if (status) user.status = status;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (privacy) {
      if (!user.privacy) user.privacy = {};
      if (privacy.lastSeen !== undefined) user.privacy.lastSeen = privacy.lastSeen;
      if (privacy.profilePhoto !== undefined) user.privacy.profilePhoto = privacy.profilePhoto;
      if (privacy.about !== undefined) user.privacy.about = privacy.about;
      if (privacy.readReceipts !== undefined) user.privacy.readReceipts = privacy.readReceipts;
      if (privacy.notifications !== undefined) user.privacy.notifications = privacy.notifications;
      user.markModified('privacy');
    }

    await user.save();
    res.json({
      message: "Profile updated successfully",
      user: { userId: user.userId, username: user.username, email: user.email, status: user.status, profilePicture: user.profilePicture }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update User Settings (Theme, Notification, PIN setup)
exports.updateSettings = async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });

    const { theme, appPin, isAppLocked, notifications, disappearingMessages } = req.body;
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (theme !== undefined) user.theme = theme;
    if (appPin !== undefined) {
      if (appPin === null || appPin === "" || appPin === false) {
        user.appPin = undefined;
        user.lockedChats = []; // Pull all locked chats back to regular chats
      } else {
        const bcrypt = require("bcryptjs");
        user.appPin = await bcrypt.hash(String(appPin), 10);
      }
    }
    if (isAppLocked !== undefined) user.isAppLocked = isAppLocked;
    if (notifications !== undefined) user.notifications = notifications;
    if (disappearingMessages !== undefined) user.disappearingMessages = disappearingMessages;

    await user.save();
    res.json({ message: "Settings updated successfully", theme: user.theme, isAppLocked: user.isAppLocked, hasPin: !!user.appPin });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update Privacy Direct
exports.updatePrivacy = async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });
    const { lastSeen, profilePhoto, about, readReceipts, notifications } = req.body;
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.privacy) user.privacy = {};
    if (lastSeen !== undefined) user.privacy.lastSeen = lastSeen;
    if (profilePhoto !== undefined) user.privacy.profilePhoto = profilePhoto;
    if (about !== undefined) user.privacy.about = about;
    if (readReceipts !== undefined) user.privacy.readReceipts = readReceipts;
    if (notifications !== undefined) user.privacy.notifications = notifications;
    user.markModified('privacy');
    await user.save();

    res.json({ message: "Privacy settings updated", privacy: user.privacy });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

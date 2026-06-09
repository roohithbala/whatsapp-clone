const Session = require("../models/Session");
const User = require("../models/User");

// Get Active Sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({ lastActiveAt: -1 });
    res.json({
      currentSessionId: req.sessionId || null,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId, ipAddress: s.ipAddress, browser: s.browser, os: s.os,
        deviceType: s.deviceType, lastActiveAt: s.lastActiveAt, createdAt: s.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Revoke Specific Session
exports.revokeSession = async (req, res) => {
  try {
    const result = await Session.deleteOne({ sessionId: req.params.sessionId, userId: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Session not found" });
    res.json({ success: true, message: "Session revoked successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Revoke Other Sessions
exports.revokeOtherSessions = async (req, res) => {
  try {
    if (!req.sessionId) {
      return res.status(400).json({ error: "Cannot revoke other sessions from a legacy connection. Please re-login." });
    }
    await Session.deleteMany({ userId: req.userId, sessionId: { $ne: req.sessionId } });
    res.json({ success: true, message: "All other sessions revoked successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isOnline = false;
    user.refreshToken = null;
    await user.save();

    if (req.sessionId) {
      await Session.deleteOne({ sessionId: req.sessionId, userId: req.userId });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

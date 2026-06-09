const Report = require("../models/Report");
const User = require("../models/User");
const Session = require("../models/Session");
const Message = require("../models/Message");
const mongoose = require("mongoose");

// Get all reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).lean();
    
    // Manually populate reporter and target details
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        const [reporter, target] = await Promise.all([
          User.findOne({ userId: report.reporterId }).select("userId username email profilePicture").lean(),
          User.findOne({ userId: report.targetUserId }).select("userId username email profilePicture isSuspended").lean()
        ]);
        return {
          ...report,
          reporter: reporter || { username: "Unknown User", email: "" },
          target: target || { username: "Unknown User", email: "", isSuspended: false }
        };
      })
    );
    
    res.json(populatedReports);
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

// Resolve a report
exports.resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { actionTaken } = req.body;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    report.status = "resolved";
    if (actionTaken) report.actionTaken = actionTaken;
    await report.save();

    // Send a system message from admin to the reported user
    try {
      const adminUser = await User.findOne({ role: "admin" }).lean();
      const targetUser = await User.findOne({ userId: report.targetUserId }).lean();

      if (adminUser && targetUser) {
        const noticeText = actionTaken && actionTaken.trim()
          ? actionTaken.trim()
          : "Your account has been reviewed due to a reported violation. Our moderation team has taken appropriate action. Please ensure compliance with community guidelines.";

        const systemMsg = new Message({
          senderId: adminUser.userId,
          senderUsername: "WhatsApp Admin",
          receiverId: report.targetUserId,
          receiverUsername: targetUser.username,
          text: `⚠️ *Account Notice from Admin*\n\n${noticeText}`,
          messageType: "system",
          status: "sent",
        });
        await systemMsg.save();

        // Emit via Socket.IO so the message appears in real-time if user is online
        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        if (io) {
          const msgPayload = systemMsg.toObject();
          // Emit to the target user's socket(s)
          const targetSockets = onlineUsers?.get(report.targetUserId);
          if (targetSockets && targetSockets.size > 0) {
            targetSockets.forEach(socketId => {
              io.to(socketId).emit("receive-message", msgPayload);
            });
          }
        }
      }
    } catch (msgErr) {
      console.error("[Admin] Failed to send system notification to reported user:", msgErr);
      // Non-fatal — the report is still resolved
    }

    res.json({ message: "Report resolved successfully. Notification sent to reported user.", report });
  } catch (error) {
    console.error("Failed to resolve report:", error);
    res.status(500).json({ error: "Failed to resolve report" });
  }
};


// Toggle suspend status of a user
exports.toggleSuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (user.role === "admin") {
      return res.status(400).json({ error: "Administrators cannot be suspended." });
    }
    
    user.isSuspended = !user.isSuspended;
    await user.save();
    
    // If we suspend the user, kill all their active sessions immediately
    if (user.isSuspended) {
      await Session.deleteMany({ userId });
      // Notify active sockets via socket server (we can let the JWT verify token block them on next request)
    }
    
    res.json({
      message: `User status updated successfully. User is now ${user.isSuspended ? "suspended" : "active"}.`,
      isSuspended: user.isSuspended
    });
  } catch (error) {
    console.error("Failed to toggle suspension:", error);
    res.status(500).json({ error: "Failed to toggle user suspension" });
  }
};

// Get list of all users
exports.getUsersList = async (req, res) => {
  try {
    const users = await User.find().select("userId username email profilePicture status isOnline role isSuspended createdAt").sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users list:", error);
    res.status(500).json({ error: "Failed to fetch users list" });
  }
};

const Appeal = require("../models/Appeal");

// Get all ban appeals
exports.getAppeals = async (req, res) => {
  try {
    const appeals = await Appeal.find().sort({ createdAt: -1 }).lean();
    res.json(appeals);
  } catch (error) {
    console.error("Failed to fetch appeals:", error);
    res.status(500).json({ error: "Failed to fetch appeals" });
  }
};

// Approve appeal → unban user + system message
exports.approveAppeal = async (req, res) => {
  try {
    const { appealId } = req.params;
    const { adminNote } = req.body;

    const appeal = await Appeal.findById(appealId);
    if (!appeal) return res.status(404).json({ error: "Appeal not found" });
    if (appeal.status !== "pending") return res.status(400).json({ error: "Appeal already reviewed" });

    const user = await User.findOne({ userId: appeal.userId });
    if (user) { user.isSuspended = false; await user.save(); }

    appeal.status = "approved";
    appeal.adminNote = adminNote || "Your ban appeal has been approved.";
    await appeal.save();

    try {
      const adminUser = await User.findOne({ role: "admin" }).lean();
      if (adminUser && user) {
        const systemMsg = new Message({
          senderId: adminUser.userId, senderUsername: "WhatsApp Admin",
          receiverId: appeal.userId, receiverUsername: user.username,
          text: `✅ *Ban Appeal Approved*\n\n${appeal.adminNote}\n\nYour account has been reinstated. Welcome back!`,
          messageType: "system", status: "sent",
        });
        await systemMsg.save();
        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        const targetSockets = onlineUsers?.get(appeal.userId);
        if (io && targetSockets?.size > 0) {
          targetSockets.forEach(sid => io.to(sid).emit("receive-message", systemMsg.toObject()));
        }
      }
    } catch (msgErr) { console.error("[Admin] Appeal approval message failed:", msgErr); }

    res.json({ message: "Appeal approved. User has been unbanned.", appeal });
  } catch (error) {
    console.error("Failed to approve appeal:", error);
    res.status(500).json({ error: "Failed to approve appeal" });
  }
};

// Deny appeal → keep ban + system message
exports.denyAppeal = async (req, res) => {
  try {
    const { appealId } = req.params;
    const { adminNote } = req.body;

    const appeal = await Appeal.findById(appealId);
    if (!appeal) return res.status(404).json({ error: "Appeal not found" });
    if (appeal.status !== "pending") return res.status(400).json({ error: "Appeal already reviewed" });

    appeal.status = "denied";
    appeal.adminNote = adminNote || "Your appeal has been reviewed and denied. The suspension remains in place.";
    await appeal.save();

    try {
      const adminUser = await User.findOne({ role: "admin" }).lean();
      const targetUser = await User.findOne({ userId: appeal.userId }).lean();
      if (adminUser && targetUser) {
        const systemMsg = new Message({
          senderId: adminUser.userId, senderUsername: "WhatsApp Admin",
          receiverId: appeal.userId, receiverUsername: targetUser.username,
          text: `❌ *Ban Appeal Denied*\n\n${appeal.adminNote}`,
          messageType: "system", status: "sent",
        });
        await systemMsg.save();
      }
    } catch (msgErr) { console.error("[Admin] Appeal denial message failed:", msgErr); }

    res.json({ message: "Appeal denied. Ban remains.", appeal });
  } catch (error) {
    console.error("Failed to deny appeal:", error);
    res.status(500).json({ error: "Failed to deny appeal" });
  }
};


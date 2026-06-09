const Report = require("../models/Report");
const User = require("../models/User");
const Session = require("../models/Session");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const Group = require("../models/Group");
const Channel = require("../models/Channel");
const ChannelMessage = require("../models/ChannelMessage");
const Community = require("../models/Community");

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
    const { reason } = req.body;
    
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (user.role === "admin") {
      return res.status(400).json({ error: "Administrators cannot be suspended." });
    }
    
    user.isSuspended = !user.isSuspended;
    if (user.isSuspended) {
      user.suspensionReason = reason || "Violating community guidelines.";
    } else {
      user.suspensionReason = "";
    }
    await user.save();
    
    // If we suspend the user, kill all their active sessions immediately
    if (user.isSuspended) {
      await Session.deleteMany({ userId });
    }

    // ── Send email notification to the user ───────────────────────────────────
    try {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_PORT === "465",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      const isBanned = user.isSuspended;
      const subject = isBanned
        ? "⚠️ Your WhatsApp Clone account has been suspended"
        : "✅ Your WhatsApp Clone account has been reactivated";

      const html = isBanned
        ? `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:16px;overflow:hidden;border:1px solid #30363d;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#b91c1c,#7f1d1d);padding:32px 40px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">🚫</div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Account Suspended</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">WhatsApp Clone · Admin Action</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;color:#e6edf3;font-size:15px;">Hi <strong>${user.username}</strong>,</p>
            <p style="margin:0 0 20px;color:#8b949e;font-size:14px;line-height:1.6;">
              Your account on <strong style="color:#e6edf3;">WhatsApp Clone</strong> has been <strong style="color:#f85149;">suspended</strong> by an administrator. 
              You will not be able to log in or send messages until the suspension is lifted.
            </p>
            <!-- Reason box -->
            <div style="background:#1c2128;border:1px solid #30363d;border-left:4px solid #f85149;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 6px;color:#8b949e;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Reason for suspension</p>
              <p style="margin:0;color:#e6edf3;font-size:14px;line-height:1.5;">${user.suspensionReason}</p>
            </div>
            <p style="margin:0 0 16px;color:#8b949e;font-size:13px;line-height:1.6;">
              If you believe this is a mistake, you can submit a ban appeal through the app's login screen. 
              Appeals are reviewed by our moderation team within 24–48 hours.
            </p>
            <div style="background:#1c2128;border:1px solid #30363d;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
              <p style="margin:0;color:#8b949e;font-size:12px;">
                🕐 <strong style="color:#e6edf3;">Suspension date:</strong> ${new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0d1117;padding:20px 40px;text-align:center;border-top:1px solid #21262d;">
            <p style="margin:0;color:#484f58;font-size:12px;">This is an automated message from WhatsApp Clone. Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
        : `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:16px;overflow:hidden;border:1px solid #30363d;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#16a34a,#14532d);padding:32px 40px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">✅</div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Account Reactivated</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">WhatsApp Clone · Admin Action</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;color:#e6edf3;font-size:15px;">Hi <strong>${user.username}</strong>,</p>
            <p style="margin:0 0 20px;color:#8b949e;font-size:14px;line-height:1.6;">
              Great news! Your account on <strong style="color:#e6edf3;">WhatsApp Clone</strong> has been 
              <strong style="color:#3fb950;">reactivated</strong> by an administrator. 
              You can now log in and use the app normally.
            </p>
            <div style="background:#1c2128;border:1px solid #30363d;border-left:4px solid #3fb950;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;color:#8b949e;font-size:13px;line-height:1.6;">
                Please ensure you review and follow our community guidelines to avoid future actions on your account.
              </p>
            </div>
            <div style="background:#1c2128;border:1px solid #30363d;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
              <p style="margin:0;color:#8b949e;font-size:12px;">
                🕐 <strong style="color:#e6edf3;">Reactivated on:</strong> ${new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0d1117;padding:20px 40px;text-align:center;border-top:1px solid #21262d;">
            <p style="margin:0;color:#484f58;font-size:12px;">This is an automated message from WhatsApp Clone. Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      await transporter.sendMail({
        from: `"WhatsApp Clone" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html,
      });

      console.log(`[Admin] Suspension email sent to ${user.email} (suspended=${isBanned})`);
    } catch (emailErr) {
      // Don't fail the whole action if email fails — just log it
      console.error("[Admin] Failed to send suspension email:", emailErr.message);
    }
    // ─────────────────────────────────────────────────────────────────────────
    
    res.json({
      message: `User status updated successfully. User is now ${user.isSuspended ? "suspended" : "active"}.`,
      isSuspended: user.isSuspended,
      suspensionReason: user.suspensionReason
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

// ── Chat Monitoring ──────────────────────────────────────────────────────────

// Get all conversation partners for a user (with last message + unread count)
exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all unique partner IDs this user has talked to
    const sent     = await Message.distinct("receiverId", { senderId: userId, isGroup: false });
    const received = await Message.distinct("senderId",   { receiverId: userId, isGroup: false });
    const partnerIds = [...new Set([...sent, ...received])].filter(id => id !== userId);

    // For each partner get last message + message count
    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const partner = await User.findOne({ userId: partnerId })
          .select("userId username email profilePicture isOnline")
          .lean();

        const lastMsg = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
          isGroup: false,
        }).sort({ createdAt: -1 }).lean();

        const totalMessages = await Message.countDocuments({
          $or: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
          isGroup: false,
        });

        return {
          partner: partner || { userId: partnerId, username: "Deleted User", email: "" },
          lastMessage: lastMsg,
          totalMessages,
        };
      })
    );

    // Sort by last message date desc
    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || 0;
      const bTime = b.lastMessage?.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    res.json(conversations);
  } catch (error) {
    console.error("Failed to fetch user conversations:", error);
    res.status(500).json({ error: "Failed to fetch user conversations" });
  }
};

// Get full message thread between two users
exports.getConversationThread = async (req, res) => {
  try {
    const { userId, partnerId } = req.params;
    const limit  = Math.min(parseInt(req.query.limit  || "100"), 500);
    const before = req.query.before; // ISO date for pagination

    const query = {
      $or: [
        { senderId: userId,    receiverId: partnerId },
        { senderId: partnerId, receiverId: userId    },
      ],
      isGroup: false,
    };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(messages.reverse()); // chronological order
  } catch (error) {
    console.error("Failed to fetch conversation thread:", error);
    res.status(500).json({ error: "Failed to fetch conversation thread" });
  }
};
// ── Admin Message Actions ─────────────────────────────────────────────────────

// Hard-delete a specific message (admin only — silent, no trace)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    let msg = await Message.findByIdAndDelete(messageId);
    if (!msg) {
      msg = await ChannelMessage.findByIdAndDelete(messageId);
    }
    if (!msg) return res.status(404).json({ error: "Message not found" });
    res.json({ message: "Message permanently deleted." });
  } catch (error) {
    console.error("Failed to delete message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

// Silent ban: suspend the user + send a generic "community action" system message
// The user has no idea the admin was monitoring their chat — message reads as automated
exports.silentBanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "admin") return res.status(400).json({ error: "Administrators cannot be banned." });

    // Suspend account
    user.isSuspended = true;
    user.suspensionReason = reason || "Violation of community guidelines.";
    await user.save();

    // Kill all active sessions immediately
    await Session.deleteMany({ userId });

    // Send a generic automated-looking system message from "WhatsApp"
    // so the user doesn't know admin was monitoring their DMs
    try {
      const adminUser = await User.findOne({ role: "admin" }).lean();
      if (adminUser) {
        const banMsg = new Message({
          senderId: adminUser.userId,
          senderUsername: "WhatsApp",
          receiverId: userId,
          receiverUsername: user.username,
          text: `🚫 *Account Action*\n\nYour account has been temporarily suspended due to:\n\n"${user.suspensionReason}"\n\nThis action was taken automatically by our community safety systems. If you believe this is an error, you may submit a reconsideration request through the app.`,
          messageType: "system",
          status: "sent",
        });
        await banMsg.save();

        // Real-time push if user is still connected
        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        if (io && onlineUsers) {
          const sockets = onlineUsers.get(userId);
          if (sockets && sockets.size > 0) {
            sockets.forEach(sid => io.to(sid).emit("receive-message", banMsg.toObject()));
          }
        }
      }
    } catch (msgErr) {
      console.error("[Admin] Failed to send silent ban system message:", msgErr);
    }

    res.json({
      message: `User ${user.username} has been silently suspended.`,
      isSuspended: true,
      suspensionReason: user.suspensionReason,
    });
  } catch (error) {
    console.error("Silent ban failed:", error);
    res.status(500).json({ error: "Failed to silently ban user" });
  }
};

// ── Group, Community & Channel Monitoring Endpoints ─────────────────────────

// GET all groups (including community groups)
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().sort({ updatedAt: -1 }).lean();
    
    // Enrich with community name if applicable
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        const community = await Community.findOne({ groups: group._id }).select("name").lean();
        
        const lastMessage = await Message.findOne({ receiverId: group.groupId, isGroup: true })
          .sort({ createdAt: -1 })
          .lean();
          
        return {
          ...group,
          communityName: community ? community.name : null,
          lastMessage,
          memberCount: group.members ? group.members.length : 0
        };
      })
    );
    res.json(enrichedGroups);
  } catch (error) {
    console.error("Failed to get all groups:", error);
    res.status(500).json({ error: "Failed to get all groups" });
  }
};

// GET messages in a group
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({ receiverId: groupId, isGroup: true })
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch group messages:", error);
    res.status(500).json({ error: "Failed to fetch group messages" });
  }
};

// GET group members list
exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findOne({ $or: [{ groupId }, { _id: groupId }] }).lean();
    if (!group) return res.status(404).json({ error: "Group not found" });
    
    const memberDetails = await User.find({ userId: { $in: group.members } })
      .select("userId username email profilePicture isOnline role isSuspended")
      .lean();
      
    res.json(memberDetails.map(m => ({
      ...m,
      isAdmin: group.adminIds.includes(m.userId)
    })));
  } catch (error) {
    console.error("Failed to get group members:", error);
    res.status(500).json({ error: "Failed to get group members" });
  }
};

// REMOVE member from a group (silent kick)
exports.removeGroupMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findOne({ $or: [{ groupId }, { _id: groupId }] });
    if (!group) return res.status(404).json({ error: "Group not found" });
    
    group.members = group.members.filter(id => id !== userId);
    group.adminIds = group.adminIds.filter(id => id !== userId);
    await group.save();
    
    res.json({ message: "Member removed from group successfully", group });
  } catch (error) {
    console.error("Failed to remove group member:", error);
    res.status(500).json({ error: "Failed to remove group member" });
  }
};

// GET all channels
exports.getAllChannels = async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: -1 }).lean();
    const enrichedChannels = await Promise.all(
      channels.map(async (channel) => {
        const lastMessage = await ChannelMessage.findOne({ channelId: channel.channelId })
          .sort({ createdAt: -1 })
          .lean();
        return {
          ...channel,
          lastMessage,
          followerCount: channel.followers ? channel.followers.length : 0
        };
      })
    );
    res.json(enrichedChannels);
  } catch (error) {
    console.error("Failed to get all channels:", error);
    res.status(500).json({ error: "Failed to get all channels" });
  }
};

// GET channel messages
exports.getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const messages = await ChannelMessage.find({ channelId })
      .sort({ createdAt: 1 })
      .lean();
    // Normalize text alias for UI consistency
    const normalized = messages.map(m => ({
      ...m,
      text: m.content || "",
    }));
    res.json(normalized);
  } catch (error) {
    console.error("Failed to fetch channel messages:", error);
    res.status(500).json({ error: "Failed to fetch channel messages" });
  }
};

// GET channel followers
exports.getChannelFollowers = async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findOne({ channelId }).lean();
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    
    const followerDetails = await User.find({ userId: { $in: channel.followers } })
      .select("userId username email profilePicture isOnline role isSuspended")
      .lean();
      
    res.json(followerDetails.map(f => ({
      ...f,
      isAdmin: String(channel.adminId) === String(f.userId) || (channel.admins && channel.admins.includes(String(f.userId)))
    })));
  } catch (error) {
    console.error("Failed to get channel followers:", error);
    res.status(500).json({ error: "Failed to get channel followers" });
  }
};

// REMOVE follower from channel (silent kick)
exports.removeChannelFollower = async (req, res) => {
  try {
    const { channelId, userId } = req.params;
    const channel = await Channel.findOne({ channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    
    channel.followers = channel.followers.filter(id => id !== userId);
    channel.admins = channel.admins.filter(id => id !== userId);
    await channel.save();
    
    res.json({ message: "Follower removed from channel successfully", channel });
  } catch (error) {
    console.error("Failed to remove channel follower:", error);
    res.status(500).json({ error: "Failed to remove channel follower" });
  }
};



const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const ChatSetting = require("../models/ChatSetting");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

const calculateExpiryDate = (duration) => {
  if (!duration || duration === "off") return null;
  const now = Date.now();
  if (duration === "24h") return new Date(now + 24 * 60 * 60 * 1000);
  if (duration === "7d") return new Date(now + 7 * 24 * 60 * 60 * 1000);
  if (duration === "90d") return new Date(now + 90 * 24 * 60 * 60 * 1000);
  return null;
};

// GET DISAPPEARING SETTING FOR A CHAT
router.get("/disappearing/:chatId", verifyToken, async (req, res) => {
  try {
    const setting = await ChatSetting.findOne({ chatId: req.params.chatId });
    res.json({ disappearingMessages: setting ? setting.disappearingMessages : "off" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE DISAPPEARING SETTING FOR A CHAT
router.post("/disappearing", verifyToken, async (req, res) => {
  try {
    const { receiverId, isGroup, duration } = req.body;
    const senderId = req.userId;

    if (!receiverId || !duration) {
      return res.status(400).json({ error: "receiverId and duration are required" });
    }

    const validDurations = ["off", "24h", "7d", "90d"];
    if (!validDurations.includes(duration)) {
      return res.status(400).json({ error: "Invalid duration value" });
    }

    const chatId = isGroup ? receiverId : [senderId, receiverId].sort().join('_');

    const setting = await ChatSetting.findOneAndUpdate(
      { chatId },
      { disappearingMessages: duration },
      { new: true, upsert: true }
    );

    const sender = await User.findOne({ userId: senderId });
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    let displayText = "";
    if (duration === "off") {
      displayText = `${sender.username} turned off disappearing messages.`;
    } else {
      const displayDurations = { "24h": "24 hours", "7d": "7 days", "90d": "90 days" };
      displayText = `${sender.username} set messages to disappear after ${displayDurations[duration]}.`;
    }

    const systemMessage = new Message({
      senderId,
      senderUsername: "System",
      receiverId,
      text: displayText,
      messageType: "system",
      isGroup: !!isGroup,
      status: "seen"
    });

    await systemMessage.save();

    // Emit to both parties via server-side socket
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    if (io && onlineUsers) {
      const msgPayload = systemMessage.toObject();
      msgPayload._id = systemMessage._id.toString();

      const settingPayload = { chatId, duration };

      if (isGroup) {
        io.to(receiverId).emit("receiveMessage", msgPayload);
        io.to(receiverId).emit("disappearingSettingChanged", settingPayload);
      } else {
        const senderSockets = onlineUsers.get(senderId) || new Set();
        const receiverSockets = onlineUsers.get(receiverId) || new Set();
        senderSockets.forEach(id => io.to(id).emit("receiveMessage", msgPayload));
        senderSockets.forEach(id => io.to(id).emit("disappearingSettingChanged", settingPayload));
        receiverSockets.forEach(id => io.to(id).emit("receiveMessage", msgPayload));
        receiverSockets.forEach(id => io.to(id).emit("disappearingSettingChanged", settingPayload));
      }
    }

    res.json({
      success: true,
      disappearingMessages: setting.disappearingMessages,
      systemMessage
    });
  } catch (err) {
    console.error("Error setting disappearing messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// TOGGLE STAR MESSAGE
router.post("/toggle-star/:messageId", verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const isStarred = message.starredBy.includes(req.userId);
    if (isStarred) {
      message.starredBy = message.starredBy.filter(id => id !== req.userId);
    } else {
      message.starredBy.push(req.userId);
    }
    await message.save();
    res.json({ starred: !isStarred });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET STARRED MESSAGES
router.get("/starred", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ starredBy: req.userId }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET ALL CONVERSATIONS for a user (with last message and unread count)
router.get("/conversations/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: "Unauthorized" });

    const Group = require("../models/Group");
    const userGroups = await Group.find({ members: userId }).distinct("groupId");

    const messages = await Message.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { senderId: userId },
                { receiverId: userId },
                { receiverId: { $in: userGroups } }
              ]
            },
            {
              $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
              ]
            }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$isGroup", true] },
              "$receiverId",
              {
                $cond: [
                  { $eq: ["$senderId", userId] },
                  "$receiverId",
                  "$senderId"
                ]
              }
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", userId] },
                    { $ne: ["$status", "seen"] },
                    { $ne: ["$senderId", userId] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Fetch active ChatSettings to attach disappearing duration
    const chatIds = messages.map(c => {
      const isGroupMsg = c.lastMessage.isGroup;
      return isGroupMsg ? c._id.toString() : [userId, c._id.toString()].sort().join('_');
    });

    const settings = await ChatSetting.find({ chatId: { $in: chatIds } });
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.chatId] = s.disappearingMessages;
    });

    const responseData = messages.map(c => {
      const isGroupMsg = c.lastMessage.isGroup;
      const chatId = isGroupMsg ? c._id.toString() : [userId, c._id.toString()].sort().join('_');
      return {
        _id: c._id,
        lastMessage: c.lastMessage,
        unreadCount: c.unreadCount,
        disappearingMessages: settingsMap[chatId] || "off"
      };
    });

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET group messages — must be BEFORE /:senderId/:receiverId
router.get("/fetch-group/:groupId", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({
      receiverId: groupId,
      isGroup: true,
      hiddenFor: { $ne: req.userId },
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// REACT TO A MESSAGE  — MUST be before /:senderId/:receiverId catch-all
router.post("/react/:messageId", verifyToken, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Toggle: remove if same emoji already there from this user, else upsert
    const existingIdx = message.reactions.findIndex(r => r.userId === req.userId);
    if (existingIdx !== -1) {
      if (message.reactions[existingIdx].emoji === emoji) {
        message.reactions.splice(existingIdx, 1); // remove (toggle off)
      } else {
        message.reactions[existingIdx].emoji = emoji; // change emoji
      }
    } else {
      message.reactions.push({ userId: req.userId, emoji });
    }

    await message.save();
    res.json(message.reactions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE message (for me)
router.post("/delete-for-me/:messageId", verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (!message.hiddenFor.includes(req.userId)) {
      message.hiddenFor.push(req.userId);
      await message.save();
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// DELETE message (for everyone)
router.post("/delete-for-everyone/:messageId", verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.senderId !== req.userId) return res.status(403).json({ error: "Only sender can delete for everyone" });

    message.isDeleted = true;
    message.text = "This message was deleted";
    message.mediaUrl = null;
    message.encryptedContent = null;
    await message.save();
    res.json(message);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// LEGACY DELETE message
router.delete("/:messageId", verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.senderId === req.userId) {
      message.isDeleted = true;
      message.text = "This message was deleted";
      await message.save();
    } else {
      message.hiddenFor.push(req.userId);
      await message.save();
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// EDIT message
router.put("/:messageId", verifyToken, async (req, res) => {
  try {
    const { text, encryptedContent } = req.body;
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.senderId !== req.userId) return res.status(403).json({ error: "Cannot edit others messages" });

    message.isEdited = true;
    if (text) message.text = text;
    if (encryptedContent) message.encryptedContent = encryptedContent;

    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// SEND encrypted 1-on-1 message
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId, encryptedContent, iv, algorithm, replyTo, messageType, mediaUrl } = req.body;

    if (req.userId !== senderId) {
      return res.status(403).json({ error: "Unauthorized sender" });
    }

    if (!senderId || !receiverId || !encryptedContent || !iv) {
      return res.status(400).json({ error: "senderId, receiverId, encryptedContent, and iv are required" });
    }

    const [sender, receiver] = await Promise.all([
      User.findOne({ userId: senderId }).select("userId username"),
      User.findOne({ userId: receiverId }).select("userId username"),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "Sender or receiver not found" });
    }

    // Check custom disappearing messages setting
    const chatId = [senderId, receiverId].sort().join('_');
    const setting = await ChatSetting.findOne({ chatId });
    const duration = setting ? setting.disappearingMessages : "off";
    const expiresAt = calculateExpiryDate(duration);

    const message = new Message({
      senderId: sender.userId,
      senderUsername: sender.username,
      receiverId: receiver.userId,
      receiverUsername: receiver.username,
      encryptedContent,
      iv,
      algorithm: algorithm || "AES-GCM",
      replyTo: replyTo || null,
      messageType: messageType || "text",
      mediaUrl: mediaUrl || null,
      expiresAt,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error while sending message" });
  }
});

// BROADCAST messages
router.post("/broadcast", verifyToken, async (req, res) => {
  try {
    const { senderId, receiverIds, encryptedContent, iv, algorithm } = req.body;

    if (req.userId !== senderId) return res.status(403).json({ error: "Unauthorized sender" });
    if (!senderId || !Array.isArray(receiverIds) || !encryptedContent || !iv) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sender = await User.findOne({ userId: senderId }).select("userId username");
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    const receivers = await User.find({ userId: { $in: receiverIds } }).select("userId username");
    const messages = receivers.map(receiver => ({
      senderId: sender.userId,
      senderUsername: sender.username,
      receiverId: receiver.userId,
      receiverUsername: receiver.username,
      encryptedContent,
      iv,
      algorithm: algorithm || "AES-GCM",
    }));

    const inserted = await Message.insertMany(messages);
    res.status(201).json({ message: "Broadcast sent", count: inserted.length });
  } catch (error) {
    console.error("Error broadcasting:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Generic send (group or 1-on-1 plain text / media)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { receiverId, text, mediaUrl, isGroup, replyTo, messageType } = req.body;
    const senderId = req.userId;

    const sender = await User.findOne({ userId: senderId });
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    // Check custom disappearing messages setting
    const chatId = isGroup ? receiverId : [senderId, receiverId].sort().join('_');
    const setting = await ChatSetting.findOne({ chatId });
    const duration = setting ? setting.disappearingMessages : "off";
    const expiresAt = calculateExpiryDate(duration);

    const message = new Message({
      senderId,
      senderUsername: sender.username,
      receiverId,
      text,
      mediaUrl,
      isGroup: !!isGroup,
      replyTo: replyTo || null,
      messageType: messageType || "text",
      status: senderId === receiverId ? "seen" : "sent",
      expiresAt,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET 1-on-1 messages — MUST be last (catches /:senderId/:receiverId)
router.get("/:senderId/:receiverId", verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    if (req.userId !== senderId && req.userId !== receiverId) {
      return res.status(403).json({ error: "Unauthorized conversation access" });
    }

    const messages = await Message.find({
      $and: [
        {
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ]
        },
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ],
      hiddenFor: { $ne: req.userId }
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error while fetching messages" });
  }
});

module.exports = router;

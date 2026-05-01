const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send", verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId, encryptedContent, iv, algorithm } = req.body;

    if (req.userId !== senderId) {
      return res.status(403).json({ error: "Unauthorized sender" });
    }

    if (!senderId || !receiverId || !encryptedContent || !iv) {
      return res.status(400).json({
        error: "senderId, receiverId, encryptedContent, and iv are required",
      });
    }

    const [sender, receiver] = await Promise.all([
      User.findOne({ userId: senderId }).select("userId username"),
      User.findOne({ userId: receiverId }).select("userId username"),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "Sender or receiver not found" });
    }

    const message = new Message({
      senderId: sender.userId,
      senderUsername: sender.username,
      receiverId: receiver.userId,
      receiverUsername: receiver.username,
      encryptedContent,
      iv,
      algorithm: algorithm || "AES-GCM",
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error while sending message" });
  }
});

// BROADCAST messages to multiple users
router.post("/broadcast", verifyToken, async (req, res) => {
  try {
    const { senderId, receiverIds, encryptedContent, iv, algorithm } = req.body;

    if (req.userId !== senderId) {
      return res.status(403).json({ error: "Unauthorized sender" });
    }

    if (!senderId || !Array.isArray(receiverIds) || !encryptedContent || !iv) {
      return res.status(400).json({
        error: "senderId, receiverIds array, encryptedContent, and iv are required",
      });
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
    res.status(201).json({ message: "Broadcast sent", count: inserted.length, messages: inserted });
  } catch (error) {
    console.error("Error broadcasting message:", error);
    res.status(500).json({ error: "Server error while broadcasting message" });
  }
});

router.get("/:senderId/:receiverId", verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    if (req.userId !== senderId && req.userId !== receiverId) {
      return res.status(403).json({ error: "Unauthorized conversation access" });
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error while fetching messages" });
  }
});

// GET ALL CONVERSATIONS for a user (with last message and unread count)
router.get("/conversations/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: "Unauthorized" });

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", userId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiverId", userId] },
                  { $ne: ["$status", "seen"] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json(messages);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

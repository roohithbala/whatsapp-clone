const Message = require("../models/Message");
const ChatSetting = require("../models/ChatSetting");

// GET ALL CONVERSATIONS for a user (with last message and unread count)
exports.getConversations = async (req, res) => {
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
            },
            {
              hiddenFor: { $ne: userId }
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
};

// CLEAR CHAT (hide all messages in a chat for the current user)
exports.clearChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    let query = {};
    if (chatId.includes("_")) {
      const [id1, id2] = chatId.split("_");
      if (userId !== id1 && userId !== id2) return res.status(403).json({ error: "Unauthorized" });
      query = {
        isGroup: false,
        $or: [
          { senderId: id1, receiverId: id2 },
          { senderId: id2, receiverId: id1 }
        ]
      };
    } else {
      query = { isGroup: true, receiverId: chatId };
    }

    await Message.updateMany(
      { ...query, hiddenFor: { $ne: userId } },
      { $push: { hiddenFor: userId } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

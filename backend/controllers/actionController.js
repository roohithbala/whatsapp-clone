const Message = require("../models/Message");

// TOGGLE STAR MESSAGE
exports.toggleStarMessage = async (req, res) => {
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
};

// GET STARRED MESSAGES
exports.getStarredMessages = async (req, res) => {
  try {
    const messages = await Message.find({ starredBy: req.userId }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// REACT TO A MESSAGE
exports.reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const existingIdx = message.reactions.findIndex(r => r.userId === req.userId);
    if (existingIdx !== -1) {
      if (message.reactions[existingIdx].emoji === emoji) {
        message.reactions.splice(existingIdx, 1);
      } else {
        message.reactions[existingIdx].emoji = emoji;
      }
    } else {
      message.reactions.push({ userId: req.userId, emoji });
    }

    await message.save();
    res.json(message.reactions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE message (for me)
exports.deleteMessageForMe = async (req, res) => {
  try {
    let message = await Message.findById(req.params.messageId);
    if (!message) {
      const ChannelMessage = require("../models/ChannelMessage");
      message = await ChannelMessage.findById(req.params.messageId);
      // For channel messages, we can just hide it for this user
      if (message) {
        if (!message.hiddenFor) message.hiddenFor = [];
        if (!message.hiddenFor.includes(req.userId)) {
          message.hiddenFor.push(req.userId);
          await message.save();
        }
        return res.json({ success: true });
      }
      return res.status(404).json({ error: "Message not found" });
    }
    if (!message.hiddenFor.includes(req.userId)) {
      message.hiddenFor.push(req.userId);
      await message.save();
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
};

// DELETE message (for everyone)
exports.deleteMessageForEveryone = async (req, res) => {
  try {
    let message = await Message.findById(req.params.messageId);
    if (!message) {
      const ChannelMessage = require("../models/ChannelMessage");
      const Channel = require("../models/Channel");
      message = await ChannelMessage.findById(req.params.messageId);
      if (!message) return res.status(404).json({ error: "Message not found" });

      const channel = await Channel.findOne({ channelId: message.channelId });
      if (!channel) return res.status(404).json({ error: "Channel not found" });

      const isChannelAdmin = String(channel.adminId) === String(req.userId) || 
                             (channel.admins && channel.admins.includes(String(req.userId)));
      if (!isChannelAdmin) {
        return res.status(403).json({ error: "Only channel admins can delete messages for everyone" });
      }

      message.isDeleted = true;
      message.content = "This message was deleted";
      message.mediaUrl = null;
      await message.save();
      return res.json(message);
    }

    if (message.isGroup) {
      const Group = require("../models/Group");
      const group = await Group.findOne({ $or: [{ groupId: message.receiverId }, { _id: message.receiverId }] });
      const isGroupAdmin = group && group.adminIds && group.adminIds.includes(req.userId);
      const isSender = message.senderId === req.userId;

      if (!isSender && !isGroupAdmin) {
        return res.status(403).json({ error: "Only sender or group admin can delete for everyone" });
      }
    } else {
      if (message.senderId !== req.userId) return res.status(403).json({ error: "Only sender can delete for everyone" });
    }

    message.isDeleted = true;
    message.text = "This message was deleted";
    message.mediaUrl = null;
    message.encryptedContent = null;
    await message.save();
    res.json(message);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
};

// LEGACY DELETE message
exports.legacyDeleteMessage = async (req, res) => {
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
};

// EDIT message
exports.editMessage = async (req, res) => {
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
};

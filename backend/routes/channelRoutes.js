const express = require("express");
const Channel = require("../models/Channel");
const ChannelMessage = require("../models/ChannelMessage");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

// GET all channels
router.get("/", verifyToken, async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: -1 });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET a specific channel by ID
router.get("/:channelId", verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelId: req.params.channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE a channel
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description, avatarUrl } = req.body;
    
    if (!name) return res.status(400).json({ error: "Channel name is required" });

    const channel = new Channel({
      name,
      description,
      avatarUrl,
      adminId: req.userId, // creator is admin
      admins: [req.userId], // creator is also in co-admins array
      followers: [req.userId] // creator auto-follows
    });

    await channel.save();
    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// FOLLOW / UNFOLLOW a channel
router.post("/:channelId/follow", verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelId: req.params.channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const isFollowing = channel.followers.includes(req.userId);
    
    if (isFollowing) {
      // Unfollow
      channel.followers = channel.followers.filter(id => id !== req.userId);
    } else {
      // Follow
      channel.followers.push(req.userId);
    }

    await channel.save();
    res.json({ message: isFollowing ? "Unfollowed" : "Followed", channel });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET channel messages
router.get("/:channelId/messages", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const channelId = req.params.channelId;
    const now = new Date();

    // Mark undelivered channel messages as delivered for this user
    await ChannelMessage.updateMany(
      { channelId, "userDeliveryList.userId": { $ne: userId } },
      { $push: { userDeliveryList: { userId, deliveredAt: now } } }
    );

    // Mark unseen channel messages as seen for this user
    await ChannelMessage.updateMany(
      { channelId, "userSeenList.userId": { $ne: userId } },
      { $push: { userSeenList: { userId, seenAt: now } } }
    );

    const messages = await ChannelMessage.find({ 
      channelId,
      hiddenFor: { $ne: userId }
    }).sort({ createdAt: 1 });

    // Normalize: add text alias for content so frontend renders uniformly
    const normalized = messages.map(m => ({
      ...m.toObject(),
      text: m.content || '',
    }));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST a message to a channel (Admins only)
router.post("/:channelId/messages", verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelId: req.params.channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    // Check if the sender is the creator or in the admins array
    const isChannelAdmin = String(channel.adminId) === String(req.userId) || 
                           (channel.admins && channel.admins.includes(String(req.userId)));
    if (!isChannelAdmin) {
      return res.status(403).json({ error: "Only admins can post messages" });
    }

    const { content, mediaUrl, messageType } = req.body;
    if (!content && !mediaUrl) {
      return res.status(400).json({ error: "Content or mediaUrl is required" });
    }

    const message = new ChannelMessage({
      channelId: channel.channelId,
      content,
      mediaUrl,
      messageType: messageType || "text"
    });

    await message.save();

    // Normalize: add text alias so frontend renders uniformly
    const responseMsg = {
      ...message.toObject(),
      text: content || '',
      senderId: req.userId,
    };

    res.status(201).json(responseMsg);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE channel details
router.put("/:channelId", verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelId: req.params.channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const isChannelAdmin = String(channel.adminId) === String(req.userId) ||
                           (channel.admins && channel.admins.includes(String(req.userId)));
    if (!isChannelAdmin) {
      return res.status(403).json({ error: "Only admins can update channel details" });
    }

    const { name, description, avatarUrl } = req.body;
    if (name) channel.name = name;
    if (description !== undefined) channel.description = description;
    if (avatarUrl !== undefined) channel.avatarUrl = avatarUrl;

    await channel.save();
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADD/PROMOTE channel admin
router.post("/:channelId/admins", verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelId: req.params.channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const isChannelAdmin = String(channel.adminId) === String(req.userId) ||
                           (channel.admins && channel.admins.includes(String(req.userId)));
    if (!isChannelAdmin) {
      return res.status(403).json({ error: "Only admins can add admins" });
    }

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    // Initialize admins if it doesn't exist
    if (!channel.admins || channel.admins.length === 0) {
      channel.admins = [channel.adminId];
    }

    const userIdStr = String(userId);
    if (!channel.admins.includes(userIdStr)) {
      channel.admins.push(userIdStr);
    }

    // Ensure the new admin is also a follower
    if (!channel.followers.includes(userIdStr)) {
      channel.followers.push(userIdStr);
    }

    await channel.save();
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// REMOVE/DEMOTE channel admin
router.delete("/:channelId/admins/:userId", verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelId: req.params.channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const isChannelAdmin = String(channel.adminId) === String(req.userId) ||
                           (channel.admins && channel.admins.includes(String(req.userId)));
    if (!isChannelAdmin) {
      return res.status(403).json({ error: "Only admins can remove admins" });
    }

    const targetUserId = String(req.params.userId);
    if (targetUserId === String(channel.adminId)) {
      return res.status(400).json({ error: "Cannot demote the channel owner/creator" });
    }

    // Initialize admins if it doesn't exist
    if (!channel.admins || channel.admins.length === 0) {
      channel.admins = [channel.adminId];
    }

    channel.admins = channel.admins.filter(id => String(id) !== targetUserId);

    await channel.save();
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

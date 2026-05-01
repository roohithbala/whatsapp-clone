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
    const messages = await ChannelMessage.find({ channelId: req.params.channelId })
                                         .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST a message to a channel (Admins only)
router.post("/:channelId/messages", verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelId: req.params.channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    if (channel.adminId !== req.userId) {
      return res.status(403).json({ error: "Only admins can post messages" });
    }

    const { content, mediaUrl } = req.body;
    if (!content && !mediaUrl) {
      return res.status(400).json({ error: "Content or mediaUrl is required" });
    }

    const message = new ChannelMessage({
      channelId: channel.channelId,
      content,
      mediaUrl
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

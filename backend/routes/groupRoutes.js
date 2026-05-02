const express = require("express");
const Group = require("../models/Group");
const Message = require("../models/Message"); // Reusing Message for groups by treating receiverId as groupId
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

// GET all groups the user is a member of
router.get("/", verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.userId }).sort({ updatedAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET group details
router.get("/:groupId", verifyToken, async (req, res) => {
  try {
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    if (!group) return res.status(404).json({ error: "Group not found" });
    
    if (!group.members.includes(req.userId)) {
      return res.status(403).json({ error: "Not a member" });
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE a new group
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description, avatarUrl, memberIds } = req.body;
    
    if (!name) return res.status(400).json({ error: "Group name is required" });
    
    const members = memberIds || [];
    if (!members.includes(req.userId)) members.push(req.userId);

    const group = new Group({
      name,
      description,
      avatarUrl,
      adminIds: [req.userId],
      members
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADD member to group
router.post("/:groupId/members", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.adminIds.includes(req.userId)) return res.status(403).json({ error: "Only admins can add members" });
    
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// REMOVE member or LEAVE group
router.delete("/:groupId/members/:userId", verifyToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    
    if (!group) return res.status(404).json({ error: "Group not found" });
    
    // Can only remove if admin OR if removing self (leaving)
    if (targetUserId !== req.userId && !group.adminIds.includes(req.userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    group.members = group.members.filter(id => id !== targetUserId);
    group.adminIds = group.adminIds.filter(id => id !== targetUserId);
    
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// PROMOTE to admin
router.post("/:groupId/promote", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.adminIds.includes(req.userId)) return res.status(403).json({ error: "Only admins can promote" });
    
    if (!group.adminIds.includes(userId)) {
      group.adminIds.push(userId);
      await group.save();
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// DEMOTE from admin
router.post("/:groupId/demote", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.adminIds.includes(req.userId)) return res.status(403).json({ error: "Only admins can demote" });
    
    group.adminIds = group.adminIds.filter(id => id !== userId);
    await group.save();
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE group info
router.put("/:groupId", verifyToken, async (req, res) => {
  try {
    const { name, description, avatarUrl } = req.body;
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.adminIds.includes(req.userId)) return res.status(403).json({ error: "Only admins can update group info" });
    
    if (name) group.name = name;
    if (description) group.description = description;
    if (avatarUrl) group.avatarUrl = avatarUrl;
    
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

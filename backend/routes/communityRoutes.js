const express = require("express");
const router = express.Router();
const Community = require("../models/Community");
const Group = require("../models/Group");
const { verifyToken } = require("../middleware/authMiddleware");

// Create a community
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Community name is required" });

    const generalGroup = new Group({
      name: `${name} (General)`,
      description: `Official group for ${name}`,
      members: [req.userId],
      adminIds: [req.userId],
      isCommunityGroup: true
    });
    await generalGroup.save();

    const community = new Community({
      name: name.trim(),
      description: description || "",
      creatorId: req.userId,
      announcementGroupId: generalGroup._id,
      groups: [generalGroup._id]
    });
    await community.save();

    const populated = await Community.findById(community._id)
      .populate("announcementGroupId")
      .populate("groups");
    res.status(201).json(populated);
  } catch (err) {
    console.error("Create community error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get my communities (where I'm a member or creator)
router.get("/my", verifyToken, async (req, res) => {
  try {
    const myGroupIds = await Group.find({ members: req.userId }).distinct("_id");

    const communities = await Community.find({
      $or: [
        { creatorId: req.userId },
        { groups: { $in: myGroupIds } }
      ]
    })
      .populate("announcementGroupId")
      .populate("groups");

    res.json(communities);
  } catch (err) {
    console.error("Get communities error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get a single community by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("announcementGroupId")
      .populate("groups");
    if (!community) return res.status(404).json({ message: "Community not found" });
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new group inside a community
router.post("/:id/create-group", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Group name is required" });

    // Support both MongoDB _id and string id
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });
    if (community.creatorId !== req.userId) {
      return res.status(403).json({ message: "Only community creator can add groups" });
    }

    const newGroup = new Group({
      name: name.trim(),
      description: description || "",
      members: [req.userId],
      adminIds: [req.userId],
      isCommunityGroup: true
    });
    await newGroup.save();

    community.groups.push(newGroup._id);
    await community.save();

    const populated = await Community.findById(community._id)
      .populate("announcementGroupId")
      .populate("groups");
    res.status(201).json(populated);
  } catch (err) {
    console.error("Create group in community error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Add an existing group to a community
router.post("/:id/add-group", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.body; // groupId (the Group's groupId field)

    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });
    if (community.creatorId !== req.userId) {
      return res.status(403).json({ message: "Only community creator can add groups" });
    }

    // Find group by groupId string or _id
    const group = await Group.findOne({ $or: [{ groupId }, { _id: groupId }] });
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Add user to group members if not already
    if (!group.members.includes(req.userId)) {
      group.members.push(req.userId);
      await group.save();
    }

    // Add group to community if not already there
    const alreadyIn = community.groups.some(g => g.toString() === group._id.toString());
    if (!alreadyIn) {
      community.groups.push(group._id);
      await community.save();
    }

    const populated = await Community.findById(community._id)
      .populate("announcementGroupId")
      .populate("groups");
    res.json(populated);
  } catch (err) {
    console.error("Add group to community error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Join a community
router.post("/:id/join", verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate("groups");
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Add user to all groups in community
    for (const group of community.groups) {
      if (!group.members.includes(req.userId)) {
        group.members.push(req.userId);
        await group.save();
      }
    }
    res.json({ message: "Joined community successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add member to community (Admin only)
router.post("/:id/members", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const community = await Community.findById(req.params.id).populate("groups");
    if (!community) return res.status(404).json({ message: "Community not found" });
    if (community.creatorId !== req.userId) return res.status(403).json({ message: "Only creator can add members" });

    for (const group of community.groups) {
      if (!group.members.includes(userId)) {
        group.members.push(userId);
        await group.save();
      }
    }
    res.json({ message: "Member added to community" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a community
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });
    if (community.creatorId !== req.userId) return res.status(403).json({ message: "Only creator can delete" });

    await Community.findByIdAndDelete(req.params.id);
    res.json({ message: "Community deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

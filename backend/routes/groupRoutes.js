const express = require("express");
const Group = require("../models/Group");
const Message = require("../models/Message"); // Reusing Message for groups by treating receiverId as groupId
const JoinRequest = require("../models/JoinRequest");
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
    const { name, description, avatarUrl, onlyAdminsCanPost } = req.body;
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.adminIds.includes(req.userId)) return res.status(403).json({ error: "Only admins can update group info" });
    
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (avatarUrl !== undefined) group.avatarUrl = avatarUrl;
    if (onlyAdminsCanPost !== undefined) group.onlyAdminsCanPost = onlyAdminsCanPost;
    
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET INVITE LINK
router.get("/:groupId/invite", verifyToken, async (req, res) => {
  try {
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.members.includes(req.userId)) return res.status(403).json({ error: "Not a member" });

    if (!group.inviteCode) {
      group.inviteCode = Math.random().toString(36).substring(2, 12).toUpperCase();
      await group.save();
    }

    res.json({ inviteCode: group.inviteCode });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// JOIN GROUP VIA INVITE CODE
router.post("/join/:inviteCode", verifyToken, async (req, res) => {
  try {
    const group = await Group.findOne({ inviteCode: req.params.inviteCode.toUpperCase() });
    if (!group) return res.status(404).json({ error: "Invalid invite code" });

    if (!group.members.includes(req.userId)) {
      group.members.push(req.userId);
      await group.save();
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET pending join requests for a group (admin only)
router.get("/:groupId/invite-requests", verifyToken, async (req, res) => {
  try {
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.adminIds.includes(req.userId)) {
      return res.status(403).json({ error: "Only admins can view pending requests" });
    }

    const requests = await JoinRequest.find({ groupId: group.groupId, status: "pending" });
    const userIds = [
      ...new Set([
        ...requests.map(r => r.requestedUserId),
        ...requests.map(r => r.requestedBy)
      ])
    ];

    const User = require("../models/User");
    const users = await User.find({ userId: { $in: userIds } }, "userId username email profilePicture status");
    const userMap = {};
    users.forEach(u => {
      userMap[u.userId] = u;
    });

    const populatedRequests = requests.map(r => ({
      ...r.toObject(),
      requestedUser: userMap[r.requestedUserId] || { userId: r.requestedUserId, username: "Unknown User" },
      requestedByUser: userMap[r.requestedBy] || { userId: r.requestedBy, username: "Unknown User" }
    }));

    res.json(populatedRequests);
  } catch (error) {
    console.error("Error fetching invite requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE a pending join request (any group member can request)
router.post("/:groupId/invite-requests", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Target userId is required" });

    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Check if requester is a member of the group
    if (!group.members.includes(req.userId)) {
      return res.status(403).json({ error: "Not authorized. Only group members can invite others." });
    }

    // Check if target is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ error: "User is already a member of this group" });
    }

    // Check if there is already a pending request for this user
    const existingRequest = await JoinRequest.findOne({
      groupId: group.groupId,
      requestedUserId: userId,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Invite request is already pending for this user" });
    }

    const joinReq = new JoinRequest({
      groupId: group.groupId,
      requestedUserId: userId,
      requestedBy: req.userId,
      status: "pending"
    });

    await joinReq.save();
    res.status(201).json(joinReq);
  } catch (error) {
    console.error("Error creating invite request:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// APPROVE a pending request (admin only)
router.post("/:groupId/invite-requests/:requestId/approve", verifyToken, async (req, res) => {
  try {
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.adminIds.includes(req.userId)) {
      return res.status(403).json({ error: "Only admins can approve requests" });
    }

    const joinReq = await JoinRequest.findOne({ requestId: req.params.requestId, groupId: group.groupId });
    if (!joinReq) return res.status(404).json({ error: "Request not found" });
    if (joinReq.status !== "pending") {
      return res.status(400).json({ error: `Request already ${joinReq.status}` });
    }

    // Update request status
    joinReq.status = "approved";
    await joinReq.save();

    // Add user to group members if not already
    if (!group.members.includes(joinReq.requestedUserId)) {
      group.members.push(joinReq.requestedUserId);
      await group.save();
    }

    res.json({ message: "Request approved and user added to group", group });
  } catch (error) {
    console.error("Error approving invite request:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// REJECT a pending request (admin only)
router.post("/:groupId/invite-requests/:requestId/reject", verifyToken, async (req, res) => {
  try {
    const group = await Group.findOne({ $or: [{ groupId: req.params.groupId }, { _id: req.params.groupId }] });
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.adminIds.includes(req.userId)) {
      return res.status(403).json({ error: "Only admins can reject requests" });
    }

    const joinReq = await JoinRequest.findOne({ requestId: req.params.requestId, groupId: group.groupId });
    if (!joinReq) return res.status(404).json({ error: "Request not found" });
    if (joinReq.status !== "pending") {
      return res.status(400).json({ error: `Request already ${joinReq.status}` });
    }

    joinReq.status = "rejected";
    await joinReq.save();

    res.json({ message: "Request rejected" });
  } catch (error) {
    console.error("Error rejecting invite request:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
